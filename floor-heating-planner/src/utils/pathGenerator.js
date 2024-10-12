// src/utils/pathGenerator.js

import { generateDoubleSpiralPath } from './doubleSpiralGenerator';

/**
 * Generates a heating loop path for underfloor heating.
 *
 * @param {Array<Array<number>>} grid - 2D array representing the floor plan grid. Cells with value -1 are obstacles.
 * @param {Object} options - Configuration options.
 * @param {number} [options.gridSize=0.1] - Physical size of each grid cell in meters.
 * @param {Object} [options.startPoint] - Starting point for the loop { x: number, y: number }.
 * @param {Object} [options.endPoint] - Ending point for the loop { x: number, y: number }.
 * @param {number} [options.maxPipeLength=Infinity] - Maximum allowed pipe length in meters.
 * @param {number} [options.loopSpacing=2] - Spacing between loops in grid units.
 * @param {number} [options.spiralSpacing=2] - Spacing between outgoing and incoming spirals in grid units (only for doubleSpiral).
 * @param {string} [options.method='doubleSpiral'] - Path generation method: 'doubleSpiral', 'original', or 'snake'.
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
  const spiralSpacing = options.spiralSpacing || 2;
  const method = options.method || 'doubleSpiral';

  const rows = grid.length;
  const cols = grid[0].length;

  let path = [];
  let totalPipeLength = 0;

  if (method === 'doubleSpiral') {
    console.log('Using double spiral path generation method.');

    // Generate the double spiral path
    const spiralPath = generateDoubleSpiralPath(rows, cols, loopSpacing, spiralSpacing);

    // Create a copy of the grid to mark visited cells
    const visited = grid.map(row => row.map(cell => (cell === -1 ? -1 : 0)));

    // Adjust the spiral path to fit within the grid and apply start point offset
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
        // Calculate segment length
        if (path.length > 0) {
          const lastPoint = path[path.length - 1];
          const segmentLength = calculateManhattanDistance(lastPoint, { x, y }, gridSize);
          totalPipeLength += segmentLength;

          if (totalPipeLength > maxPipeLength) {
            console.log('Max pipe length exceeded during double spiral.');
            break;
          }
        }

        // Mark as visited and add point to path
        visited[y][x] = 1;
        path.push({ x, y });
      }
    }

    // Attempt to connect to end point if not already connected
    const lastPoint = path[path.length - 1];
    if (lastPoint && (lastPoint.x !== endPoint.x || lastPoint.y !== endPoint.y)) {
      console.log('Attempting to connect to end point using BFS');
      const connectionPath = findPathToEndPoint(
        lastPoint.x,
        lastPoint.y,
        endPoint,
        grid,
        visited,
        path
      );

      if (connectionPath) {
        const connectionLength = calculateSegmentLength(connectionPath, gridSize);
        if (totalPipeLength + connectionLength <= maxPipeLength) {
          path.push(...connectionPath);
          totalPipeLength += connectionLength;
          console.log('Connected to end point successfully.');
        } else {
          console.log('Max pipe length exceeded during connection to end point.');
        }
      } else {
        console.warn('No connection path found to the end point.');
      }
    }
  } else if (method === 'original') {
    console.log('Using original path generation method.');

    // Original spiral path generation logic with right-angle bends
    let left = startPoint.x;
    let right = startPoint.x;
    let top = startPoint.y;
    let bottom = startPoint.y;

    const maxIterations = cols * rows * 4; // Prevent infinite loops
    let iterations = 0;

    // Create a copy of the grid to mark visited cells
    const visited = grid.map(row => row.map(cell => (cell === -1 ? -1 : 0)));

    // Initialize path with start point
    path.push({ x: startPoint.x, y: startPoint.y });
    visited[startPoint.y][startPoint.x] = 1;
    console.log('Added starting point to path');

    while (left > 0 || right < cols - 1 || top > 0 || bottom < rows - 1) {
      // Expand boundaries
      left = Math.max(0, left - loopSpacing);
      right = Math.min(cols - 1, right + loopSpacing);
      top = Math.max(0, top - loopSpacing);
      bottom = Math.min(rows - 1, bottom + loopSpacing);

      // Move right along the top boundary
      for (let i = left; i <= right; i++) {
        addPointToPath(i, top);
      }

      // Move down along the right boundary
      for (let i = top + 1; i <= bottom; i++) {
        addPointToPath(right, i);
      }

      // Move left along the bottom boundary
      for (let i = right - 1; i >= left; i--) {
        addPointToPath(i, bottom);
      }

      // Move up along the left boundary
      for (let i = bottom - 1; i > top; i--) {
        addPointToPath(left, i);
      }

      iterations++;
      if (iterations > maxIterations) {
        console.warn('Reached maximum iterations, stopping path generation to prevent infinite loop.');
        break;
      }

      // Check if we've covered the entire grid
      if (left === 0 && right === cols - 1 && top === 0 && bottom === rows - 1) {
        break;
      }
    }

    // Attempt to connect to end point if not already connected
    const lastPointOriginal = path[path.length - 1];
    if (lastPointOriginal && (lastPointOriginal.x !== endPoint.x || lastPointOriginal.y !== endPoint.y)) {
      console.log('Attempting to connect to end point using BFS');
      const connectionPath = findPathToEndPoint(
        lastPointOriginal.x,
        lastPointOriginal.y,
        endPoint,
        grid,
        visited,
        path
      );

      if (connectionPath) {
        const connectionLength = calculateSegmentLength(connectionPath, gridSize);
        if (totalPipeLength + connectionLength <= maxPipeLength) {
          path.push(...connectionPath);
          totalPipeLength += connectionLength;
          console.log('Connected to end point successfully.');
        } else {
          console.log('Max pipe length exceeded during connection to end point.');
        }
      } else {
        console.warn('No connection path found to the end point.');
      }
    }

    // Helper function to add point to path
    function addPointToPath(x, y) {
      if (x >= 0 && x < cols && y >= 0 && y < rows && grid[y][x] !== -1 && visited[y][x] === 0) {
        const lastPoint = path[path.length - 1];
        const segmentLength = calculateManhattanDistance(lastPoint, { x, y }, gridSize);
        totalPipeLength += segmentLength;

        if (totalPipeLength > maxPipeLength) {
          console.log('Max pipe length exceeded during spiral.');
          return;
        }

        path.push({ x, y });
        visited[y][x] = 1;
      }
    }
  } else if (method === 'snake') {
    console.log('Using snake path generation method.');

    // Snake pattern path generation (back-and-forth horizontal movement)
    for (let y = 0; y < rows; y++) {
      if (y % 2 === 0) {
        // Move right on even rows
        for (let x = 0; x < cols; x++) {
          if (grid[y][x] !== -1) {
            path.push({ x, y });
          }
        }
      } else {
        // Move left on odd rows
        for (let x = cols - 1; x >= 0; x--) {
          if (grid[y][x] !== -1) {
            path.push({ x, y });
          }
        }
      }
    }

    // Calculate total pipe length using Manhattan distance
    totalPipeLength = calculateSegmentLength(path, gridSize);
  } else {
    throw new Error(`Unknown path generation method: ${method}`);
  }

  console.log('Final Pipe Length:', totalPipeLength);
  console.log('Path Generation Completed');

  return { path, totalPipeLength };
};

/**
 * Finds a path from the current point to the end point using BFS without overlapping existing path.
 *
 * @param {number} x - Current x-coordinate.
 * @param {number} y - Current y-coordinate.
 * @param {Object} endPoint - The end point { x: number, y: number }.
 * @param {Array<Array<number>>} grid - The grid.
 * @param {Array<Array<number>>} visited - The grid with visited cells marked.
 * @param {Array<Object>} path - The current path to avoid overlapping.
 * @returns {Array<Object>|null} - The path to the end point or null if none found.
 */
