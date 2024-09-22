// src/components/FloorHeatingWizard.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FloorHeatingWizard = () => {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState({ name: '', dimensions: '' });
  const navigate = useNavigate();

  const handleAddRoom = () => {
    if (currentRoom.name.trim() === '' || currentRoom.dimensions.trim() === '') {
      alert('Please enter both room name and dimensions.');
      return;
    }

    setRooms([...rooms, currentRoom]);
    setCurrentRoom({ name: '', dimensions: '' });
  };

  const handleNext = () => {
    if (rooms.length === 0) {
      alert('Please add at least one room before proceeding.');
      return;
    }

    // Pass the rooms data to the next page using state
    navigate('/house-canvas', { state: { rooms } });
  };

  return (
    <div className="wizard-container">
      <h2>Floor Heating Planner - Add Rooms</h2>
      <div className="room-form">
        <input
          type="text"
          placeholder="Room Name"
          value={currentRoom.name}
          onChange={(e) => setCurrentRoom({ ...currentRoom, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Dimensions (e.g., 5x4 meters)"
          value={currentRoom.dimensions}
          onChange={(e) => setCurrentRoom({ ...currentRoom, dimensions: e.target.value })}
        />
        <button onClick={handleAddRoom}>Add Room</button>
      </div>

      <div className="rooms-list">
        <h3>Added Rooms:</h3>
        <ul>
          {rooms.map((room, index) => (
            <li key={index}>
              {room.name} - {room.dimensions}
            </li>
          ))}
        </ul>
      </div>

      <button onClick={handleNext} className="next-button">
        Next
      </button>
    </div>
  );
};

export default FloorHeatingWizard;
