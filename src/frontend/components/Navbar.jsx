import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav style={{
      backgroundColor: '#00796b',
      padding: '10px 20px',
      display: 'flex',
      gap: '20px',
      color: 'white'
    }}>
      <Link to="/" style={linkStyle}>Početna</Link>
      <Link to="/pacijenti" style={linkStyle}>Pacijenti</Link>
      <Link to="/termini" style={linkStyle}>Termini</Link>
      <Link to="/resursi" style={linkStyle}>Resursi</Link>
      <Link to="/radno-vrijeme" style={linkStyle}>Radno vrijeme</Link>
    </nav>
  );
};

const linkStyle = {
  color: 'white',
  textDecoration: 'none',
  fontWeight: 'bold'
};

export default Navbar;
