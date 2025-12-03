# backend/app/services/resume_parser.py
import os
import re
import json
import requests
from typing import List, Dict, Optional

# local skill list — extend to improve matching
SKILL_KEYWORDS = [
    "python", "java", "c++", "pytorch", "tensorflow", "sklearn", "react", "node", "docker",
    "kubernetes", "nlp", "transformers", "sql", "postgres", "aws", "gcp", "azure"
]

# env-driven AI endpoint + key (optional)
GOOGLE_API_URL = os.environ.get("GOOGLE_AI_API_URL")
GOOGLE_API_KEY = os.environ.get("GOOGLE_AI_API_KEY")
# Some setups expect Bearer auth, others x-api-key. Use BEARER if set to "1"
USE_BEARER = os.environ.get("GOOGLE_AI_USE_BEARER", "1") == "1"


def extract_skills(resume_text: str) -> List[str]:
    """Very simple keyword matching for skills from resume text."""
    txt = resume_text.lower()
    found = []
    for skill in SKILL_KEYWORDS:
        if re.search(r"\b" + re.escape(skill.lower()) + r"\b", txt):
            found.append(skill)
    return found


def _call_google_api(prompt: str, max_tokens: int = 300) -> Optional[str]:
    """
    Generic call to Google AI Studio / Generative endpoint.
    IMPORTANT: you may need to adjust headers and payload for the exact API/version you have.
    This uses Authorization: Bearer <KEY> by default; if that doesn't match your setup,
    set GOOGLE_AI_USE_BEARER=0 and the code will send x-api-key header instead.
    """
    if not GOOGLE_API_URL or not GOOGLE_API_KEY:
        return None

    headers = {}
    if USE_BEARER:
        headers["Authorization"] = f"Bearer {GOOGLE_API_KEY}"
    else:
        headers["x-api-key"] = GOOGLE_API_KEY

    payload = {
        "prompt": prompt,
        "max_output_tokens": max_tokens,
        # NOTE: specific param names vary between Google endpoints; adjust if necessary.
    }

    try:
        resp = requests.post(GOOGLE_API_URL, headers=headers, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        # Response shape varies by API. Attempt common fields:
        # - data["candidates"][0]["output"]  (some GA APIs)
        # - data["output"] or data["generated_text"]
        # - Adjust based on the API you have
        # Try a few common keys:
        for key in ("candidates", "output", "generated_text", "text", "response"):
            if key in data:
                val = data[key]
                # if candidates list:
                if isinstance(val, list) and len(val) > 0 and isinstance(val[0], dict):
                    # common nested location
                    for sub in ("output", "content", "text"):
                        if sub in val[0]:
                            return val[0][sub]
                    # fallback to first candidate printed as string:
                    return json.dumps(val[0])
                # if string:
                if isinstance(val, str):
                    return val
        # fallback: try entire json as text
        return json.dumps(data)
    except Exception as e:
        # Log or print — but don't crash; fallback will be used
        print("Google AI call failed:", e)
        return None


def generate_resume_questions(resume_text: str, domain: str = None, max_questions: int = 3) -> List[Dict]:
    """
    Returns a list of question dicts based on the resume content.
    Attempts to use Google AI Studio if config exists; otherwise uses templates.
    """
    resume_text = (resume_text or "").strip()
    skills = extract_skills(resume_text)

    # Try LLM-based generation if KEY and URL provided
    if GOOGLE_API_KEY and GOOGLE_API_URL and resume_text:
        prompt = (
            "You are an interview question generator. Given the resume text and domain, "
            "produce up to {n} focused interview questions that probe the candidate's "
            "projects, skills, and depth of understanding. Return results as JSON array with fields "
            "'id' (short), 'text'.\n\n"
            "Domain: {domain}\n\nResume:\n{resume}\n\n"
            "Output only valid JSON array."
        ).format(n=max_questions, domain=(domain or "general"), resume=resume_text)

        ai_out = _call_google_api(prompt)
        if ai_out:
            # Try to parse JSON from the output
            try:
                parsed = json.loads(ai_out)
                # normalize results
                out = []
                for i, item in enumerate(parsed[:max_questions]):
                    if isinstance(item, str):
                        out.append({"id": f"r-{i}", "text": item, "type": "resume"})
                    elif isinstance(item, dict) and "text" in item:
                        out.append({"id": item.get("id", f"r-{i}"), "text": item["text"], "type": "resume"})
                if out:
                    return out
            except Exception as e:
                # If JSON parsing failed, but we got a plain string with lines, convert lines to questions
                lines = [l.strip("- \n") for l in (ai_out or "").splitlines() if l.strip()]
                if lines:
                    out = []
                    for i, l in enumerate(lines[:max_questions]):
                        out.append({"id": f"r-{i}", "text": l, "type": "resume"})
                    return out

    # Fallback heuristics: generate templated questions from skills / simple templates
    out = []
    if skills:
        for i, s in enumerate(skills[:max_questions]):
            out.append({
                "id": f"resume-skill-{i}",
                "text": f"You listed experience with {s}. Describe one project where you used {s} — your role, technical choices, and outcome.",
                "type": "resume"
            })

    # If still not enough, use generic project templates (extract first sentence/project-like phrases)
    if len(out) < max_questions and resume_text:
        # naive project extraction: sentences with capitalized words + 'project' or ':' or '-'
        sentences = re.split(r'[\.\n]+', resume_text)
        project_like = [s.strip() for s in sentences if len(s.strip()) > 20][:max_questions]
        for i, s in enumerate(project_like):
            if len(out) >= max_questions:
                break
            out.append({
                "id": f"resume-proj-{i}",
                "text": f"I see: \"{s[:120]}\" — can you explain this project and your contributions?",
                "type": "resume"
            })

    # final fallback: generic resume prompt
    while len(out) < max_questions:
        out.append({
            "id": f"resume-fallback-{len(out)}",
            "text": "Tell me about a project listed on your resume and the technical challenges you encountered.",
            "type": "resume"
        })

    return out
