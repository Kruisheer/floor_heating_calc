// src/utils/pathGenerator.js

import { generateDoubleSpiralPath, generateCounterFlowSpiralPath } from './doubleSpiralGenerator';

/**
 * Generates a heating loop path for underfloor heating.
 *
 * @param {Array<Array<number>>} grid - 2D array representing the floor plan grid.
 * @param {Object} options - Configuration options.
 * @param {number} [options.gridSize=0.1] - Physical size of each grid cell in meters.
 * @param {Object} [options.startPoint] - Starting point { x: number, y: number }.
 * @param {Object} [options.endPoint] - Ending point { x: number, y: number }.
 * @param {number} [options.maxPipeLength=Infinity] - Maximum allowed pipe length in meters.
 * @param {number} [options.loopSpacing=2] - Spacing between loops in grid units.
 * @param {string} [options.method='doubleSpiral'] - Path generation method.
 *
 * @returns {Object} - Object containing the generated path and total pipe length.
 */
export const generateHeatingLoopPath = (grid, options = {}) => {
  console.log('Starting generateHeatingLoopPath');

  const gridSize = options.gridSize || 0.1; // in meters
  const maxPipeLength = options.maxPipeLength || Infinity; // in meters
  const startPoint = options.startPoint || { x: 0, y: 0 };
  const endPoint = options.endPoint || { x: 0, y: 0 };
  const loopSpacing = options.loopSpacing || 2;
  const method = options.method || 'doubleSpiral';

  const rows = grid.length;
  const cols = grid[0].length;

  let path = [];
  let totalPipeLength = 0;

  // Use the selected path generation method
  if (method === 'doubleSpiralSnake') {
    console.log('Using double spiral snake path generation method.');

    // Generate the counter-flow spiral path
    const spiralPath = generateCounterFlowSpiralPath(rows, cols, loopSpacing);

    // Adjust path based on start point
    path = adjustPathToStartPoint(spiralPath, startPoint, grid);

    // Calculate total pipe length
    totalPipeLength = calculateSegmentLength(path, gridSize);

  } else if (method === 'doubleSpiral') {
    console.log('Using double spiral path generation method.');

    // Generate the double spiral path
    const spiralPath = generateDoubleSpiralPath(rows, cols, loopSpacing);

    // Adjust path based on start point
    path = adjustPathToStartPoint(spiralPath, startPoint, grid);

    // Calculate total pipe length
    totalPipeLength = calculateSegmentLength(path, gridSize);

  } else if (method === 'original') {
    console.log('Using original path generation method.');

    // Use an algorithm similar to the double spiral to generate right-angle paths
    path = generateOriginalPath(grid, loopSpacing, startPoint);

    // Calculate total pipe length
    totalPipeLength = calculateSegmentLength(path, gridSize);

  } else {
    throw new Error(`Unknown path generation method: ${method}`);
  }

  console.log('Final Pipe Length:', totalPipeLength);
  console.log('Path Generation Completed');

  return { path, totalPipeLength };
};

/**
 * Adjusts the generated path to start from the specified starting point.
 */
const adjustPathToStartPoint = (spiralPath, startPoint, grid) => {
  const adjustedPath = [];
  const visited = grid.map(row => row.map(cell => (cell === -1 ? -1 : 0)));
  const rows = grid.length;
  const cols = grid[0].length;

  for (let i = 0; i < spiralPath.length; i++) {
    let { x, y } = spiralPath[i];

    // Offset the spiral to start from the startPoint
    x += startPoint.x;
    y += startPoint.y;

    // Boundary and obstacle checks
    if (
      x >= 0 &&
      x < cols &&
      y >= 0 &&
      y < rows &&
      grid[y][x] !== -1 &&
      visited[y][x] === 0
    ) {
      // Mark as visited and add point to path
      visited[y][x] = 1;
      adjustedPath.push({ x, y });
    }
  }
  return adjustedPath;
};

/**
 * Generates the original spiral path.
 */
const generateOriginalPath = (grid, loopSpacing, startPoint) => {
  const path = [];
  const visited = grid.map(row => row.map(cell => (cell === -1 ? -1 : 0)));
  const rows = grid.length;
  const cols = grid[0].length;

  let left = startPoint.x;
  let right = startPoint.x;
  let top = startPoint.y;
  let bottom = startPoint.y;

  while (left >= 0 || right < cols || top >= 0 || bottom < rows) {
    // Move right along top boundary
    for (let x = left; x <= right; x++) {
      if (isValidMove(x, top, grid, visited)) {
        path.push({ x, y: top });
        markVisited(x, top, visited);
      }
    }
    top -= loopSpacing;

    // Move down along right boundary
    for (let y = top + 1; y <= bottom; y++) {
      if (isValidMove(right, y, grid, visited)) {
        path.push({ x: right, y });
        markVisited(right, y, visited);
      }
    }
    right += loopSpacing;

    // Move left along bottom boundary
    for (let x = right - 1; x >= left; x--) {
      if (isValidMove(x, bottom, grid, visited)) {
        path.push({ x, y: bottom });
        markVisited(x, bottom, visited);
      }
    }
    bottom += loopSpacing;

    // Move up along left boundary
    for (let y = bottom - 1; y > top; y--) {
      if (isValidMove(left, y, grid, visited)) {
        path.push({ x: left, y });
        markVisited(left, y, visited);
      }
    }
    left -= loopSpacing;
  }

  return path;
};

/**
 * Helper function to check if the move is valid.
 */
const isValidMove = (x, y, grid, visited) => {
  return (
    x >= 0 &&
    y >= 0 &&
    y < grid.length &&
    x < grid[0].length &&
    grid[y][x] !== -1 &&
    visited[y][x] === 0
  );
};

/**
 * Helper function to mark a cell as visited.
 */
const markVisited = (x, y, visited) => {
  visited[y][x] = 1;
};

/**
 * Calculates the distance between two points moving along grid lines (right angles).
 */
const calculateDistance = (pointA, pointB, gridSize) => {
  const dx = Math.abs(pointB.x - pointA.x);
  const dy = Math.abs(pointB.y - pointA.y);
  return (dx + dy) * gridSize; // Manhattan distance along grid axes
};

/**
 * Calculates the total length of a path segment moving along grid lines.
 */
const calculateSegmentLength = (segment, gridSize) => {
  if (segment.length < 2) {
    return 0;
  }

  let length = 0;
  for (let i = 1; i < segment.length; i++) {
    length += calculateDistance(segment[i - 1], segment[i], gridSize);
  }
  return length;
};
