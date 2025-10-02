from pydub import AudioSegment
import whisper

# Load Whisper model once when the service starts
whisper_model = whisper.load_model("base")

def split_audio(file_path, chunk_length=30_000):  
    """
    Splits audio file into chunks of given length (default: 30s).
    Returns list of chunk file paths.
    """
    audio = AudioSegment.from_file(file_path)
    chunks = []
    for i in range(0, len(audio), chunk_length):
        chunk = audio[i:i+chunk_length]
        chunk_path = f"{file_path}_chunk_{i//chunk_length}.wav"
        chunk.export(chunk_path, format="wav")
        chunks.append(chunk_path)
    return chunks


def transcribe_chunk(chunk_path: str) -> str:
    """
    Transcribes a single audio chunk using Whisper.
    """
    result = whisper_model.transcribe(chunk_path)
    return result["text"]


def transcribe_chunks(chunk_paths: list) -> list:
    """
    Transcribes multiple audio chunks and returns list of transcripts.
    """
    transcripts = []
    for chunk in chunk_paths:
        text = transcribe_chunk(chunk)
        transcripts.append(text)
    return transcripts
