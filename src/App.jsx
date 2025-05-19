import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'

import Homepage from './frontend/pages/Homepage'
import Navbar from './frontend/components/Navbar'
import PacijentiPage from './frontend/pages/PacijentiPage'
import RadnoVrijemePage from './frontend/pages/RadnoVrijemePage'
import ResursiPage from './frontend/pages/ResursiPage'
import TerminiPage from './frontend/pages/TerminiPage'

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/pacijenti" element={<PacijentiPage />} />
        <Route path="/termini" element={<TerminiPage />} />
        <Route path="/resursi" element={<ResursiPage />} />
        <Route path="/radno-vrijeme" element={<RadnoVrijemePage />} />
      </Routes>
    </Router>
  );
};

export default App
