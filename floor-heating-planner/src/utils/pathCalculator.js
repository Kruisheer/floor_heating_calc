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
 * Adjusts the loop spacing to keep the pipe length within the maximum allowed length.
 * @param {Array} grid - The 2D grid representation of the room.
 * @param {number} maxPipeLength - The maximum allowed length of the pipe in meters.
 * @param {number} initialLoopSpacing - The starting loop spacing in grid units (default is 1).
 * @param {number} gridSize - The size of each grid cell in meters (default is 0.1 meters).
 * @returns {Object} - An object containing the adjusted path and loop spacing.
 */
export const adjustLoopSpacing = (
  grid,
  maxPipeLength,
  initialLoopSpacing = 1,
  gridSize = 0.1
) => {
  let loopSpacing = initialLoopSpacing;
  let path = generateHeatingLoopPath(grid, loopSpacing);
  let pipeLength = calculatePipeLength(path, gridSize);

  // Increase loop spacing until the pipe length is within the max limit
  while (pipeLength > maxPipeLength && loopSpacing <= grid.length) {
    loopSpacing += 1; // Increase spacing to reduce pipe length
    path = generateHeatingLoopPath(grid, loopSpacing);
    pipeLength = calculatePipeLength(path, gridSize);
  }

  // If loopSpacing exceeds grid size, we cannot meet the maxPipeLength requirement
  if (loopSpacing > grid.length) {
    console.warn('Cannot adjust loop spacing to meet the maximum pipe length requirement.');
  }

  return { path, loopSpacing };
};
