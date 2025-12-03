// src/components/ResumeUploadWidget.jsx
import React, { useState } from "react";
import api from "../services/api"; // <-- use the shared api helper

const DEV_FALLBACK_PATH = "/mnt/data/frontend.zip";

export default function ResumeUploadWidget({ onFileUpload }) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);

  const handleChooseFile = (e) => {
    setError(null);
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setSelectedFile(f);
    uploadFileToServer(f);
  };

  async function uploadFileToServer(file) {
    setUploading(true);
    setError(null);

    try {
      // use the shared api helper (it posts to `${BASE}/files/upload`)
      const resp = await api.uploadFile(file);
      // uploadFile uses _checkResponse so it will throw on non-200
      // expected response shape: { status: "ok", file_url: "<path>" }
      const file_url = resp && (resp.file_url || resp.path || resp.url);

      if (file_url) {
        if (onFileUpload) onFileUpload({ path: file_url, file });
      } else {
        // backend didn't return file_url -> fallback
        console.warn("uploadFile returned no file_url; using dev fallback");
        if (onFileUpload) onFileUpload({ path: DEV_FALLBACK_PATH, file });
      }
    } catch (err) {
      console.warn("uploadFile failed, falling back:", err);
      // optionally expose err.message to UI
      setError("Upload failed; using fallback.");
      if (onFileUpload) onFileUpload({ path: DEV_FALLBACK_PATH, file });
    } finally {
      setUploading(false);
    }
  }

  const handleUseDevFallback = () => {
    if (onFileUpload) onFileUpload({ path: DEV_FALLBACK_PATH });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <label style={{
        display: "inline-block",
        padding: "10px 18px",
        background: "#2f2677",
        color: "#d7d3ff",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: 600
      }}>
        Choose Resume
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleChooseFile}
          style={{ display: "none" }}
        />
      </label>

      {uploading && <div style={{ color: "#cfc8f8" }}>Uploading... please wait</div>}

      {selectedFile && !uploading && (
        <div style={{ color: "#b9a3f5", fontSize: 14 }}>
          Selected: {selectedFile.name} — uploaded (or queued)
        </div>
      )}

      {error && <div style={{ color: "#ffb3c6" }}>{error}</div>}

      <div style={{ marginTop: 8 }}>
        <button
          onClick={handleUseDevFallback}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "none",
            background: "#3b2f8b",
            color: "#e6e0ff",
            cursor: "pointer",
            fontWeight: 600
          }}
        >
          Use Dev Fallback Path
        </button>
      </div>

      <div style={{ marginTop: 6, fontSize: 12, color: "#9fa3e6" }}>
        (Uploads to backend if available, otherwise uses local dev path)
      </div>
    </div>
  );
}
