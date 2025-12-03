// src/services/api.js
const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

/**
 * Helper to parse fetch responses with helpful error messages.
 * If body is empty, returns null.
 */
async function _parseJsonResponse(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    // return raw text when JSON parsing fails
    return text;
  }
}

async function _checkResponse(res, context = "") {
  if (res.ok) return _parseJsonResponse(res);
  const parsed = await _parseJsonResponse(res);
  const bodyPreview = typeof parsed === "string" ? parsed : JSON.stringify(parsed);
  throw new Error(`${context} failed: ${res.status} ${res.statusText} — ${bodyPreview}`);
}

/**
 * Create a new interview session on the backend.
 * Body should be an object with optional fields:
 * { user_id, title, domain, resume_text, resume_file_path, num_general, num_domain, num_resume }
 *
 * Returns parsed JSON from backend { id, questions }
 */
export async function createSession(body = {}) {
  const res = await fetch(`${BASE}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return _checkResponse(res, "createSession");
}

/**
 * Upload a generic file (resume) to the backend.
 * Expects backend POST /files/upload returning JSON { status: "ok", file_url: "<path>" }
 * Returns parsed JSON response.
 */
export async function uploadFile(file) {
  if (!file) throw new Error("uploadFile requires a File object");
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(`${BASE}/files/upload`, {
    method: "POST",
    body: fd,
  });

  return _checkResponse(res, "uploadFile");
}

/**
 * Upload a single audio chunk (multipart/form-data).
 * chunkBlob: Blob or File
 * sessionId: id returned from createSession()
 * questionId: id of the current question
 * chunkIndex: integer index for ordering
 * startTime/endTime optional (ms)
 *
 * Returns chunk-level feedback JSON from backend.
 */
export async function uploadChunk({ sessionId, questionId, chunkBlob, chunkIndex }) {
  if (!sessionId) throw new Error("uploadChunk requires sessionId");
  if (!chunkBlob) throw new Error("uploadChunk requires chunkBlob");

  const fd = new FormData();
  fd.append("session_id", sessionId);
  if (questionId != null) fd.append("question_id", questionId);
  if (chunkIndex != null) fd.append("chunk_index", String(chunkIndex));
  // name file with sensible extension; backend can ignore extension if it inspects content
  fd.append("file", chunkBlob, `chunk-${questionId || 'unknown'}-${chunkIndex || 0}.webm`);

  const res = await fetch(`${BASE}/files/upload`, {
    method: "POST",
    body: fd,
    // DO NOT set Content-Type header for FormData; browser sets it including boundary
  });

  // Use the shared response checker so we get meaningful errors
  return _checkResponse(res, "uploadChunk");
}

/**
 * Tell backend the session is finished and ask it to aggregate results.
 * Returns aggregated session report JSON.
 */
export async function completeSession(sessionId) {
  if (!sessionId) throw new Error("completeSession requires sessionId");
  const res = await fetch(`${BASE}/sessions/${sessionId}/complete`, {
    method: "POST",
  });
  return _checkResponse(res, "completeSession");
}

/**
 * Get session object by id.
 * Returns the session object (questions, chunks, meta).
 */
export async function getSession(sessionId) {
  if (!sessionId) throw new Error("getSession requires sessionId");
  const res = await fetch(`${BASE}/sessions/${sessionId}`);
  return _checkResponse(res, "getSession");
}

/**
 * Default export for convenience.
 */
export default {
  BASE,
  createSession,
  uploadFile,
  uploadChunk,
  completeSession,
  getSession,
};
