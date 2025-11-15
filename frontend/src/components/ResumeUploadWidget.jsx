import React, { useState, useRef } from 'react';

const ResumeUploadWidget = ({ onFileUpload }) => {
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef();

  const validTypes = [
    'application/pdf', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'text/plain'
  ];

  const handleFiles = (files) => {
    const file = files[0];
    if (!file) return;

    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload PDF, DOCX, or TXT.');
      setFileName('');
      onFileUpload(null);
      return;
    }

    setError('');
    setFileName(file.name);
    onFileUpload(file);
  };

  const handleInputChange = (e) => handleFiles(e.target.files);

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => e.preventDefault();

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current.click()}
        style={{
          border: '2px dashed #ccc',
          padding: '30px',
          cursor: 'pointer',
          marginBottom: '10px',
          borderRadius: '5px',
          userSelect: 'none'
        }}
      >
        {fileName ? <p>Uploaded: {fileName}</p> : <p>Drag and drop your resume here or click to browse</p>}
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ResumeUploadWidget;
