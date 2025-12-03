// src/components/QuestionPanel.jsx
import React, { useState, useRef, useEffect } from "react";
import api from "../services/api";

export default function QuestionPanel({
  question,        // object { id, text, max_time_sec }
  sessionId,       // backend session id
  onChunkResult,   // callback: chunk feedback
  onQuestionDone,  // callback when user stops recording
}) {
  const [recording, setRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(question?.max_time_sec || 30);

  const mediaRecorderRef = useRef(null);
  const chunkIndexRef = useRef(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    setTimeLeft(question?.max_time_sec || 30);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, [question]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;
      chunkIndexRef.current = 0;

      recorder.ondataavailable = async (e) => {
        if (e.data.size > 0) {
          const chunkBlob = e.data;
          const chunkIndex = chunkIndexRef.current++;

          try {
            const result = await api.uploadChunk({
              sessionId,
              questionId: question.id,
              chunkBlob,
              chunkIndex,
            });

            if (onChunkResult) {
              onChunkResult({
                chunkIndex,
                feedback: result,
              });
            }
          } catch (err) {
            console.error("Upload failed:", err);
          }
        }
      };

      // 30 sec chunks
      recorder.start(30_000);

      setRecording(true);

      // Timer for question
      let total = question?.max_time_sec || 30;
      setTimeLeft(total);

      intervalRef.current = setInterval(() => {
        total -= 1;
        setTimeLeft(total);

        if (total <= 0) stopRecording();
      }, 1000);

    } catch (err) {
      alert("Microphone access denied!");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
    setRecording(false);

    if (intervalRef.current) clearInterval(intervalRef.current);

    if (onQuestionDone) onQuestionDone();
  };

  return (
    <div className="question-panel" style={{ marginTop: "20px" }}>
      <h2>Question</h2>
      <p>{question.text}</p>

      <p><strong>Time left:</strong> {timeLeft}s</p>

      {!recording ? (
        <button onClick={startRecording} className="btn btn-primary">
          Start Recording
        </button>
      ) : (
        <button onClick={stopRecording} className="btn btn-danger">
          Stop Recording
        </button>
      )}
    </div>
  );
}
