// src/pages/Interview.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api'; // backend client


const DEFAULT_QUESTIONS = [
  { id: "g-1", text: 'Tell me about yourself.' },
  { id: "g-2", text: 'Why do you want this job?' },
  { id: "g-3", text: 'Describe a challenging situation you faced and how you handled it.' },
];

const CHUNK_MS = 30_000; // 30 seconds
const QUESTION_TIME_SEC = 60;
const SUPPORTED_MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/ogg",
  "audio/wav"
];

function pickSupportedMime() {
  if (typeof MediaRecorder === 'undefined') return null;
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
    "audio/wav"
  ];
  for (const c of candidates) {
    try {
      if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(c)) return c;
    } catch (e) {
      // ignore
    }
  }
  return null;
}

const Interview = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [questions, setQuestions] = useState(() => (location.state && location.state.questions) || null);
  const [sessionId, setSessionId] = useState(() => (location.state && location.state.sessionId) || null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_SEC);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunkIndexRef = useRef(0);
  const [mediaStream, setMediaStream] = useState(null);
  const [recording, setRecording] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const [perQuestionResults, setPerQuestionResults] = useState({}); // { [questionId]: [{chunkIndex, feedback}, ...] }
  const [error, setError] = useState(null);

  // Ensure we have a session and questions (create session if needed)
  useEffect(() => {
    async function ensureSessionAndQuestions() {
      if (questions && sessionId) {
        localStorage.setItem("lastSessionId", sessionId);
        return;
      }

      setLoadingSession(true);
      try {
        const last = sessionId || localStorage.getItem("lastSessionId");
        if (last && !questions) {
          const s = await api.getSession(last);
          if (s && s.questions) {
            setQuestions(s.questions);
            setSessionId(last);
            localStorage.setItem("lastSessionId", last);
            return;
          }
        }

        const body = {
          title: "Interview Session",
          num_general: 3,
          num_domain: 3,
          num_resume: 3,
        };
        const resp = await api.createSession(body);
        const sid = resp.id || resp.session_id || (resp.session && resp.session.id);
        const qs = resp.questions || resp.questions || (resp.session && resp.session.questions) || DEFAULT_QUESTIONS;
        setSessionId(sid);
        setQuestions(qs);
        localStorage.setItem("lastSessionId", sid);
      } catch (err) {
        console.error("Failed to create/fetch session:", err);
        setError("Could not create or load session. Check backend.");
        setQuestions(DEFAULT_QUESTIONS);
      } finally {
        setLoadingSession(false);
      }
    }

    ensureSessionAndQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Camera + mic setup
  useEffect(() => {
    let mounted = true;
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (!mounted) return;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setMediaStream(stream);
      })
      .catch((e) => {
        console.error("getUserMedia error:", e);
        setError("Webcam/Microphone permissions are required. Check browser or OS settings.");
      });

    return () => {
      mounted = false;
      if (mediaStream) mediaStream.getTracks().forEach(t => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer logic
  useEffect(() => {
    if (!recording) return;
    if (timeLeft <= 0) {
      stopRecording();
      return;
    }
    const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, recording]);

  // Start recording — robust mime negotiation and audio-track checks
  // Put near top so CHUNK_MS constant is used
const SUPPORTED_MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/ogg",
  "audio/wav"
];

async function createRecorderWithBestMime(stream) {
  if (typeof MediaRecorder === 'undefined') {
    throw new Error("MediaRecorder API is not available in this browser.");
  }

  // quick safety: ensure an audio track exists and is enabled
  const audioTracks = stream.getAudioTracks ? stream.getAudioTracks() : [];
  if (!audioTracks || audioTracks.length === 0) {
    throw new Error("No audio track available on the MediaStream.");
  }
  if (!audioTracks.every(t => t.enabled !== false)) {
    console.warn("Some audio tracks are disabled.");
  }

  // Try candidates by actually constructing a recorder
  for (const m of SUPPORTED_MIME_CANDIDATES) {
    try {
      if (MediaRecorder.isTypeSupported && !MediaRecorder.isTypeSupported(m)) {
        console.log("isTypeSupported false for:", m);
        continue;
      }
      const r = new MediaRecorder(stream, { mimeType: m });
      console.log("Successfully created MediaRecorder with mime:", m);
      return { recorder: r, mime: m };
    } catch (err) {
      console.warn("Failed to create MediaRecorder for", m, err);
    }
  }

  // fallback: try MediaRecorder default constructor
  try {
    const r = new MediaRecorder(stream);
    console.log("Created MediaRecorder with default mime (no explicit mime).");
    return { recorder: r, mime: null };
  } catch (err) {
    throw new Error("Unable to create MediaRecorder with any tested mime types: " + err.message);
  }
}

  const startRecording = async () => {
    setError(null);
    if (!mediaStream) {
      setError("Media not ready — allow microphone and camera access.");
      return;
    }
    if (!sessionId) {
      setError("Session ID not ready. Please try again.");
      return;
    }

    // ensure an audio track exists
    try {
      const audioTracks = mediaStream.getAudioTracks ? mediaStream.getAudioTracks() : [];
      console.log("Audio tracks:", audioTracks.length, audioTracks.map(t => ({ id: t.id, enabled: t.enabled })));
      if (audioTracks.length === 0) {
        setError("No audio track detected. Check microphone permissions or OS privacy settings.");
        return;
      }
    } catch (e) {
      console.warn("audio track check error:", e);
    }

    // Build an audio-only stream to make recorder creation/start more reliable
    const audioOnlyStream = new MediaStream(mediaStream.getAudioTracks());

    // Try to create recorder with best mime first (reuse your pickSupportedMime)
    let mime = pickSupportedMime();
    console.log("Selected mimeType (probe):", mime || "(default)");

    let recorder = null;
    const createRecorder = (stream, m) => {
      try {
        return m ? new MediaRecorder(stream, { mimeType: m }) : new MediaRecorder(stream);
      } catch (err) {
        console.warn("Failed to create MediaRecorder with mime:", m, err);
        return null;
      }
    };

    // try preferred mime first (if any)
    if (mime) recorder = createRecorder(audioOnlyStream, mime);
    if (!recorder) recorder = createRecorder(audioOnlyStream, null);
    if (!recorder) {
      setError("Unable to create MediaRecorder on this device/browser.");
      return;
    }

    mediaRecorderRef.current = recorder;
    chunkIndexRef.current = 0;

    recorder.ondataavailable = async (event) => {
      if (!event.data || event.data.size === 0) return;
      const blob = event.data;
      const q = questions[currentQuestionIndex];
      const qid = q && (q.id || q.text) ? (q.id || q.text) : `q-${currentQuestionIndex}`;
      const cidx = chunkIndexRef.current;

      try {
        const feedback = await api.uploadChunk({
          sessionId,
          questionId: qid,
          chunkBlob: blob,
          chunkIndex: cidx
        });

        setPerQuestionResults(prev => {
          const prevArr = Array.isArray(prev[qid]) ? prev[qid] : [];
          const nextArr = [...prevArr, { chunkIndex: cidx, feedback }];
          return { ...prev, [qid]: nextArr };
        });
      } catch (err) {
        console.error("uploadChunk failed:", err);
        setError("Failed to upload audio chunk to backend.");
      } finally {
        chunkIndexRef.current += 1;
      }
    };

    recorder.onerror = (ev) => {
      console.error("MediaRecorder error", ev);
      setError("Recording error occurred. See console for details.");
    };

    // Try to start. If start fails with NotSupportedError when using explicit mime,
    // try re-creating without mime and start again.
    try {
      recorder.start(CHUNK_MS); // try with timeslice - convenient chunking
      console.log("recorder started (first attempt), state:", recorder.state);
      setRecording(true);
      setTimeLeft(QUESTION_TIME_SEC);
      return;
    } catch (e) {
      console.warn("recorder.start first attempt failed:", e.name, e.message);
      // if we tried with explicit mime, try fallback without mime
      if (mime) {
        try {
          recorder = createRecorder(audioOnlyStream, null);
          if (!recorder) throw new Error("Fallback recorder creation failed");
          mediaRecorderRef.current = recorder;

          // reattach handlers
          recorder.ondataavailable = async (event) => {
            if (!event.data || event.data.size === 0) return;
            const blob = event.data;
            const q = questions[currentQuestionIndex];
            const qid = q && (q.id || q.text) ? (q.id || q.text) : `q-${currentQuestionIndex}`;
            const cidx = chunkIndexRef.current;
            try {
              const feedback = await api.uploadChunk({
                sessionId,
                questionId: qid,
                chunkBlob: blob,
                chunkIndex: cidx
              });
              setPerQuestionResults(prev => {
                const prevArr = Array.isArray(prev[qid]) ? prev[qid] : [];
                const nextArr = [...prevArr, { chunkIndex: cidx, feedback }];
                return { ...prev, [qid]: nextArr };
              });
            } catch (err) {
              console.error("uploadChunk failed:", err);
              setError("Failed to upload audio chunk to backend.");
            } finally {
              chunkIndexRef.current += 1;
            }
          };

          recorder.onerror = (ev) => {
            console.error("MediaRecorder error", ev);
            setError("Recording error occurred. See console for details.");
          };

          recorder.start(CHUNK_MS);
          console.log("recorder started (fallback), state:", recorder.state);
          setRecording(true);
          setTimeLeft(QUESTION_TIME_SEC);
          return;
        } catch (e2) {
          console.error("Fallback recorder.start also failed:", e2.name || e2, e2.message || "");
          setError("Unable to start recording. Try a different browser (Chrome recommended).");
          return;
        }
      } else {
        // we already tried without mime and it still failed
        console.error("recorder.start failed and no fallback mime to try:", e);
        setError("Unable to start recording. Check microphone permissions and browser compatibility.");
        return;
      }
    }
  };


  // Stop recording and flush last data
  const stopRecording = () => {
    try {
      const recorder = mediaRecorderRef.current;
      if (recorder) {
        if (recorder.state !== 'inactive') {
          try { recorder.requestData(); } catch (e) { /* ignore */ }
          try { recorder.stop(); } catch (e) { /* ignore */ }
        }
      }
    } catch (e) {
      console.warn("stopRecording error:", e);
    }
    setRecording(false);

    // small delay to ensure final chunk uploaded
    setTimeout(() => {
      handleNextQuestion();
    }, 300);
  };

  // Advance to next question or finish interview
  const handleNextQuestion = async () => {
    // reset chunk counter
    chunkIndexRef.current = 0;

    if (currentQuestionIndex < (questions.length - 1)) {
      setCurrentQuestionIndex(i => i + 1);
      setTimeLeft(QUESTION_TIME_SEC);
    } else {
      // finalize session
      try {
        const aggregated = await api.completeSession(sessionId);
        navigate('/session-summary', { state: { perQuestionResults, aggregated, sessionId } });
      } catch (err) {
        console.error("completeSession error:", err);
        setError("Failed to finalize session. Check backend.");
        navigate('/session-summary', { state: { perQuestionResults, sessionId } });
      }
    }
  };

  if (loadingSession) {
    return <div style={{ padding: 24, textAlign: 'center' }}>Preparing session...</div>;
  }

  if (!questions) {
    return <div style={{ padding: 24, textAlign: 'center', color: 'red' }}>{error || 'No questions available.'}</div>;
  }

  const currentQ = questions[currentQuestionIndex];

  return (
    <div style={{
      maxWidth: 950,
      margin: '40px auto',
      textAlign: 'center',
      fontFamily: "'Alan', sans-serif",
      backgroundColor: '#121212',
      padding: 30,
      borderRadius: 16,
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.9)',
      color: '#e0e0e0'
    }}>
      <h2 style={{ marginBottom: 24, color: '#a37acc' }}>Interview Simulation</h2>

      <video
        ref={videoRef}
        autoPlay
        muted
        style={{
          width: '320px',
          height: 'auto',
          borderRadius: '14px',
          border: '2px solid #7a52f0',
          boxShadow: '0 4px 20px rgba(122, 82, 240, 0.4)',
          marginBottom: 30,
        }}
      />

      <div style={{
        background: 'linear-gradient(135deg, rgba(122,82,240,0.15), rgba(58,53,75,0.45))',
        padding: 30,
        borderRadius: 16,
        boxShadow: '0 6px 40px rgba(122, 82, 240, 0.5)',
        color: '#dcd6f7',
        marginBottom: 30,
        fontSize: '1.4rem',
        fontWeight: '700',
        minHeight: '130px',
        userSelect: 'none',
      }}>
        <p>Question {currentQuestionIndex + 1}:</p>
        <p style={{ marginTop: 10 }}>{currentQ ? currentQ.text : "No question"}</p>
      </div>

      <p style={{
        marginBottom: 20,
        fontWeight: '600',
        color: '#b9a3f5',
        fontSize: '1.2rem'
      }}>
        Time Left: {timeLeft} seconds
      </p>

      {error && <div style={{ color: '#ffb3c6', marginBottom: 12 }}>{error}</div>}

      {!recording ? (
        <button
          onClick={startRecording}
          style={{
            padding: '14px 40px',
            fontSize: 18,
            borderRadius: 10,
            border: 'none',
            backgroundColor: '#7a52f0',
            color: '#fff',
            cursor: 'pointer',
            boxShadow: '0 6px 30px rgba(122, 82, 240, 0.7)',
          }}
        >
          Start Recording
        </button>
      ) : (
        <button
          onClick={stopRecording}
          style={{
            padding: '14px 40px',
            fontSize: 18,
            borderRadius: 10,
            border: 'none',
            backgroundColor: '#d9534f',
            color: '#fff',
            cursor: 'pointer',
            boxShadow: '0 6px 30px rgba(217, 83, 79, 0.7)',
          }}
        >
          Stop & Next Question
        </button>
      )}

    </div>
  );
};

export default Interview;
