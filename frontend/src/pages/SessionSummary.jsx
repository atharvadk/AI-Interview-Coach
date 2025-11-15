import React from 'react';
import ProgressBar from '../components/ProgressBar';

const SessionSummary = () => {
  const postureScore = 78;
  const eyeTrackingScore = 85;
  const confidenceScore = 82;
  const questionPerformance = 70;

  return (
    <div style={{
      maxWidth: 950,
      margin: '100px auto',
      textAlign: 'center',
      backgroundColor: '#121212',
      padding: 32,
      borderRadius: 16,
      boxShadow: '0 8px 24px rgba(0,0,0,0.9)',
      color: '#e0e0e0',
      fontFamily: "'Alan', sans-serif",
    }}>
      <h2 style={{
        color: '#a37acc',
        fontWeight: '700',
        fontSize: '2rem',
        marginBottom: 32
      }}>
        Session Summary
      </h2>
      <ProgressBar label="Posture Score" percentage={postureScore} />
      <ProgressBar label="Eye Tracking Score" percentage={eyeTrackingScore} />
      <ProgressBar label="Confidence Score" percentage={confidenceScore} />
      <ProgressBar label="Question Performance" percentage={questionPerformance} />
      <p style={{
        marginTop: 36,
        fontWeight: '600',
        fontSize: '1.1rem',
        color: '#b9a3f5',
      }}>
        <strong>Overall Assessment:</strong> Keep practicing and improve your interview skills!
      </p>
    </div>
  );
};

export default SessionSummary;
