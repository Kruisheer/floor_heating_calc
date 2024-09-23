// src/components/DraggableRoom.js

import React from 'react';
import Draggable from 'react-draggable';
import RoomCanvas from './RoomCanvas';
import { createRoomGrid, addObstaclesToGrid } from '../utils/roomGrid';
import { generateHeatingLoopPath } from '../utils/pathGenerator';
import './DraggableRoom.css';

const DraggableRoom = ({
  name,
  dimensions,
  obstacles = [],
  position,
  onDragStop,
}) => {
  // Parse the dimensions
  const [length, width] = dimensions.split('x').map(Number);

  // Define a scale factor (e.g., 1 meter = 50 pixels)
  const scaleFactor = 50;

  // Calculate the room size in pixels
  const roomWidth = width * scaleFactor;
  const roomHeight = length * scaleFactor;

  // Generate the grid, path, etc.
  const grid = createRoomGrid(dimensions);
  const gridWithObstacles = addObstaclesToGrid(grid, obstacles);

  const { path, totalPipeLength } = generateHeatingLoopPath(gridWithObstacles);

  return (
    <Draggable
      position={position}
      onStop={onDragStop}
      bounds="parent"
      grid={[10, 10]} // Optional: Snap to a 10px grid
    >
      <div
        className="draggable-room"
        style={{
          width: roomWidth,
          height: roomHeight,
        }}
      >
        <h4>{name}</h4>
        <p>{dimensions}</p>
        <p>Total Pipe Length: {totalPipeLength.toFixed(2)} meters</p>
        <RoomCanvas
          grid={gridWithObstacles}
          path={path}
          roomWidth={roomWidth}
          roomHeight={roomHeight}
        />
      </div>
    </Draggable>
  );
};

export default DraggableRoom;
