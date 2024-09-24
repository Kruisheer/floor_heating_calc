// src/components/DraggableRoom.js

import React, { useEffect } from 'react';
import Draggable from 'react-draggable';
import RoomCanvas from './RoomCanvas';
import { createRoomGrid, addObstaclesToGrid, addPassagewaysToGrid } from '../utils/roomGrid';
import { generateHeatingLoopPath } from '../utils/pathGenerator';
import './DraggableRoom.css';

const DraggableRoom = ({
  name,
  dimensions,
  obstacles = [],
  passageways = [],
  position = { x: 0, y: 0 },
  onDragStop,
  onPipeLengthCalculated, // New prop
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
  let gridWithObstacles = addObstaclesToGrid(grid, obstacles);

  // Add passageways to the grid (if any)
  gridWithObstacles = addPassagewaysToGrid(gridWithObstacles, passageways, dimensions, gridResolution);

  // Generate the heating loop path
  const { path, totalPipeLength } = generateHeatingLoopPath(gridWithObstacles, {
    gridSize: gridResolution,
  });

  // Adjust cell size for the RoomCanvas
  const cellSizeX = roomWidth / grid[0].length;
  const cellSizeY = roomHeight / grid.length;

  // Notify the parent component of the pipe length
  useEffect(() => {
    if (onPipeLengthCalculated) {
      onPipeLengthCalculated(name, totalPipeLength);
    }
  }, [onPipeLengthCalculated, name, totalPipeLength]);

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
        {/* Room Canvas */}
        <RoomCanvas
          grid={gridWithObstacles}
          path={path}
          roomWidth={roomWidth}
          roomHeight={roomHeight}
          cellSizeX={cellSizeX}
          cellSizeY={cellSizeY}
          passageways={passageways}
        />
      </div>
    </Draggable>
  );
};

export default DraggableRoom;
