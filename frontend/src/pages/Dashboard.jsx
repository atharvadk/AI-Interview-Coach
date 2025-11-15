import React from 'react';

const Dashboard = () => {
  return (
    <div style={{
      maxWidth: 900,
      margin: '40px auto',
      padding: '0 20px',
      fontFamily: "'Alan', sans-serif",
      color: '#d8d2f0',
      backgroundColor: '#121212',
      borderRadius: 12,
      boxShadow: '0 0 18px rgb(200 190 255 / 0.1)'
    }}>
      <h1 style={{
        textAlign: 'center',
        marginBottom: 24,
        color: '#9e8bcd',
        fontWeight: '700',
        fontSize: '2.4rem',
      }}>
        Dashboard
      </h1>
      <p style={{
        textAlign: 'center',
        color: '#b8afe0',
        maxWidth: 500,
        margin: '0 auto 40px',
        fontSize: '1.2rem',
      }}>
        Welcome to your dashboard. Here you will find your interview progress, schedule, and personalized recommendations.
      </p>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{
          background: 'linear-gradient(135deg, #8f7bca, #6d5fbb)',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 8px 20px rgba(111, 93, 189, 0.6)',
          color: '#d4c9ee',
          textAlign: 'center',
          minHeight: 160,
        }}>
          <h3 style={{ marginBottom: 12 }}>Interview Progress</h3>
          <p>Track your simulated interviews and growth over time.</p>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #8f7bca, #4d3f99)',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 8px 20px rgba(111, 93, 189, 0.4)',
          color: '#d4c9ee',
          textAlign: 'center',
          minHeight: 160,
        }}>
          <h3 style={{ marginBottom: 12 }}>Upcoming Interviews</h3>
          <p>View your scheduled interviews and stay prepared.</p>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #8f7bca, #5b49bd)',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 8px 20px rgba(111, 93, 189, 0.5)',
          color: '#d4c9ee',
          textAlign: 'center',
          minHeight: 160,
        }}>
          <h3 style={{ marginBottom: 12 }}>Personalized Coaching</h3>
          <p>Get tips and training tailored to your strengths and weaknesses.</p>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
