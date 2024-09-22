// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FloorHeatingWizard from './components/FloorHeatingWizard';
import HouseCanvas from './components/HouseCanvas';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<FloorHeatingWizard />} />
          <Route path="/house-canvas" element={<HouseCanvas />} />
          {/* Add more routes as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
