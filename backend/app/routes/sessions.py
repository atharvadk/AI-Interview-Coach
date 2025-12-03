# backend/app/routes/sessions.py
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, Dict, Any
import re

from app.services import session_store
from app.services import question_bank
from app.services.resume_parser import generate_resume_questions

router = APIRouter(prefix="/sessions", tags=["sessions"])


class CreateSessionBody(BaseModel):
    user_id: Optional[str] = None
    title: Optional[str] = "Interview Session"
    domain: Optional[str] = None
    resume_text: Optional[str] = None
    resume_file_path: Optional[str] = None
    num_general: Optional[int] = 3
    num_domain: Optional[int] = 3
    num_resume: Optional[int] = 3


# -------------------------
# Create session endpoint
# -------------------------
@router.post("", status_code=201)
def create_session(body: CreateSessionBody):
    """
    Create a new interview session.
    - body.domain (optional) selects domain-specific questions
    - body.resume_text or body.resume_file_path (optional) used for resume-based questions
    Returns: { id, questions }
    """
    # 1) compose question list
    general = question_bank.sample_general(n=body.num_general)
    domain_questions = question_bank.sample_domain(body.domain, n=body.num_domain)
    resume_based = []

    if body.resume_text or body.resume_file_path:
        # Prefer resume_text; if only a file path is provided it could be read server-side (not implemented here).
        resume_text_to_use = body.resume_text or ""
        if body.resume_file_path and not resume_text_to_use:
            # Optional: attempt to read text from server-accessible path.
            try:
                import pathlib
                p = pathlib.Path(body.resume_file_path)
                if p.exists() and p.suffix.lower() in {".txt", ".md"}:
                    resume_text_to_use = p.read_text(encoding="utf-8", errors="ignore")
            except Exception:
                resume_text_to_use = ""

        resume_based = generate_resume_questions(resume_text_to_use, domain=body.domain, max_questions=body.num_resume)

    # Normalize and combine questions (general -> domain -> resume)
    questions = []
    for q in (general + domain_questions + resume_based):
        questions.append({
            "id": str(q.get("id") or q.get("text")[:24]).replace(" ", "-"),
            "text": q.get("text"),
            "type": q.get("type", "domain"),
            "domain": q.get("domain", None)
        })

    # 2) create session and store questions in session store
    sess = session_store.create_session(user_id=body.user_id, title=body.title, questions=questions)
    return {"id": sess["id"], "questions": questions}


# -------------------------
# Get session endpoint
# -------------------------
@router.get("/{session_id}")
def get_session(session_id: str):
    """
    Retrieve a session by id (includes questions, chunks, and meta/aggregated if present).
    """
    sess = session_store.get_session(session_id)
    if not sess:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return sess


# -------------------------
# Helpers for aggregation
# -------------------------
FILLER_WORDS = {"um", "uh", "like", "you know", "so", "actually", "basically", "right", "okay", "ok"}


def _words_and_filler_stats(text: str):
    if not text:
        return {"words": 0, "filler_count": 0, "filler_ratio": 0.0}
    words = re.findall(r"\w+", text.lower())
    total = len(words)
    filler_count = sum(1 for w in words if w in FILLER_WORDS)
    filler_ratio = (filler_count / total) if total > 0 else 0.0
    return {"words": total, "filler_count": filler_count, "filler_ratio": filler_ratio}


def _estimate_clarity_from_transcript(transcript: str) -> float:
    """Estimate clarity 0..1 based on filler_ratio (simple heuristic)."""
    stats = _words_and_filler_stats(transcript)
    filler = stats["filler_ratio"]
    # heuristic: clarity declines with filler. clamp to [0,1]
    clarity = max(0.0, min(1.0, 1.0 - (filler * 2.0)))
    return clarity


def _estimate_confidence_from_emotions(emotions: Dict[str, float]) -> Optional[float]:
    """
    Estimate confidence from emotion scores (if available).
    Uses 'joy' and 'neutral' positively, and 'sadness'/'fear'/'anger' negatively.
    Returns 0..1 or None if not computable.
    """
    if not emotions or not isinstance(emotions, dict):
        return None
    joy = emotions.get("joy", 0.0)
    neutral = emotions.get("neutral", 0.0)
    sadness = emotions.get("sadness", 0.0)
    fear = emotions.get("fear", 0.0)
    anger = emotions.get("anger", 0.0)
    positive = joy + neutral
    negative = sadness + fear + anger
    raw = positive - negative
    conf = max(0.0, min(1.0, (raw + 1.0) / 2.0))
    return conf


