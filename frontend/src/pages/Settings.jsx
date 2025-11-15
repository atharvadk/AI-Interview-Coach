import React, { useState } from 'react';

const availableCameras = ['Default Camera', 'Webcam HD', 'USB Camera'];
const availableMics = ['Default Microphone', 'External Mic', 'Built-in Mic'];
const languages = ['English', 'Spanish', 'French', 'German'];

const Settings = () => {
  const [camera, setCamera] = useState(availableCameras[0]);
  const [microphone, setMicrophone] = useState(availableMics[0]);
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState(languages[0]);
  const [notifications, setNotifications] = useState(true);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleNotifications = () => setNotifications(!notifications);

  const saveSettings = () => alert('Settings saved!');

  const containerStyle = {
    maxWidth: 900,
    margin: '40px auto',
    padding: 20,
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    backgroundColor: darkMode ? '#121212' : '#f9f9f9',
    color: darkMode ? '#eee' : '#222',
    borderRadius: 10,
    boxShadow: darkMode ? '0 0 18px rgba(255,255,255,0.12)' : '0 0 18px rgba(0,0,0,0.12)',
  };

  const sectionStyle = {
    marginBottom: 24,
  };

  const labelStyle = {
    display: 'block',
    fontWeight: '600',
    marginBottom: 8,
  };

  const selectStyle = {
    padding: 10,
    borderRadius: 6,
    width: '100%',
    border: 'none',
    outline: 'none',
    fontSize: 16,
  };

  const toggleSwitchStyle = {
    position: 'relative',
    width: '50px',
    height: '28px',
    display: 'inline-block',
  };

  const sliderStyle = {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ccc',
    borderRadius: '28px',
    transition: '.4s',
  };

  const sliderBeforeStyle = {
    position: 'absolute',
    content: '""',
    height: '22px',
    width: '22px',
    left: '3px',
    bottom: '3px',
    backgroundColor: 'white',
    borderRadius: '50%',
    transition: '.4s',
  };

  const toggleInputStyle = {
    opacity: 0,
    width: 0,
    height: 0,
  };

  // Button style changes according to dark mode theme colors
  const buttonStyle = {
    padding: '12px 28px',
    fontSize: '1.1rem',
    borderRadius: 8,
    border: 'none',
    backgroundColor: darkMode ? '#4a90e2' : '#1a237e',
    color: '#fff',
    cursor: 'pointer',
    width: '100%',
    marginTop: 12,
    fontWeight: '600',
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ textAlign: 'center', marginBottom: 28 }}>Settings</h1>

      <section style={sectionStyle}>
        <label style={labelStyle} htmlFor="camera-select">Camera Selection</label>
        <select
          id="camera-select"
          value={camera}
          onChange={(e) => setCamera(e.target.value)}
          style={selectStyle}
        >
          {availableCameras.map((cam) => <option key={cam} value={cam}>{cam}</option>)}
        </select>
      </section>

      <section style={sectionStyle}>
        <label style={labelStyle} htmlFor="mic-select">Microphone Selection</label>
        <select
          id="mic-select"
          value={microphone}
          onChange={(e) => setMicrophone(e.target.value)}
          style={selectStyle}
        >
          {availableMics.map((mic) => <option key={mic} value={mic}>{mic}</option>)}
        </select>
      </section>

      <section style={sectionStyle}>
        <label style={{ ...labelStyle, marginBottom: '12px' }}>UI Preference</label>
        <label style={toggleSwitchStyle}>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={toggleDarkMode}
            style={toggleInputStyle}
          />
          <span style={{
            ...sliderStyle,
            backgroundColor: darkMode ? '#4a90e2' : '#ccc',
          }}>
            <span style={{
              ...sliderBeforeStyle,
              transform: darkMode ? 'translateX(22px)' : 'translateX(0)',
              backgroundColor: darkMode ? '#1a237e' : 'white',
            }} />
          </span>
        </label>
      </section>

      <section style={sectionStyle}>
        <label style={{ ...labelStyle, marginBottom: '12px' }}>Notifications</label>
        <label style={toggleSwitchStyle}>
          <input
            type="checkbox"
            checked={notifications}
            onChange={toggleNotifications}
            style={toggleInputStyle}
          />
          <span style={{
            ...sliderStyle,
            backgroundColor: notifications ? '#4a90e2' : '#ccc',
          }}>
            <span style={{
              ...sliderBeforeStyle,
              transform: notifications ? 'translateX(22px)' : 'translateX(0)',
              backgroundColor: notifications ? '#1a237e' : 'white',
            }} />
          </span>
        </label>
      </section>

      <section style={sectionStyle}>
        <label style={labelStyle} htmlFor="language-select">Language</label>
        <select
          id="language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={selectStyle}
        >
          {languages.map((lang) => <option key={lang} value={lang}>{lang}</option>)}
        </select>
      </section>

      <button style={buttonStyle} onClick={saveSettings}>Save Settings</button>
    </div>
  );
};

export default Settings;
