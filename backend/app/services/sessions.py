# backend/app/routes/sessions.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
from app.services import session_store
from app.services import question_bank
from app.services.resume_parser import generate_resume_questions

router = APIRouter(prefix="/sessions", tags=["sessions"])

class CreateSessionBody(BaseModel):
    user_id: Optional[str] = None
    title: Optional[str] = "Interview Session"
    domain: Optional[str] = None
    resume_text: Optional[str] = None
    num_general: Optional[int] = 3
    num_domain: Optional[int] = 3
    num_resume: Optional[int] = 3

@router.post("", status_code=201)
def create_session(body: CreateSessionBody):
    # 1) compose question list
    general = question_bank.sample_general(n=body.num_general)
    domain_questions = []
    if body.domain:
        domain_questions = question_bank.sample_domain(body.domain, n=body.num_domain)
    else:
        # if no domain choose domain questions as a mixed sample
        domain_questions = question_bank.sample_domain(None, n=body.num_domain)

    resume_based = []
    if body.resume_text:
        resume_based = generate_resume_questions(body.resume_text, domain=body.domain, max_questions=body.num_resume)

    # normalize questions array (keep order: general, domain, resume)
    questions = []
    for q in general + domain_questions + resume_based:
        # ensure each question dict has id and text
        questions.append({
            "id": str(q.get("id") or q.get("text")[:20]),
            "text": q.get("text"),
            "type": q.get("type", "domain"),
            "domain": q.get("domain", None)
        })

    # 2) create session in store and attach questions
    sess = session_store.create_session(user_id=body.user_id, title=body.title, questions=questions)

    return {"id": sess["id"], "questions": questions}
