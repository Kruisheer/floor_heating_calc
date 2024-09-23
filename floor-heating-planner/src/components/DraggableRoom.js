// src/components/DraggableRoom.js

import React from 'react';
import RoomCanvas from './RoomCanvas';
import { createRoomGrid, addObstaclesToGrid } from '../utils/roomGrid';
import { generateHeatingLoopPath } from '../utils/pathGenerator';

const DraggableRoom = ({ name, dimensions, obstacles = [] }) => {
  let grid;
  try {
    grid = createRoomGrid(dimensions);
  } catch (error) {
    console.error(`Error creating grid for ${name}:`, error);
    return (
      <div className="draggable-room">
        <h4>{name}</h4>
        <p>Error: {error.message}</p>
      </div>
    );
  }

  const gridWithObstacles = addObstaclesToGrid(grid, obstacles);
  const path = generateHeatingLoopPath(gridWithObstacles);

  console.log('Grid:', grid);
  console.log('Grid with Obstacles:', gridWithObstacles);
  console.log('Generated Path:', path);

  return (
    <div className="draggable-room">
      <h4>{name}</h4>
      <p>{dimensions}</p>
      <RoomCanvas grid={gridWithObstacles} path={path} />
    </div>
  );
};

export default DraggableRoom;
