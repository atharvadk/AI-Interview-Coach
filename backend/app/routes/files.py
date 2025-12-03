# backend/app/routes/files.py
import os
import uuid
from typing import Optional

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse

# import config (safe, no circular import)
from ..config import UPLOADS_DIR

router = APIRouter(prefix="/files", tags=["files"])

def _safe_filename(session_id: Optional[str], question_id: Optional[str], chunk_index: Optional[str], original_filename: str):
    ext = os.path.splitext(original_filename)[1] or ".bin"
    sid = session_id or "nosession"
    qid = question_id or "noquestion"
    idx = chunk_index or "0"
    uid = uuid.uuid4().hex[:8]
    return f"{sid}__{qid}__chunk{idx}__{uid}{ext}"

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    session_id: Optional[str] = Form(None),
    question_id: Optional[str] = Form(None),
    chunk_index: Optional[str] = Form(None),
):
    if file is None:
        raise HTTPException(status_code=400, detail="No file uploaded")

    os.makedirs(UPLOADS_DIR, exist_ok=True)

    filename = _safe_filename(session_id, question_id, chunk_index, file.filename or "upload.bin")
    dest_path = os.path.join(UPLOADS_DIR, filename)

    try:
        with open(dest_path, "wb") as dest:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                dest.write(chunk)
    except Exception as exc:
        try:
            if os.path.exists(dest_path):
                os.remove(dest_path)
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=f"Failed to save file: {exc}")

    file_url = f"/uploads/{filename}"
    return JSONResponse({"status": "ok", "file_url": file_url, "session_id": session_id, "question_id": question_id, "chunk_index": chunk_index})
