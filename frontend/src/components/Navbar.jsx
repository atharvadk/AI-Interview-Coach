import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/logo.png'; // Place your logo image in assets folder

const Navbar = () => {
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px', height: '60px', backgroundColor: '#282c34', color: '#fff'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img src={logo} alt="AI Interview Coach" style={{ height: '40px', marginRight: '15px' }} />
        <h2 style={{ margin: 0, fontWeight: 'normal' }}>AI Interview Coach</h2>
      </div>
      <div>
        <NavLink to="/" style={({isActive}) => ({
          margin: '0 10px', textDecoration: 'none', color: isActive ? '#61dafb' : '#fff'
        })}>Home</NavLink>

        <NavLink to="/dashboard" style={({isActive}) => ({
          margin: '0 10px', textDecoration: 'none', color: isActive ? '#61dafb' : '#fff'
        })}>Dashboard</NavLink>

        <NavLink to="/profile" style={({isActive}) => ({
          margin: '0 10px', textDecoration: 'none', color: isActive ? '#61dafb' : '#fff'
        })}>Profile</NavLink>

        <NavLink to="/settings" style={({isActive}) => ({
          margin: '0 10px', textDecoration: 'none', color: isActive ? '#61dafb' : '#fff'
        })}>Settings</NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
