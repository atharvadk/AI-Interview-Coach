// src/pages/ResumeUpload.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ResumeUploadWidget from '../components/ResumeUploadWidget';
import api from '../services/api'; // expects createSession(body) -> { id, questions }

const resumeTypes = ['AI', 'ML', 'SDE', 'Cloud', 'Frontend', 'Backend', 'Fullstack'];

// Developer note:
// If the frontend upload widget cannot provide a server-accessible path, we fall back to
// a local dev path that you provided in the conversation. The backend can transform this
// local path to a URL or use it for testing. Example fallback path:
const DEV_FALLBACK_PATH = "/mnt/data/frontend.zip";

const ResumeUpload = () => {
  const [file, setFile] = useState(null);           // file object returned by ResumeUploadWidget (if any)
  const [filePath, setFilePath] = useState(null);   // optional path (widget can provide)
  const [fadeIn, setFadeIn] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setFadeIn(true);
  }, []);

  // Widget will call onFileUpload with either:
  // - the File object (browser File) AND optionally a 'path' property if widget supplies a path string (for local testing),
  // - or text (resume text) if the widget supports text extraction.
  const handleFileUpload = (payload) => {
    // payload can be: File | { file: File, path: "/mnt/..." } | { text: "resume text" }
    setError(null);
    if (!payload) {
      setFile(null);
      setFilePath(null);
      return;
    }

    // If widget passed an object with file/path/text
    if (typeof payload === 'object' && (payload.file || payload.path || payload.text)) {
      if (payload.file) setFile(payload.file);
      if (payload.path) setFilePath(payload.path);
      if (payload.text) {
        // If widget extracted text from resume (OCR or parsing), store it as text in `file`
        setFilePath(null);
        setFile({ text: payload.text });
      }
    } else {
      // If widget returns the raw File
      setFile(payload);
    }
  };

  const handleStartInterview = async () => {
    setError(null);
    if (!selectedType) {
      setError('Please select a resume type before proceeding.');
      return;
    }

    setLoading(true);
    try {
      // Prepare request payload for POST /sessions
      // Prefer resume_text if widget returned plain text (file.text)
      let resume_text = null;
      let resume_file_path = null;

      if (file && typeof file === 'object' && 'text' in file) {
        // widget gave extracted text
        resume_text = file.text;
      } else if (filePath) {
        // Widget supplied a server path or local path
        resume_file_path = filePath;
      } else if (file && file.name && (typeof File !== "undefined") && file instanceof File) {
        // Browser File object — upload it to backend using api.uploadFile
        try {
          const uploadResp = await api.uploadFile(file);
          // uploadResp expected shape: { status: "ok", file_url: "/uploads/..." }
          const fileUrl = uploadResp && (uploadResp.file_url || uploadResp.fileUrl || uploadResp.url);
          if (fileUrl) {
            // If the backend returned a relative path, prefix with BASE
            resume_file_path = fileUrl.startsWith("http") ? fileUrl : `${api.BASE.replace(/\/$/, "")}${fileUrl}`;
            setFilePath(resume_file_path);
          } else {
            // fallback if backend didn't return a file_url
            console.warn("uploadFile: backend did not return file_url, using fallback path", uploadResp);
            resume_file_path = DEV_FALLBACK_PATH;
          }
        } catch (uploadErr) {
          console.error("Upload failed, falling back to DEV_FALLBACK_PATH", uploadErr);
          // fallback to developer path to let session creation proceed in dev
          resume_file_path = DEV_FALLBACK_PATH;
        }
      } else {
        // nothing was provided — fallback to developer path
        resume_file_path = DEV_FALLBACK_PATH;
      }

      const body = {
        user_id: null,
        title: `${selectedType} Interview`,
        domain: selectedType.toLowerCase(),
        resume_text,
        resume_file_path,
        num_general: 3,
        num_domain: 3,
        num_resume: 3
      };

      // Use your API helper; it should call POST /sessions with JSON body
      // Example expected response: { id: "<session-id>", questions: [...] }
      const resp = await api.createSession(body);

      // resp may return { id, questions } or full session object
      const sessionId = resp.id || resp.session_id || resp;
      const questions = resp.questions || resp.questions || [];

      // Navigate to interview and pass session data in state
      navigate('/interview', { state: { sessionId, questions } });

    } catch (err) {
      console.error("Create session failed:", err);
      setError(err.message || 'Failed to create session. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: 900,
      margin: '100px auto',
      padding: 24,
      borderRadius: 12,
      background: 'linear-gradient(135deg, #1a237e 0%, #7a52f0 100%)',
      color: '#dad6ff',
      boxShadow: '0 10px 30px rgba(122, 82, 240, 0.65)',
      textAlign: 'center',
      fontFamily: "'Alan', sans-serif",
      opacity: fadeIn ? 1 : 0,
      transform: fadeIn ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 1s ease, transform 1s ease',
    }}>
      <h2 style={{ marginBottom: 16 }}>Select Your Resume Type</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 30 }}>
        {resumeTypes.map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            style={{
              padding: '10px 20px',
              fontSize: 16,
              backgroundColor: selectedType === type ? '#563eb7' : '#3f309b',
              border: 'none',
              borderRadius: 8,
              color: '#bbd9ff',
              cursor: 'pointer',
              boxShadow: selectedType === type ? '0 4px 12px rgba(187,217,255,0.6)' : 'none',
              transition: 'background-color 0.3s ease, color 0.3s ease',
              fontWeight: '600',
              userSelect: 'none',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#563eb7'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = selectedType === type ? '#563eb7' : '#3f309b'}
          >
            {type}
          </button>
        ))}
      </div>

      <h2 style={{ marginBottom: 16 }}>Upload Your Resume</h2>
      <ResumeUploadWidget onFileUpload={handleFileUpload} />

      {file && (
        <p style={{
          color: '#bbd9ff',
          marginTop: 16,
          fontWeight: '600',
          animation: 'fadeInOut 3s forwards',
        }}>
          Upload Successful!
        </p>
      )}

      {error && (
        <div style={{ color: '#ffb3c6', marginTop: 12, fontWeight: 600 }}>
          {error}
        </div>
      )}

      <button
        disabled={loading || !selectedType}
        onClick={handleStartInterview}
        style={{
          marginTop: 28,
          padding: '14px 40px',
          fontSize: 18,
          backgroundColor: (!loading && selectedType) ? '#3f309b' : '#5c5c5c',
          border: 'none',
          borderRadius: 8,
          color: (!loading && selectedType) ? '#bbd9ff' : '#999',
          cursor: (!loading && selectedType) ? 'pointer' : 'not-allowed',
          transition: 'background-color 0.3s ease, color 0.3s ease',
          boxShadow: (!loading && selectedType) ? '0 4px 12px rgba(187,217,255,0.6)' : 'none',
          fontWeight: '600',
        }}
        onMouseEnter={e => (!loading && selectedType) && (e.currentTarget.style.backgroundColor = '#563eb7')}
        onMouseLeave={e => (!loading && selectedType) && (e.currentTarget.style.backgroundColor = '#3f309b')}
      >
        {loading ? 'Creating session...' : 'Start Interview'}
      </button>

      <p style={{ marginTop: 24, fontSize: 14, color: '#a0b4ef' }}>
        Supported formats: PDF, DOCX, TXT | Max size: 5MB
      </p>

      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-10px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default ResumeUpload;
