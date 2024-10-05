// src/components/DraggableRoom.js

import React, { useEffect, useMemo } from 'react';
import Draggable from 'react-draggable';
import RoomCanvas from './RoomCanvas';
import {
  createRoomGrid,
  addObstaclesToGrid,
  addPassagewaysToGrid,
  addNoPipeZonesToGrid, // Ensure this is imported
} from '../utils/roomGrid';
import { generateHeatingLoopPath } from '../utils/pathGenerator';
import './DraggableRoom.css';

const DraggableRoom = ({
  name,
  dimensions,
  obstacles = [],
  passageways = [],
  noPipeZones = [], // Add noPipeZones prop if implemented
  position = { x: 0, y: 0 },
  loopSpacing = 1, // Default loop spacing
  startPoint = { x: 0, y: 0 }, // Default starting point
  endPoint = { x: 0, y: 0 }, // Default ending point
  onDragStop,
  onPipeLengthCalculated,
  onStartPointChange, // Callback to update start point
  onEndPointChange,   // Callback to update end point
  maxPipeLength = 90, // Default max pipe length in meters
}) => {
  // Parse the dimensions (e.g., "5x4" becomes [5, 4])
  const [length, width] = useMemo(() => {
    const dims = dimensions.split('x').map(Number);
    return dims.length === 2 ? dims : [5, 5]; // Default to square if invalid
  }, [dimensions]);

  // Define a scale factor to convert meters to pixels (adjust as needed)
  const scaleFactor = 50; // 1 meter = 50 pixels

  // Calculate the room size in pixels
  const roomWidth = useMemo(() => width * scaleFactor, [width, scaleFactor]);
  const roomHeight = useMemo(() => length * scaleFactor, [length, scaleFactor]);

  // Create the grid for the room
  const gridResolution = 0.1; // 10 cm per grid cell
  const grid = useMemo(() => createRoomGrid(dimensions, gridResolution), [dimensions, gridResolution]);

  // Add obstacles to the grid (if any)
  const gridWithObstacles = useMemo(() => addObstaclesToGrid(grid, obstacles), [grid, obstacles]);

  // Add passageways to the grid (if any)
  const gridWithPassageways = useMemo(() => addPassagewaysToGrid(
    gridWithObstacles,
    passageways,
    dimensions,
    gridResolution
  ), [gridWithObstacles, passageways, dimensions, gridResolution]);

  // Add no-pipe zones to the grid (if any)
  const finalGrid = useMemo(() => addNoPipeZonesToGrid(
    gridWithPassageways,
    noPipeZones
  ), [gridWithPassageways, noPipeZones]);

  // Generate the heating loop path
  const { path, totalPipeLength } = useMemo(() => generateHeatingLoopPath(finalGrid, {
    gridSize: gridResolution,
    loopSpacing: loopSpacing,
    startPoint: startPoint,
    endPoint: endPoint,
    maxPipeLength: maxPipeLength,
  }), [finalGrid, gridResolution, loopSpacing, startPoint, endPoint, maxPipeLength]);
  

  // Adjust cell size for the RoomCanvas
  const cellSizeX = useMemo(() => roomWidth / grid[0].length, [roomWidth, grid]);
  const cellSizeY = useMemo(() => roomHeight / grid.length, [roomHeight, grid]);

  // Notify the parent component of the pipe length
  useEffect(() => {
    if (onPipeLengthCalculated) {
      onPipeLengthCalculated(name, totalPipeLength);
    }
  }, [onPipeLengthCalculated, name, totalPipeLength]);

  // Handle starting point updates from RoomCanvas
  const handleStartPointSet = (newPoint) => {
    if (onStartPointChange) {
      onStartPointChange(name, newPoint);
    }
  };

  // Handle ending point updates from RoomCanvas
  const handleEndPointSet = (newPoint) => {
    if (onEndPointChange) {
      onEndPointChange(name, newPoint);
    }
  };

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
          grid={finalGrid}
          path={path}
          roomWidth={roomWidth}
          roomHeight={roomHeight}
          cellSizeX={cellSizeX}
          cellSizeY={cellSizeY}
          passageways={passageways}
          loopSpacing={loopSpacing}
          startPoint={startPoint}
          endPoint={endPoint}
          onSetStartPoint={handleStartPointSet}
          onSetEndPoint={handleEndPointSet}
        />
      </div>
    </Draggable>
  );
};

export default DraggableRoom;
