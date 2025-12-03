# backend/app/config.py
import os
from typing import Optional

# BASE_DIR: backend/
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
DATA_DIR = os.path.join(BASE_DIR, "data")

# optional helper to ensure dirs exist
def ensure_dirs():
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    os.makedirs(DATA_DIR, exist_ok=True)
