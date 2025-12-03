# backend/app/services/question_bank.py
import random

GENERAL_QUESTIONS = [
    {"id": "g-1", "text": "Tell me about yourself.", "type": "general"},
    {"id": "g-2", "text": "What are your strengths and weaknesses?", "type": "general"},
    {"id": "g-3", "text": "Why do you want to work here?", "type": "general"},
    {"id": "g-4", "text": "Describe a time you showed leadership.", "type": "general"},
    {"id": "g-5", "text": "How do you handle tight deadlines?", "type": "general"},
]

# Example domain question bank. Extend as needed.
DOMAIN_QUESTION_BANK = [
    {"id": "ai-1", "domain": "ai-ml", "text": "Explain the bias-variance tradeoff.", "type": "domain"},
    {"id": "ai-2", "domain": "ai-ml", "text": "How do you handle class imbalance in datasets?", "type": "domain"},
    {"id": "ai-3", "domain": "ai-ml", "text": "Describe a recent ML project you worked on.", "type": "domain"},
    {"id": "fs-1", "domain": "fullstack", "text": "Explain how REST APIs differ from GraphQL.", "type": "domain"},
    {"id": "fs-2", "domain": "fullstack", "text": "How do you ensure frontend performance?", "type": "domain"},
    {"id": "fs-3", "domain": "fullstack", "text": "Describe a deployment pipeline you built.", "type": "domain"},
    # add more domain-specific Qs...
]

def sample_general(n=3):
    return random.sample(GENERAL_QUESTIONS, min(n, len(GENERAL_QUESTIONS)))

def sample_domain(domain: str, n=3):
    filtered = [q for q in DOMAIN_QUESTION_BANK if q.get("domain") == domain]
    if not filtered:
        # fallback: sample any domain questions
        filtered = [q for q in DOMAIN_QUESTION_BANK]
    return random.sample(filtered, min(n, len(filtered)))
