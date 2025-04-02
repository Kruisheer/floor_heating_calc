// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Import your main components/pages
import FloorHeatingWizard from './components/FloorHeatingWizard'; // Where rooms are likely created/edited
import HouseCanvasWrapper from './components/HouseCanvasWrapper'; // The new wrapper for the canvas

// Import the state persistence hook (if you have a JS version)
// If not, you can use standard useState and localStorage manually, or just useState for now.
// Assuming a simple useState for this example:
// import { usePersistentState } from './hooks/usePersistentState'; // Use this if you have it

import './App.css';

function App() {
  // --- State lifted up to the App component ---

  // Use standard useState for rooms (replace with usePersistentState if available)
  const [rooms, setRooms] = useState(() => {
    // Load initial rooms from localStorage if desired
    const savedRooms = localStorage.getItem('rooms');
    try {
        return savedRooms ? JSON.parse(savedRooms) : [];
    } catch (e) {
        console.error("Failed to parse saved rooms:", e);
        return [];
    }
  });

  // Use standard useState for settings (replace with usePersistentState if available)
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('pipeSettings');
    const defaultSettings = {
      pipeSpacing: 150, // default mm
      maxPipeLength: 100, // default meters
      pipeDiameter: 16,  // default mm
    };
    try {
        return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
    } catch (e) {
        console.error("Failed to parse saved settings:", e);
        return defaultSettings;
    }
  });

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    try {
        localStorage.setItem('rooms', JSON.stringify(rooms));
    } catch (e) {
        console.error("Failed to save rooms:", e);
    }
  }, [rooms]);

  useEffect(() => {
    try {
        localStorage.setItem('pipeSettings', JSON.stringify(settings));
    } catch (e) {
        console.error("Failed to save settings:", e);
    }
  }, [settings]);


  // State for scale factor (example)
  const [scaleFactor, setScaleFactor] = useState(50); // Default pixels per meter

  return (
    <Router>
      <div className="App">
        {/* Simple Navigation */}
        <nav style={{ padding: '10px', borderBottom: '1px solid #ccc', marginBottom: '15px' }}>
          <Link to="/" style={{ marginRight: '15px' }}>Room Settings & Wizard</Link>
          <Link to="/house-canvas">House Canvas</Link>
           {/* Optional Scale Control */}
           <label style={{ marginLeft: '30px' }}>
                Scale (px/m):
                <input
                    type="number"
                    value={scaleFactor}
                    onChange={(e) => setScaleFactor(Math.max(10, Number(e.target.value)))}
                    step="5" min="10" max="200"
                    style={{ marginLeft: '5px', width: '60px' }}
                />
            </label>
        </nav>

        {/* --- Routes --- */}
        <Routes>
          {/* Route for the Wizard/Settings Page */}
          <Route
            path="/"
            element={
              <FloorHeatingWizard
                // Pass state and setters down as props
                initialRooms={rooms} // Pass current rooms
                onRoomsChange={setRooms} // Pass function to update rooms
                initialSettings={settings} // Pass current settings
                onSettingsChange={setSettings} // Pass function to update settings
              />
            }
          />

          {/* Route for the House Canvas Page */}
          <Route
            path="/house-canvas"
            element={
              // Render the wrapper and pass down the necessary state/props
              <HouseCanvasWrapper
                rooms={rooms} // Pass the list of rooms
                setRooms={setRooms} // Pass the function to update rooms (for position saving)
                pipeSettings={settings} // Pass the global pipe settings
                scaleFactor={scaleFactor} // Pass the current scale
              />
            }
          />
          {/* Add other routes here */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
