import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const questions = [
  'Tell me about yourself.',
  'Why do you want this job?',
  'Describe a challenging situation you faced and how you handled it.',
  // Extend dynamically based on resume analysis later
];

const Interview = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const videoRef = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const audioRecorderRef = useRef(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [recording, setRecording] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
        setMediaStream(stream);
        setRecording(true);
      })
      .catch(() => alert('Error: Webcam/Microphone permissions are required.'));

    return () => {
      if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
      setRecording(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      handleNextQuestion();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeLeft(60);
    } else {
      if (recording) {
        setRecording(false);
      }
      navigate('/session-summary');
    }
  };

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
        <p style={{ marginTop: 10 }}>{questions[currentQuestionIndex]}</p>
      </div>
      <p style={{ marginBottom: 20, fontWeight: '600', color: '#b9a3f5', fontSize: '1.2rem' }}>
        Time Left: {timeLeft} seconds
      </p>
      <button
        onClick={handleNextQuestion}
        style={{
          padding: '14px 40px',
          fontSize: 18,
          borderRadius: 10,
          border: 'none',
          backgroundColor: '#7a52f0',
          color: '#fff',
          cursor: 'pointer',
          boxShadow: '0 6px 30px rgba(122, 82, 240, 0.7)',
          transition: 'background-color 0.3s ease',
          fontWeight: '600',
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#5e3aca'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#7a52f0'}
      >
        Next Question
      </button>
    </div>
  );
};

export default Interview;
