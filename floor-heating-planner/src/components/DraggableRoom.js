// src/components/DraggableRoom.js

import React from 'react';
import RoomCanvas from './RoomCanvas';
import { createRoomGrid } from '../utils/roomGrid';
import { generateHeatingLoopPath } from '../utils/pathGenerator';
import './DraggableRoom.css'; // Ensure this import statement is correct

const DraggableRoom = ({ name, dimensions, obstacles = [] }) => {
  const grid = createRoomGrid(dimensions);
  const gridWithObstacles = addObstaclesToGrid(grid, obstacles);
  const path = generateHeatingLoopPath(gridWithObstacles);

  return (
    <div className="draggable-room">
      <h4>{name}</h4>
      <p>{dimensions}</p>
      <RoomCanvas grid={gridWithObstacles} path={path} />
    </div>
  );
};


export default DraggableRoom;
