// src/components/HouseCanvas.js

import React, { useState } from 'react';
import DraggableRoom from './DraggableRoom';
import { useLocation, useNavigate } from 'react-router-dom';
import './HouseCanvas.css'; // Ensure you have appropriate styles

const HouseCanvas = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { rooms } = location.state || { rooms: [] };

  // State to track positions of rooms
  const [roomPositions, setRoomPositions] = useState({});

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
      <div className="house-canvas-container">
        {/* Sidebar for room information */}
        <div className="room-info-sidebar">
          <h3>Room Information</h3>
          {rooms.map((room, index) => (
            <div key={index} className="room-info">
              <h4>{room.name}</h4>
              <p>Dimensions: {room.dimensions} m</p>
              <p>Total Pipe Length: {/* Display calculated pipe length */}</p>
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
              onDragStop={(e, data) => {
                setRoomPositions((prev) => ({
                  ...prev,
                  [room.name]: { x: data.x, y: data.y },
                }));
              }}
            />
          ))}
        </div>
      </div>
      <button onClick={() => navigate('/final-step')} className="next-button">
        Next
      </button>
    </div>
  );
};

export default HouseCanvas;
