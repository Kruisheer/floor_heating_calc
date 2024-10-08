// src/components/pipeAlgorithm.js

import { createRoomGrid, addObstaclesToGrid, addPassagewaysToGrid } from '../utils/roomGrid';
import { generateHeatingLoopPath } from '../utils/pathGenerator';
import { calculatePipeLength } from '../utils/pathCalculator';

export const calculatePipeRequirements = (rooms, options = {}) => {
  let totalPipeLength = 0;
  const gridSize = options.gridSize || 0.1; // Default grid size is 0.1 meters (10 cm)

  rooms.forEach((room) => {
    // Create grid for the room
    let grid = createRoomGrid(room.dimensions, gridSize);

    // Add obstacles if any
    if (room.obstacles) {
      grid = addObstaclesToGrid(grid, room.obstacles);
    }

    // Add passageways if any
    if (room.passageways) {
      grid = addPassagewaysToGrid(grid, room.passageways, room.dimensions, gridSize);
    }

    // Add no-pipe zones if any
    if (room.noPipeZones) {
      grid = addNoPipeZonesToGrid(grid, room.noPipeZones);
    }

    // Generate heating loop path
    const { path, totalPipeLength: roomPipeLength } = generateHeatingLoopPath(grid, {
      gridSize,
      loopSpacing: room.loopSpacing || 1,
      startPoint: room.startPoint,
      endPoint: room.endPoint,
      maxPipeLength: room.maxPipeLength || 90,
    });

    // Update total pipe length
    totalPipeLength += roomPipeLength;

    // You can store or return the path if needed
    room.path = path;
  });

  return totalPipeLength;
};
