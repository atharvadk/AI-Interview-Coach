from fastapi import APIRouter, UploadFile, File
from app.services.audio_processing import split_audio, transcribe_chunks
from app.services.analysis import analyze_emotions, aggregate_emotions, generate_feedback

router = APIRouter()

@router.post("/feedback/analyze")
async def analyze_feedback(audio: UploadFile = File(...)):
    """
    Endpoint: Upload audio → split into chunks → transcribe → analyze → feedback.
    """
    file_path = f"uploads/{audio.filename}"
    with open(file_path, "wb") as f:
        f.write(await audio.read())

    # Step 1: Split into 30s chunks
    chunks = split_audio(file_path)

    # Step 2: Transcribe each chunk
    transcripts = transcribe_chunks(chunks)
    full_transcript = " ".join(transcripts)

    # Step 3: Run emotion analysis
    chunk_results = analyze_emotions(transcripts)
    emotions = aggregate_emotions(chunk_results)

    # Step 4: Generate structured feedback
    feedback = generate_feedback(full_transcript, emotions)

    return feedback
