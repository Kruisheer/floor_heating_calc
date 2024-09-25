// src/components/HouseCanvas.js

import React, { useState } from 'react';
import DraggableRoom from './DraggableRoom';
import { useLocation, useNavigate } from 'react-router-dom';
import './HouseCanvas.css';

const HouseCanvas = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { rooms } = location.state || { rooms: [] };

  // State to track positions of rooms
  const [roomPositions, setRoomPositions] = useState({});

  // State to track pipe lengths for rooms
  const [pipeLengths, setPipeLengths] = useState({});

  // State for configurable parameters
  const [loopSpacing, setLoopSpacing] = useState(1); // Default spacing: 1 grid unit
  const [startingPoint, setStartingPoint] = useState({ x: 0, y: 0 }); // Default starting point

  // Function to handle pipe length updates from DraggableRoom
  const handlePipeLengthCalculated = (roomName, pipeLength) => {
    setPipeLengths((prev) => ({
      ...prev,
      [roomName]: pipeLength,
    }));
  };

  // Function to handle starting point selection
  const handleStartingPointChange = (roomName, newStartingPoint) => {
    setStartingPoint((prev) => ({
      ...prev,
      [roomName]: newStartingPoint,
    }));
  };

  if (!rooms || rooms.length === 0) {
    return (
      <div>
        <h2>No Rooms Added</h2>
        <button onClick={() => navigate('/')}>Go Back</button>
      </div>
    );
  }

  // Define the size of the house canvas
  const houseWidth = 800; // Adjust as needed
  const houseHeight = 600; // Adjust as needed

  return (
    <div className="house-canvas-page">
      <h2>House Canvas</h2>

      {/* Configuration Sidebar */}
      <div className="configuration-sidebar">
        <h3>Configuration Settings</h3>

        {/* Loop Spacing Control */}
        <div className="config-item">
          <label htmlFor="loopSpacing">Loop Spacing (grid units): </label>
          <input
            type="number"
            id="loopSpacing"
            min="1"
            max="10"
            value={loopSpacing}
            onChange={(e) => setLoopSpacing(parseInt(e.target.value, 10) || 1)}
          />
        </div>

        {/* Starting Point Control */}
        <div className="config-item">
          <label htmlFor="startingPointX">Starting Point X (grid): </label>
          <input
            type="number"
            id="startingPointX"
            min="0"
            value={startingPoint.x}
            onChange={(e) =>
              setStartingPoint((prev) => ({
                ...prev,
                x: parseInt(e.target.value, 10) || 0,
              }))
            }
          />
          <label htmlFor="startingPointY">Y (grid): </label>
          <input
            type="number"
            id="startingPointY"
            min="0"
            value={startingPoint.y}
            onChange={(e) =>
              setStartingPoint((prev) => ({
                ...prev,
                y: parseInt(e.target.value, 10) || 0,
              }))
            }
          />
        </div>

        {/* Optional: Reset Configurations */}
        <button
          onClick={() => {
            setLoopSpacing(1);
            setStartingPoint({ x: 0, y: 0 });
          }}
          className="reset-button"
        >
          Reset to Default
        </button>
      </div>

      <div className="instructions">
        <p>
          Arrange your rooms on the canvas. Configure loop spacing and starting point as desired.
          When you're satisfied with the layout, click "Generate Heating Plan" to proceed.
        </p>
      </div>

      <div className="house-canvas-container">
        {/* Sidebar for room information */}
        <div className="room-info-sidebar">
          <h3>Room Information</h3>
          {rooms.map((room, index) => (
            <div key={index} className="room-info">
              <h4>{room.name}</h4>
              <p>Dimensions: {room.dimensions} m</p>
              <p>
                Total Pipe Length:{' '}
                {pipeLengths[room.name]
                  ? `${pipeLengths[room.name].toFixed(2)} m`
                  : 'Calculating...'}
              </p>
            </div>
          ))}
        </div>

        {/* House canvas where rooms are placed */}
        <div
          className="house-canvas"
          style={{
            width: houseWidth,
            height: houseHeight,
          }}
        >
          {rooms.map((room, index) => (
            <DraggableRoom
              key={index}
              name={room.name}
              dimensions={room.dimensions}
              obstacles={room.obstacles}
              passageways={room.passageways}
              position={roomPositions[room.name] || { x: 0, y: 0 }}
              loopSpacing={loopSpacing}
              startingPoint={startingPoint}
              onDragStop={(e, data) => {
                setRoomPositions((prev) => ({
                  ...prev,
                  [room.name]: { x: data.x, y: data.y },
                }));
              }}
              onPipeLengthCalculated={handlePipeLengthCalculated}
              onStartingPointChange={handleStartingPointChange}
            />
          ))}
        </div>
      </div>
      <button
        onClick={() => navigate('/final-step')}
        className="next-button"
        disabled={rooms.length === 0}
      >
        Generate Heating Plan
      </button>
    </div>
  );
};

export default HouseCanvas;
