from transformers import pipeline

# Load emotion model once
emotion_model = pipeline(
    "text-classification",
    model="SamLowe/roberta-base-go_emotions",
    return_all_scores=True
)

def analyze_emotions(transcripts: list) -> list:
    """
    Runs emotion analysis on each transcript chunk.
    Returns list of per-chunk results.
    """
    chunk_results = []
    for text in transcripts:
        if len(text.strip()) == 0:
            continue
        scores = emotion_model(text[:512])  # avoid very long input
        chunk_results.append(scores[0])
    return chunk_results


def aggregate_emotions(chunk_results: list) -> dict:
    """
    Aggregates per-chunk emotion results into overall averages.
    """
    emotion_totals = {}
    num_chunks = len(chunk_results)

    for result in chunk_results:
        for emo in result:
            label = emo['label']
            score = emo['score']
            emotion_totals[label] = emotion_totals.get(label, 0) + score

    # Normalize to averages
    for label in emotion_totals:
        emotion_totals[label] /= num_chunks

    return emotion_totals


def generate_feedback(transcript: str, emotions: dict) -> dict:
    """
    Generates final feedback JSON including filler words, clarity, confidence.
    """
    filler_words = ["um", "uh", "like"]
    words = transcript.lower().split()
    filler_count = {fw: words.count(fw) for fw in filler_words}

    clarity_score = 1 - (sum(filler_count.values()) / len(words)) if words else 0
    confidence_score = emotions.get("joy", 0) - emotions.get("anxiety", 0)

    return {
        "transcript": transcript,
        "emotions": emotions,
        "filler_words": filler_count,
        "clarity_score": round(clarity_score, 2),
        "confidence_score": round(confidence_score, 2),
        "recommendations": "Try to reduce filler words and maintain steady tone."
    }
