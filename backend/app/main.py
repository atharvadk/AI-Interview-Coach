# backend/app/main.py

import os
import logging
from typing import List
from . import config
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

LOG = logging.getLogger("uvicorn.error")

# --- Create app early so we can attach middleware / mounts / routers safely ---
app = FastAPI(title="Interview Coach Backend")

# --- CORS: allow frontend origins (include Vite default) ---
default_origins = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"]
env_origins = os.environ.get("FRONTEND_ORIGINS", "")
origins: List[str] = default_origins.copy()
if env_origins:
    # allow comma-separated override/additions
    for o in env_origins.split(","):
        s = o.strip()
        if s and s not in origins:
            origins.append(s)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Resolve important paths relative to backend/ ---
config.ensure_dirs()

# reuse constants elsewhere
UPLOADS_DIR = config.UPLOADS_DIR
DATA_DIR = config.DATA_DIR
# Mount uploads statically so frontend can fetch uploaded resumes/audio
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# --- Import routers & optional modules (defensive imports) ---
# Routes may be under app.routes.* ; import in try/except to avoid crash when one is missing
def try_import(module_path: str, attr: str = None):
    """
    Helper to import module_path and return module or None.
    If attr provided, return getattr(module, attr) or None.
    """
    try:
        mod = __import__(module_path, fromlist=["*"])
        return getattr(mod, attr) if attr else mod
    except Exception:
        LOG.debug("Optional import failed: %s", module_path, exc_info=False)
        return None

# try to import route modules (they should define `router` variable)
files_mod = try_import("app.routes.files")
sessions_mod = try_import("app.routes.sessions")
feedback_mod = try_import("app.routes.feedback")
auth_mod = try_import("app.routes.auth")

# --- Register routers if present (order: sessions, feedback, files, auth) ---
if sessions_mod and hasattr(sessions_mod, "router"):
    app.include_router(sessions_mod.router)
else:
    LOG.info("sessions router not found; /sessions endpoints will be unavailable.")

if feedback_mod and hasattr(feedback_mod, "router"):
    app.include_router(feedback_mod.router)
else:
    LOG.info("feedback router not found; /feedback endpoints will be unavailable.")

if files_mod and hasattr(files_mod, "router"):
    app.include_router(files_mod.router)
else:
    LOG.info("files router not found; file upload endpoints will be unavailable.")

if auth_mod and hasattr(auth_mod, "router"):
    app.include_router(auth_mod.router)
else:
    LOG.debug("auth router not found; skipping auth routes.")

# --- Try to import services for preloading models (optional) ---
audio_processing = try_import("app.services.audio_processing")
analysis = try_import("app.services.analysis")
session_store = try_import("app.services.session_store")

# --- Startup event: ensure folders exist and optionally preload models ---
@app.on_event("startup")
async def on_startup():
    LOG.info("Starting Interview Coach Backend...")
    # Ensure folders exist (again, safe)
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    os.makedirs(DATA_DIR, exist_ok=True)
    LOG.info("Ensured uploads and data directories exist: %s, %s", UPLOADS_DIR, DATA_DIR)

    # Try to call optional loaders if provided by services
    try:
        if audio_processing and hasattr(audio_processing, "load_models"):
            LOG.info("Loading audio_processing models...")
            audio_processing.load_models()
            LOG.info("audio_processing models loaded.")
    except Exception as e:
        LOG.exception("audio_processing.load_models() failed: %s", e)

    try:
        if analysis and hasattr(analysis, "load_models"):
            LOG.info("Loading analysis models...")
            analysis.load_models()
            LOG.info("analysis models loaded.")
    except Exception as e:
        LOG.exception("analysis.load_models() failed: %s", e)

    # init session_store if it provides setup helpers
    try:
        if session_store and hasattr(session_store, "_ensure_data_dir"):
            session_store._ensure_data_dir()
            LOG.info("session_store initialized.")
    except Exception:
        LOG.debug("session_store._ensure_data_dir absent or failed; continuing.")

# --- Simple health root ---
@app.get("/")
async def root():
    return {"message": "Interview Coach Backend is running"}
