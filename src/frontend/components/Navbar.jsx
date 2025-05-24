import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav
      style={{
        backgroundColor: "#00796b",
        display: "flex",
        justifyContent: "center",
        color: "white",
        height: "60px",
      }}
    >
      <Link className="nav-btn" to="/" style={linkStyle}>
        <div className="nav-btn-div">POČETNA</div>
      </Link>
      <Link className="nav-btn" to="/pacijenti" style={linkStyle}>
        <div className="nav-btn-div">PACIJENTI</div>
      </Link>
      <Link className="nav-btn" to="/termini" style={linkStyle}>
        <div className="nav-btn-div">TERMINI</div>
      </Link>
      <Link className="nav-btn" to="/resursi" style={linkStyle}>
        <div className="nav-btn-div">RESURSI</div>
      </Link>
      <Link className="nav-btn" to="/radno-vrijeme" style={linkStyle}>
        <div className="nav-btn-div">RADNO VRIJEME</div>
      </Link>
    </nav>
  );
};

const linkStyle = {
  color: "white",
  textDecoration: "none",
  fontWeight: "bold",
};

export default Navbar;
