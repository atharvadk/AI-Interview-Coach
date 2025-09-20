import streamlit as st
import sounddevice as sd
import soundfile as sf
import numpy as np
import whisper
import os

# Load Whisper model once
model = whisper.load_model("tiny")
SAMPLE_RATE = 16000
CHUNK_SIZE = 30  # seconds per chunk

st.title("Whisper Recorder")

duration = st.number_input("Recording duration (seconds)", min_value=10, value=30)

if st.button("Record Audio"):
    st.info("Recording...")

    total_samples = int(duration * SAMPLE_RATE)
    chunk_samples = CHUNK_SIZE * SAMPLE_RATE

    # Record full audio in one go (like your version)
    audio_data = sd.rec(total_samples, samplerate=SAMPLE_RATE, channels=1, dtype='float32')
    sd.wait()
    st.success("Recording finished!")

    # Flatten
    audio_data = audio_data[:, 0]

    transcript = ""

    # Process in chunks
    for i in range(0, len(audio_data), chunk_samples):
        chunk = audio_data[i:i+chunk_samples]
        filename = f"temp_chunk_{i//chunk_samples}.wav"
        sf.write(filename, chunk, SAMPLE_RATE)

        result = model.transcribe(filename, fp16=False)
        transcript += " " + result.get("text", "")

        os.remove(filename)  # cleanup

    # Show combined transcript
    st.text_area("Transcript:", value=transcript.strip(), height=300)
