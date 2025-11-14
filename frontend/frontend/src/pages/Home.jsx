import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css'; // Contains fade-in animation styles
import heroImage from '../assets/heroimage.gif';
import feedbackIcon from '../assets/feedbackicon.png';
import speechIcon from '../assets/speechicon.png';
import coachingIcon from '../assets/coachingicon.png';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '50px 20px', textAlign: 'center' }}>
      {/* Hero Image */}
      <img
        src={heroImage}
        alt="Interview Coach Hero"
        className="fade-in-image"
        style={{ width: '340px', marginBottom: '24px' }}
      />

      <h1>Welcome to AI Interview Coach</h1>
      <p>Your intelligent and accessible platform to practice and improve your interview skills with real-time feedback based on speech and video analysis.</p>

      {/* Feature Cards */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '24px',
        marginTop: '40px',
        marginBottom: '40px'
      }}>
        <div className="fade-in-card" style={{
          flex: '1 1 280px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        }}>
          <img src={feedbackIcon} alt="Feedback" style={{ width: '80px', marginBottom: '12px' }} />
          <h3>Real-Time Feedback</h3>
          <p>Improves your interviewing skills with actionable feedback.</p>
        </div>
        <div className="fade-in-card" style={{
          flex: '1 1 280px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        }}>
          <img src={speechIcon} alt="Speech & Video Analysis" style={{ width: '80px', marginBottom: '12px' }} />
          <h3>Speech & Video Analysis</h3>
          <p>Uses latest AI tech to analyze your communication style.</p>
        </div>
        <div className="fade-in-card" style={{
          flex: '1 1 280px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        }}>
          <img src={coachingIcon} alt="Personalized Coaching" style={{ width: '80px', marginBottom: '12px' }} />
          <h3>Personalized Coaching</h3>
          <p>Tailored tips to boost confidence and presentation skills.</p>
        </div>
      </div>

      {/* Call to Action Button */}
      <button
        onClick={() => navigate('/resume-upload')}
        style={{
          marginTop: 30,
          padding: '15px 45px',
          fontSize: '18px',

          backgroundColor: '#124170',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Start Interview Simulation
      </button>
    </div>
  );
};

export default Home;
