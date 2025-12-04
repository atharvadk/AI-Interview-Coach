import random
from app.services.gemini_client import generate_similar_questions

GENERAL_QUESTIONS = [
    {"id": "g-1", "text": "Tell me about yourself.", "type": "general"},
    {"id": "g-2", "text": "What are your strengths and weaknesses?", "type": "general"},
    {"id": "g-3", "text": "Why do you want to work here?", "type": "general"},
    {"id": "g-4", "text": "Describe a time you showed leadership.", "type": "general"},
    {"id": "g-5", "text": "How do you handle tight deadlines?", "type": "general"},
]

DOMAIN_QUESTION_BANK = [
    {"id": "ai-1", "domain": "ai-ml", "text": "Explain the bias-variance tradeoff.", "type": "domain"},
    {"id": "ai-2", "domain": "ai-ml", "text": "How do you handle class imbalance in datasets?", "type": "domain"},
    {"id": "ai-3", "domain": "ai-ml", "text": "Describe a recent ML project you worked on.", "type": "domain"},

    {"id": "fs-1", "domain": "fullstack", "text": "Explain how REST APIs differ from GraphQL.", "type": "domain"},
    {"id": "fs-2", "domain": "fullstack", "text": "How do you ensure frontend performance?", "type": "domain"},
    {"id": "fs-3", "domain": "fullstack", "text": "Describe a deployment pipeline you built.", "type": "domain"},
]

def sample_general(n=3, ai_generated=2):
    """
    Returns fixed sampled + AI-generated similar questions.
    """
    fixed = random.sample(GENERAL_QUESTIONS, min(n, len(GENERAL_QUESTIONS)))

    # Prepare prompt examples
    example_text = "\n".join([q["text"] for q in fixed])

    generated = generate_similar_questions(example_text, ai_generated)

    generated_formatted = [
        {"id": f"g-ai-{i}", "text": q, "type": "general-ai"}
        for i, q in enumerate(generated, 1)
    ]

    return fixed + generated_formatted


def sample_domain(domain: str, n=3, ai_generated=2):
    """
    Returns fixed sampled + AI-generated domain-specific questions.
    """
    filtered = [q for q in DOMAIN_QUESTION_BANK if q["domain"] == domain]
    if not filtered:
        filtered = DOMAIN_QUESTION_BANK  # fallback

    fixed = random.sample(filtered, min(n, len(filtered)))

    # Example text from domain questions
    example_text = "\n".join([q["text"] for q in fixed])

    generated = generate_similar_questions(example_text, ai_generated)

    generated_formatted = [
        {"id": f"{domain}-ai-{i}", "domain": domain, "text": q, "type": "domain-ai"}
        for i, q in enumerate(generated, 1)
    ]

    return fixed + generated_formatted

