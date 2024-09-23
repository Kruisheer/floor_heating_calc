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
  position = { x: 0, y: 0 },
  onDragStop,
}) => {
  // Parse the dimensions (e.g., "5x4" becomes [5, 4])
  const [length, width] = dimensions.split('x').map(Number);

  // Define a scale factor to convert meters to pixels (adjust as needed)
  const scaleFactor = 50; // 1 meter = 50 pixels

  // Calculate the room size in pixels
  const roomWidth = width * scaleFactor;
  const roomHeight = length * scaleFactor;

  // Create the grid for the room
  const gridResolution = 0.1; // 10 cm per grid cell
  const grid = createRoomGrid(dimensions, gridResolution);

  // Add obstacles to the grid (if any)
  const gridWithObstacles = addObstaclesToGrid(grid, obstacles);

  // Generate the heating loop path
  const { path, totalPipeLength } = generateHeatingLoopPath(gridWithObstacles, {
    gridSize: gridResolution,
  });

  // Adjust cell size for the RoomCanvas
  const cellSizeX = roomWidth / grid[0].length;
  const cellSizeY = roomHeight / grid.length;

  return (
    <Draggable
      position={position}
      onStop={onDragStop}
      grid={[scaleFactor / 2, scaleFactor / 2]} // Snap to grid (adjust as needed)
      bounds="parent"
    >
      <div
        className="draggable-room"
        style={{
          width: roomWidth,
          height: roomHeight,
        }}
      >
        {/* Room Information */}
        <div className="room-info">
          <h4>{name}</h4>
          <p>Dimensions: {dimensions} m</p>
          <p>Total Pipe Length: {totalPipeLength.toFixed(2)} m</p>
        </div>

        {/* Room Canvas */}
        <RoomCanvas
          grid={gridWithObstacles}
          path={path}
          roomWidth={roomWidth}
          roomHeight={roomHeight}
          cellSizeX={cellSizeX}
          cellSizeY={cellSizeY}
        />
      </div>
    </Draggable>
  );
};

export default DraggableRoom;
