# backend/app/services/audio_processing.py
import os
import subprocess
import math
import uuid
from typing import List

BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # .../app/services
UPLOADS_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "..", "uploads"))
os.makedirs(UPLOADS_DIR, exist_ok=True)

# If you have a whisper wrapper already, import here in functions (lazy import)
# Example: from app.services.whisper_wrapper import transcribe_file

def _ffmpeg_split_into_chunks(src_path: str, chunk_seconds: int = 30) -> List[str]:
    """
    Split src_path into multiple chunk files using ffmpeg.
    Returns list of absolute file paths.
    """
    if not os.path.exists(src_path):
        raise FileNotFoundError(src_path)

    # Get duration using ffprobe (ffmpeg)
    try:
        probe = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of",
             "default=noprint_wrappers=1:nokey=1", src_path],
            capture_output=True, text=True, check=True
        )
        duration = float(probe.stdout.strip())
    except Exception:
        # fallback: try using ffmpeg -i and parse; but raise if not possible
        raise RuntimeError("ffprobe failed, ensure ffmpeg is installed and on PATH")

    num_chunks = math.ceil(duration / chunk_seconds)
    out_files = []

    for i in range(num_chunks):
        start = i * chunk_seconds
        out_name = f"{uuid.uuid4().hex}_chunk_{i}.wav"
        out_path = os.path.join(UPLOADS_DIR, out_name)
        # ffmpeg: -ss start -t chunk_seconds -i input -ar 16000 -ac 1 -y out_path
        cmd = [
            "ffmpeg", "-y",
            "-ss", str(start),
            "-t", str(chunk_seconds),
            "-i", src_path,
            "-ar", "16000", "-ac", "1",
            out_path
        ]
        # run ffmpeg
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        out_files.append(out_path)

    return out_files

def split_audio(file_path: str, chunk_seconds: int = 30) -> List[str]:
    """
    Public function used by your routes. Splits `file_path` into 30s WAV chunks.
    Returns list of chunk file paths.
    """
    return _ffmpeg_split_into_chunks(file_path, chunk_seconds=chunk_seconds)


# Example transcribe wrapper (lazy whisper import)
def transcribe_chunk(chunk_path: str) -> str:
    """
    Transcribe a single chunk. Uses whisper (openai-whisper) if available.
    Returns transcript string.
    """
    try:
        # Lazy import to avoid heavy imports at module import time
        import whisper
    except Exception:
        # If whisper isn't installed, raise helpful error
        raise RuntimeError("whisper not available in backend venv. Install openai-whisper or adjust transcribe_chunk.")

    # Load model once per process (cache on module)
    global _whisper_model
    try:
        _whisper_model
    except NameError:
        _whisper_model = whisper.load_model("small")  # or use desired model
    result = _whisper_model.transcribe(chunk_path)
    text = result.get("text", "").strip()
    return text
