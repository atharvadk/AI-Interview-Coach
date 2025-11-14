import React from 'react';

const ProgressBar = ({ label, percentage }) => {
  return (
    <div style={{ marginBottom: '15px', textAlign: 'left' }}>
      <label>{label}: {percentage}%</label>
      <div style={{ background: '#eee', borderRadius: '5px', height: '15px' }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: percentage > 75 ? 'green' : percentage > 50 ? 'orange' : 'red',
          borderRadius: '5px',
          transition: 'width 0.5s ease-in-out'
        }} />
      </div>
    </div>
  );
};

export default ProgressBar;
