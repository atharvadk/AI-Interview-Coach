from transformers import pipeline

# Force PyTorch backend with framework="pt"
classifier = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english",
    framework="pt"  # use PyTorch instead of TensorFlow
)

# Example transcript from Whisper
transcript = [
    "Hello, this is the Whisperer recording.",
    "What will be?",
    "No."
]

# Analyze sentiment line by line
for line in transcript:
    result = classifier(line)
    print(f"Text: {line}")
    print(f"Sentiment: {result[0]['label']}, Score: {result[0]['score']:.2f}\n")

# Optional: batch processing (faster for multiple lines)
# results = classifier(transcript, batch_size=8)
# for line, res in zip(transcript, results):
#     print(line, res)