const findPathToEndPoint = (x, y, endPoint, grid, visited, path) => {
  console.log('Starting findPathToEndPoint');
  const queue = [];
  const cameFrom = {};
  const key = (x, y) => `${x},${y}`;

  queue.push({ x, y });
  cameFrom[key(x, y)] = null;

  while (queue.length > 0) {
    const current = queue.shift();

    if (current.x === endPoint.x && current.y === endPoint.y) {
      // Reconstruct path
      const pathToEnd = [];
      let currKey = key(current.x, current.y);
      while (currKey) {
        const [cx, cy] = currKey.split(',').map(Number);
        pathToEnd.unshift({ x: cx, y: cy });
        currKey = cameFrom[currKey];
      }
      console.log('Path to end point found:', pathToEnd);
      return pathToEnd.slice(1); // Exclude current position
    }

    const directions = [
      { dx: 1, dy: 0 },  // Right
      { dx: -1, dy: 0 }, // Left
      { dx: 0, dy: 1 },  // Down
      { dx: 0, dy: -1 }, // Up
    ];

    for (const { dx, dy } of directions) {
      const nx = current.x + dx;
      const ny = current.y + dy;
      const nKey = key(nx, ny);

      if (
        nx >= 0 &&
        nx < grid[0].length &&
        ny >= 0 &&
        ny < grid.length &&
        grid[ny][nx] !== -1 &&
        !(nKey in cameFrom) &&
        visited[ny][nx] === 0 // Ensure we don't revisit
      ) {
        queue.push({ x: nx, y: ny });
        cameFrom[nKey] = key(current.x, current.y);
      }
    }
  }

  console.warn('No path found to the end point.');
  return null;
};

/**
 * Calculates the Manhattan distance between two points.
 *
 * @param {Object} pointA - First point { x: number, y: number }.
 * @param {Object} pointB - Second point { x: number, y: number }.
 * @param {number} gridSize - Physical size of each grid cell in meters.
 *
 * @returns {number} - Distance in meters.
 */
const calculateManhattanDistance = (pointA, pointB, gridSize) => {
  const dx = Math.abs(pointB.x - pointA.x);
  const dy = Math.abs(pointB.y - pointA.y);
  return (dx + dy) * gridSize; // Manhattan distance
};

/**
 * Calculates the total length of a path segment using Manhattan distance.
 *
 * @param {Array<{ x: number, y: number }>} segment - Array of points representing the path segment.
 * @param {number} gridSize - Physical size of each grid cell in meters.
 *
 * @returns {number} - Total length in meters.
 */
const calculateSegmentLength = (segment, gridSize) => {
  if (segment.length < 2) {
    return 0;
  }

  let length = 0;
  for (let i = 1; i < segment.length; i++) {
    const dx = Math.abs(segment[i].x - segment[i - 1].x);
    const dy = Math.abs(segment[i].y - segment[i - 1].y);
    length += (dx + dy) * gridSize;
  }
  return length;
};
