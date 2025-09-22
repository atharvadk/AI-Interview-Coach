import streamlit as st
from transformers import pipeline

# -------------------------------
# Initialize multi-emotion classifier
# -------------------------------
@st.cache_resource  # cache so the model loads only once
def load_model():
    return pipeline(
        "text-classification",
        model="SamLowe/roberta-base-go_emotions",
        return_all_scores=True,  # important for multi-label
        framework="pt"  # force PyTorch
    )

classifier = load_model()

# -------------------------------
# Streamlit App
# -------------------------------
st.title("🎤 AI Interview Coach - Multi-Emotion Analysis")

# Text input for testing
user_input = st.text_area("Paste Whisper transcript here:")

if st.button("Analyze Emotions") and user_input:
    results = classifier(user_input)

    # results is a list of dicts; we take the first element
    emotion_scores = results[0]

    # Convert to dict for easy sorting/display
    scores_dict = {item['label']: item['score'] for item in emotion_scores}
    
    # Sort emotions by score descending
    sorted_emotions = dict(sorted(scores_dict.items(), key=lambda x: x[1], reverse=True))

    st.subheader("Predicted Emotions:")
    for emotion, score in sorted_emotions.items():
        st.write(f"{emotion}: {score:.2f}")

    # Optional: bar chart
    st.subheader("Emotion Confidence Chart")
    st.bar_chart(list(sorted_emotions.values()), use_container_width=True, height=300)
