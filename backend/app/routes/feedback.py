# backend/app/routes/feedback.py
import os
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from fastapi.responses import JSONResponse

from app.services import session_store

router = APIRouter(tags=["feedback"])

# ensure uploads directory exists
UPLOADS_DIR = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "uploads"))
os.makedirs(UPLOADS_DIR, exist_ok=True)


@router.post("/feedback/analyze")
async def analyze_feedback(
    audio: UploadFile = File(...),
    session_id: str = Form(...),
    question_id: str = Form(...),
    chunk_index: int = Form(...),
    chunk_start_time: Optional[int] = Form(None),
    chunk_end_time: Optional[int] = Form(None),
):
    """
    Endpoint for uploading one audio chunk (browser chunk).
    Expects multipart/form-data with:
      - audio (file)
      - session_id (str)
      - question_id (str)
      - chunk_index (int)
      - optional chunk_start_time / chunk_end_time (ms)

    Returns:
      feedback JSON (transcript, clarity_score, confidence_score, emotions)
    """

    # 1) Basic validation: session must exist
    sess = session_store.get_session(session_id)
    if not sess:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    # 2) Save uploaded file to uploads dir
    try:
        ext = os.path.splitext(audio.filename)[1] or ".webm"
        fname = f"{uuid.uuid4().hex}{ext}"
        dest_path = os.path.join(UPLOADS_DIR, fname)
        with open(dest_path, "wb") as f:
            contents = await audio.read()
            f.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed saving upload: {e}")

    # 3) Transcribe the chunk (lazy import of audio_processing)
    transcript = ""
    try:
        from app.services.audio_processing import transcribe_chunk
        transcript = transcribe_chunk(dest_path)
    except Exception as e:
        # transcription failed — keep transcript empty but continue storing file
        transcript = ""
        # don't raise; we want to return something to frontend. Log the error.
        # If you want transcription to be mandatory, raise HTTPException here.
        print("transcription error:", e)

    # 4) Run analysis on transcript (try multiple available functions)
    analysis_result = {}
    try:
        import app.services.analysis as analysis
    except Exception:
        analysis = None

    clarity_score = None
    confidence_score = None
    emotions = {}

    if analysis:
        # prefer analyze_text (single-text API)
        try:
            if hasattr(analysis, "analyze_text"):
                # analyze_text should return dict with keys: emotions, clarity_score, confidence_score
                analysis_result = analysis.analyze_text(transcript)
            elif hasattr(analysis, "analyze_emotions"):
                # some modules return emotions only
                analysis_result = analysis.analyze_emotions([transcript])  # may return list
                # normalize if list
                if isinstance(analysis_result, list) and analysis_result:
                    analysis_result = analysis_result[0]
            elif hasattr(analysis, "analyze_chunks"):
                # analyze_chunks may accept list
                analysis_result = analysis.analyze_chunks([transcript])[0]
        except Exception as e:
            # analysis may fail for many reasons (model not loaded, etc.)
            print("analysis error:", e)
            analysis_result = {}

    # Map results to fields (robust)
    if isinstance(analysis_result, dict):
        emotions = analysis_result.get("emotions") or analysis_result.get("emotion") or {}
        clarity_score = analysis_result.get("clarity_score") or analysis_result.get("clarity")
        confidence_score = analysis_result.get("confidence_score") or analysis_result.get("confidence")

    # If analysis didn't give us scores, attempt simple heuristics:
    if clarity_score is None:
        # simple filler-word heuristic (very rough, 0..1)
        try:
            words = transcript.lower().split()
            fillers = {"um", "uh", "like", "so", "actually", "basically", "right", "okay", "ok", "you", "know"}
            filler_count = sum(1 for w in words if w in fillers)
            clarity_score = max(0.0, 1.0 - (filler_count / max(1, len(words))) * 2.0) if words else 0.0
        except Exception:
            clarity_score = 0.0

    if confidence_score is None:
        # attempt simple confidence estimate from emotions if available
        try:
            joy = float(emotions.get("joy", 0.0)) if isinstance(emotions, dict) else 0.0
            neutral = float(emotions.get("neutral", 0.0)) if isinstance(emotions, dict) else 0.0
            sadness = float(emotions.get("sadness", 0.0)) if isinstance(emotions, dict) else 0.0
            raw = (joy + neutral) - sadness
            confidence_score = max(0.0, min(1.0, (raw + 1.0) / 2.0))
        except Exception:
            confidence_score = 0.5

    # 5) Build feedback object
    feedback = {
        "transcript": transcript,
        "clarity_score": float(clarity_score) if clarity_score is not None else None,
        "confidence_score": float(confidence_score) if confidence_score is not None else None,
        "emotions": emotions or {},
        "audio_path": f"/uploads/{fname}",
        "processed_at": datetime.utcnow().isoformat() + "Z",
    }

    # 6) Persist chunk feedback to session_store
    try:
        chunk_feedback = {
            "chunk_index": int(chunk_index),
            "chunk_start_time": int(chunk_start_time) if chunk_start_time is not None else None,
            "chunk_end_time": int(chunk_end_time) if chunk_end_time is not None else None,
            "feedback": feedback,
            "saved_at": datetime.utcnow().isoformat() + "Z",
        }
        # session_store.add_chunk_feedback expects (session_id, question_id, chunk_feedback)
        session_store.add_chunk_feedback(session_id, question_id, chunk_feedback)
    except Exception as e:
        # Don't fail the request if store write fails, but log and return 500
        print("session_store.add_chunk_feedback error:", e)
        raise HTTPException(status_code=500, detail=f"Failed to persist chunk feedback: {e}")

    # 7) Return feedback JSON to caller
    return JSONResponse(status_code=200, content=feedback)
