import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar.jsx';
import Notification from './components/Notification.jsx';
import Home from './pages/Home.jsx';
import ResumeUpload from './pages/ResumeUpload.jsx';
import Interview from './pages/Interview.jsx';
import SessionSummary from './pages/SessionSummary.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';
import Dashboard from './pages/Dashboard.jsx';

function App() {
  const [notification, setNotification] = useState(null);

  // eslint-disable-next-line no-unused-vars
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <BrowserRouter>
      <Navbar />
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resume-upload" element={<ResumeUpload />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/session-summary" element={<SessionSummary />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
