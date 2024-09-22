// src/components/HouseCanvas.js

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DraggableRoom from './DraggableRoom';

const HouseCanvas = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { rooms } = location.state || { rooms: [] };

  if (!rooms || rooms.length === 0) {
    return (
      <div>
        <h2>No Rooms Added</h2>
        <button onClick={() => navigate('/')}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="house-canvas-container">
      <h2>House Canvas</h2>
      <div className="canvas">
        {rooms.map((room, index) => (
          <DraggableRoom key={index} name={room.name} dimensions={room.dimensions} />
        ))}
      </div>
      <button onClick={() => navigate('/final-step')} className="next-button">
        Next
      </button>
    </div>
  );
};

export default HouseCanvas;
