# backend/app/services/gemini_client.py
import os
import logging

try:
    import google.generativeai as genai
except Exception:
    genai = None

logger = logging.getLogger(__name__)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Only configure if lib available and key present
if genai and GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        _MODEL = genai.GenerativeModel("gemini-pro")
        _ENABLED = True
    except Exception as e:
        logger.exception("Failed to configure Gemini client, disabling it.")
        _MODEL = None
        _ENABLED = False
else:
    if not genai:
        logger.warning("google-generativeai library not installed — Gemini disabled.")
    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY missing — Gemini disabled.")
    _MODEL = None
    _ENABLED = False


def generate_similar_questions(prompt_text: str, count: int = 3):
    """
    If Gemini disabled, returns an empty list immediately or some simple fallbacks.
    """
    if not _ENABLED:
        # provide simple, deterministic fallbacks to avoid failures
        base = prompt_text.splitlines()[:3]
        # return lightweight paraphrases as fallback (or empty)
        return [f"Follow-up: {b}" for b in base][:count]

    try:
        prompt = f"""Generate {count} short interview questions similar to these examples:
{prompt_text}

Return them as plain lines, one question per line."""
        resp = _MODEL.generate_content(prompt)
        text = getattr(resp, "text", "") or str(resp)
        questions = [line.lstrip("- ").strip() for line in text.splitlines() if line.strip()]
        return questions[:count]
    except Exception:
        logger.exception("Gemini generation failed; returning fallback.")
        return []
