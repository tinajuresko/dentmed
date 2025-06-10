import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Homepage from "./frontend/pages/Homepage";
import Navbar from "./frontend/components/Navbar";
import PacijentiPage from "./frontend/pages/PacijentiPage";
import TerminiPage from "./frontend/pages/TerminiPage";
import ResursiPage from "./frontend/pages/ResursiPage";
import RadnoVrijemePage from "./frontend/pages/RadnoVrijemePage";
import Footer from "./frontend/components/Footer";

import AppointmentsPage from "./frontend/pages/AppointmentRequestForm";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/pacijenti" element={<PacijentiPage />} />
        <Route path="/termini" element={<AppointmentsPage />} />
        <Route path="/resursi" element={<ResursiPage />} />
        <Route path="/radno-vrijeme" element={<RadnoVrijemePage />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
