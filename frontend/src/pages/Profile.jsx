import React from 'react';

const mockUser = {
  username: 'johndoe',
  email: 'johndoe@example.com',
};

const mockSummaries = [
  {
    id: 1,
    date: '2025-08-05',
    posture: 'Good',
    eyeTracking: 'Focused',
    confidence: 'High',
    correctAnswers: 8,
    resumeLink: '/resumes/johndoe_aug2025.pdf',
  },
  {
    id: 2,
    date: '2025-07-15',
    posture: 'Average',
    eyeTracking: 'Occasional distraction',
    confidence: 'Moderate',
    correctAnswers: 6,
    resumeLink: '/resumes/johndoe_july2025.pdf',
  },
];

const Profile = () => {
  return (
    <div style={{
      maxWidth: 900,
      margin: '40px auto',
      padding: 20,
      fontFamily: "'Alan', sans-serif",
      color: '#e0e0e0',
      backgroundColor: '#121212',
      borderRadius: 12,
      boxShadow: '0 0 18px rgba(255,255,255,0.12)',
    }}>
      <h1 style={{
        textAlign: 'center',
        marginBottom: 32,
        color: '#cbb9f6',
      }}>
        Profile
      </h1>

      <section style={{ marginBottom: 36 }}>
        <h2 style={{
          marginBottom: 16,
          color: '#b4a0f8',
          fontWeight: 600,
          fontSize: '1.8rem',
        }}>
          User Information
        </h2>
        <p><strong>Username:</strong> {mockUser.username}</p>
        <p><strong>Email:</strong> {mockUser.email}</p>
      </section>

      <section>
        <h2 style={{
          marginBottom: 16,
          color: '#b4a0f8',
          fontWeight: 600,
          fontSize: '1.8rem',
        }}>
          Past Interview Summaries
        </h2>
        {mockSummaries.map(summary => (
          <div key={summary.id} style={{
            background: 'linear-gradient(135deg, #7a52f0, #3d2785)',
            borderRadius: 12,
            padding: 18,
            marginBottom: 20,
            boxShadow: '0 2px 12px rgba(122, 82, 240, 0.6)',
            color: '#dad3ff',
          }}>
            <p><strong>Date:</strong> {summary.date}</p>
            <p><strong>Posture:</strong> {summary.posture}</p>
            <p><strong>Eye Tracking:</strong> {summary.eyeTracking}</p>
            <p><strong>Confidence:</strong> {summary.confidence}</p>
            <p><strong>Correct Answers:</strong> {summary.correctAnswers}</p>
            <p>
              <a
                href={summary.resumeLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#bbe1ff', textDecoration: 'underline' }}
              >
                View Resume
              </a>
            </p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Profile;
