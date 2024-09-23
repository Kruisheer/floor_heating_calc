// src/utils/roomGrid.js

export const createRoomGrid = (dimensions, gridSize = 0.1) => {
  const [length, width] = dimensions.split('x').map(Number);
  const rows = Math.floor(length / gridSize);
  const cols = Math.floor(width / gridSize);
  const grid = Array.from({ length: rows }, () => Array(cols).fill(0));
  return grid;
};
