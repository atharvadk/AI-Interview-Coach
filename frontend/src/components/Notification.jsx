import React from 'react';

const Notification = ({ message, type, onClose }) => {
  const bgColor = type === 'error' ? '#ff4d4f' : '#40a9ff';
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '15px 25px',
      backgroundColor: bgColor,
      color: 'white',
      borderRadius: '5px',
      boxShadow: '0 0 10px rgba(0,0,0,0.2)',
      zIndex: 1000,
      cursor: 'pointer'
    }}
    onClick={onClose}
    >
      {message}
    </div>
  );
};

export default Notification;
