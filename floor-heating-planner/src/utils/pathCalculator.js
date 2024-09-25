// src/utils/pathCalculator.js

import { generateHeatingLoopPath } from './pathGenerator';

/**
 * Calculates the total length of the heating pipe based on the path and grid size.
 * @param {Array} path - An array of points representing the heating loop path.
 * @param {number} gridSize - The size of each grid cell in meters (default is 0.1 meters).
 * @returns {number} - The total length of the pipe in meters.
 */
export const calculatePipeLength = (path, gridSize = 0.1) => {
  if (path.length < 2) return 0;

  let totalLength = 0;
  for (let i = 1; i < path.length; i++) {
    const dx = path[i].x - path[i - 1].x;
    const dy = path[i].y - path[i - 1].y;
    const distance = Math.sqrt(dx * dx + dy * dy) * gridSize;
    totalLength += distance;
  }
  return totalLength;
};

/**
 * Adjusts the grid to fit within the maximum allowed pipe length.
 * @param {Array} grid - The 2D grid representation of the room.
 * @param {number} maxPipeLength - The maximum allowed length of the pipe in meters.
 * @param {number} gridSize - The size of each grid cell in meters (default is 0.1 meters).
 * @returns {Object} - An object containing the adjusted path.
 */
export const adjustGridToPipeLength = (grid, maxPipeLength, gridSize = 0.1) => {
  const { path, totalPipeLength } = generateHeatingLoopPath(grid, {
    gridSize,
    maxPipeLength,
  });

  if (totalPipeLength > maxPipeLength) {
    console.warn('Cannot adjust grid to meet the maximum pipe length requirement.');
  }

  return { path };
};