# -------------------------
# Complete session endpoint (aggregate)
# -------------------------
@router.post("/{session_id}/complete")
def complete_session(session_id: str):
    """
    Aggregate chunk-level feedback into per-question and overall metrics,
    persist aggregated results in session_store, and return the aggregated report.
    """
    sess = session_store.get_session(session_id)
    if not sess:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    chunks = sess.get("chunks", [])  # each chunk: {question_id, chunk_index, feedback, ts}

    # Group chunks by question_id
    questions_map = {}
    for c in chunks:
        qid = str(c.get("question_id"))
        questions_map.setdefault(qid, []).append(c)

    question_reports: Dict[str, Any] = {}
    overall_clarity_acc = 0.0
    overall_confidence_acc = 0.0
    clarity_count = 0
    confidence_count = 0

    for qid, qchunks in questions_map.items():
        clarity_vals = []
        confidence_vals = []
        transcripts = []
        emotions_agg = {}

        for c in qchunks:
            fb = c.get("feedback") or {}
            transcript = fb.get("transcript") or ""
            transcripts.append({"chunk_index": c.get("chunk_index"), "text": transcript})

            # clarity: use provided score, else estimate
            if isinstance(fb.get("clarity_score"), (int, float)):
                clarity = float(fb.get("clarity_score"))
            else:
                clarity = _estimate_clarity_from_transcript(transcript)
            clarity_vals.append(clarity)

            # confidence: use provided, else estimate from emotions or fallback to neutral
            if isinstance(fb.get("confidence_score"), (int, float)):
                conf = float(fb.get("confidence_score"))
            else:
                emotions = fb.get("emotions") or {}
                conf = _estimate_confidence_from_emotions(emotions)
                if conf is None:
                    conf = 0.5
            confidence_vals.append(conf)

            # accumulate emotion averages per label
            emotions = fb.get("emotions") or {}
            for k, v in (emotions.items() if isinstance(emotions, dict) else []):
                emotions_agg.setdefault(k, []).append(float(v))

        # compute averages
        avg_clarity = sum(clarity_vals) / len(clarity_vals) if clarity_vals else None
        avg_confidence = sum(confidence_vals) / len(confidence_vals) if confidence_vals else None

        # avg emotions
        avg_emotions = {k: (sum(vs) / len(vs)) for k, vs in emotions_agg.items()} if emotions_agg else {}

        # question performance metric (0..100)
        question_performance = round(avg_clarity * 100) if avg_clarity is not None else None

        # recommendations
        recs = []
        if avg_clarity is not None and avg_clarity < 0.6:
            recs.append("Reduce filler words and pause to form clearer sentences.")
        if avg_confidence is not None and avg_confidence < 0.6:
            recs.append("Practice speaking with more confidence — mock interviews help.")
        if avg_emotions:
            if avg_emotions.get("sadness", 0) > 0.4 or avg_emotions.get("fear", 0) > 0.4:
                recs.append("Try to convey more positive energy — highlight accomplishments.")
            if avg_emotions.get("joy", 0) > 0.6:
                recs.append("Good expressiveness — maintain this energy.")

        question_reports[qid] = {
            "question_id": qid,
            "chunks": qchunks,
            "transcripts": transcripts,
            "avg_clarity": avg_clarity,
            "avg_confidence": avg_confidence,
            "avg_emotions": avg_emotions,
            "question_performance": question_performance,
            "recommendations": recs
        }

        if avg_clarity is not None:
            overall_clarity_acc += avg_clarity
            clarity_count += 1
        if avg_confidence is not None:
            overall_confidence_acc += avg_confidence
            confidence_count += 1

    overall = {
        "avg_clarity": (overall_clarity_acc / clarity_count) if clarity_count else None,
        "avg_confidence": (overall_confidence_acc / confidence_count) if confidence_count else None,
        "recommendations": []
    }

    # Collect unique recommendations
    all_recs = []
    for qid, qr in question_reports.items():
        all_recs.extend(qr.get("recommendations", []))
    seen = set()
    uniq_recs = []
    for r in all_recs:
        if r not in seen:
            seen.add(r)
            uniq_recs.append(r)
    overall["recommendations"] = uniq_recs

    aggregated = {
        "session_id": session_id,
        "questions": question_reports,
        "overall": overall,
    }

    # Persist aggregated results in session store
    try:
        session_store.complete_session(session_id, aggregated=aggregated)
    except Exception:
        # Best-effort fallback: write aggregated into sessions.json if possible
        s = session_store.get_session(session_id)
        if s:
            s_meta = s.get("meta", {})
            s_meta["aggregated"] = aggregated
            s["meta"] = s_meta
            try:
                if hasattr(session_store, "_read_all") and hasattr(session_store, "_write_all"):
                    all_sess = session_store._read_all()
                    all_sess[session_id]["meta"]["aggregated"] = aggregated
                    session_store._write_all(all_sess)
            except Exception:
                pass

    return aggregated
