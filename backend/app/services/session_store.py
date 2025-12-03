# backend/app/services/session_store.py

"""
A simple in-memory session store for interview sessions.
This is NOT persistent — restart backend = all sessions reset.
Replace later with MongoDB/Postgres.
"""

import uuid
from datetime import datetime


# Global in-memory storage
_SESSIONS = {}  # session_id → session_object


def create_session(user_id=None, title="Interview Session", questions=None):
    """
    Create a new interview session.
    questions = list of { id, text, type, domain }
    """
    session_id = str(uuid.uuid4())

    session_obj = {
        "id": session_id,
        "user_id": user_id,
        "title": title,
        "questions": questions or [],
        "chunks": {},      # question_id → list of chunk feedback
        "created_at": datetime.utcnow().isoformat(),
        "completed": False,
        "aggregated_feedback": None,
    }

    _SESSIONS[session_id] = session_obj
    return session_obj


def get_session(session_id):
    """Return session object or None."""
    return _SESSIONS.get(session_id)


def add_chunk_feedback(session_id, question_id, chunk_feedback):
    """
    Insert chunk-level feedback.
    chunk_feedback = {
        "chunk_index": int,
        "transcript": str,
        "emotions": {},
        "scores": {},
    }
    """
    session = _SESSIONS.get(session_id)
    if not session:
        raise ValueError("Session not found")

    if question_id not in session["chunks"]:
        session["chunks"][question_id] = []

    session["chunks"][question_id].append(chunk_feedback)
    return True


def complete_session(session_id, aggregated_feedback):
    """
    Mark session as completed and store aggregated feedback.
    aggregated_feedback = dict returned by your feedback/analyze + aggregator
    """
    session = _SESSIONS.get(session_id)
    if not session:
        raise ValueError("Session not found")

    session["completed"] = True
    session["aggregated_feedback"] = aggregated_feedback
    session["completed_at"] = datetime.utcnow().isoformat()
    return session


def list_sessions():
    """Debug helper — list all sessions."""
    return list(_SESSIONS.values())
