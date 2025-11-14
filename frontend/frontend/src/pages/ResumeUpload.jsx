import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ResumeUploadWidget from '../components/ResumeUploadWidget';

const resumeTypes = ['AI', 'ML', 'SDE', 'Cloud', 'Frontend', 'Backend', 'Fullstack'];

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const handleStartInterview = () => {
    if (!selectedType) {
      alert('Please select a resume type before proceeding.');
      return;
    }
    // You can also send the selectedType and file data to backend here
    navigate('/interview');
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
      <ResumeUploadWidget onFileUpload={setFile} />
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
      <button
        disabled={!file || !selectedType}
        onClick={handleStartInterview}
        style={{
          marginTop: 28,
          padding: '14px 40px',
          fontSize: 18,
          backgroundColor: (file && selectedType) ? '#3f309b' : '#5c5c5c',
          border: 'none',
          borderRadius: 8,
          color: (file && selectedType) ? '#bbd9ff' : '#999',
          cursor: (file && selectedType) ? 'pointer' : 'not-allowed',
          transition: 'background-color 0.3s ease, color 0.3s ease',
          boxShadow: (file && selectedType) ? '0 4px 12px rgba(187,217,255,0.6)' : 'none',
          fontWeight: '600',
        }}
        onMouseEnter={e => (file && selectedType) && (e.currentTarget.style.backgroundColor = '#563eb7')}
        onMouseLeave={e => (file && selectedType) && (e.currentTarget.style.backgroundColor = '#3f309b')}
      >
        Start Interview
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
