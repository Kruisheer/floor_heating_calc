// src/components/DraggableRoom.js

import React from 'react';
import './DraggableRoom.css'; // Optional: For styling

const DraggableRoom = ({ name, dimensions }) => {
  return (
    <div className="draggable-room">
      <h4>{name}</h4>
      <p>{dimensions}</p>
      {/* Additional features like drag handles can be added here */}
    </div>
  );
};

export default DraggableRoom;
