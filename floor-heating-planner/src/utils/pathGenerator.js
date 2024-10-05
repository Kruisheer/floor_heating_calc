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
 * @param {string} [options.method='doubleSpiral'] - Path generation method: 'doubleSpiral' or 'original'.
 *
 * @returns {Object} - Object containing the generated path and total pipe length.
 */
export const generateHeatingLoopPath = (grid, options = {}) => {
  console.log('Starting generateHeatingLoopPath');

  const gridSize = options.gridSize || 0.1; // in meters (default is 10 cm)
  const maxPipeLength = options.maxPipeLength || Infinity; // in meters
  const startPoint = options.startPoint || { x: 0, y: 0 }; // Start near the collector
  const endPoint = options.endPoint || { x: 0, y: 0 };     // End point
  const loopSpacing = options.loopSpacing || 2;            // Loop spacing in grid units
  const method = options.method || 'doubleSpiral';         // Path generation method

  const rows = grid.length;
  const cols = grid[0].length;

  let path = [];
  let totalPipeLength = 0;

  // Use the selected path generation method
  if (method === 'doubleSpiral') {
    console.log('Using double spiral path generation method.');

    // Generate the double spiral path
    const size = Math.min(rows - startPoint.y, cols - startPoint.x);
    const spiralPath = generateDoubleSpiralPath(size, loopSpacing);

    // Create a copy of the grid to mark visited cells
    const visited = grid.map(row => row.map(cell => (cell === -1 ? -1 : 0)));

    // Offset the spiral path based on the start point
    for (let i = 0; i < spiralPath.length; i++) {
      let { x, y } = spiralPath[i];

      // Adjust coordinates to start at startPoint
      x += startPoint.x;
      y += startPoint.y;

      // Check if the point is within the boundaries and not an obstacle
      if (x >= 0 && x < cols && y >= 0 && y < rows && grid[y][x] !== -1 && visited[y][x] === 0) {
        path.push({ x, y });
        visited[y][x] = 1;

        // Calculate distance if not the first point
        if (path.length > 1) {
          const lastPoint = path[path.length - 2];
          const segmentLength = calculateDistance(lastPoint, { x, y }, gridSize);
          totalPipeLength += segmentLength;

          // Stop if max pipe length is exceeded
          if (totalPipeLength > maxPipeLength) {
            console.log('Max pipe length exceeded.');
            return { path, totalPipeLength };
          }
        }
      } else {
        console.warn(`Point (${x}, ${y}) is invalid or already visited.`);
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

    // Original spiral path generation logic
    // Create a copy of the grid to mark visited cells
    const visited = grid.map(row => row.map(cell => (cell === -1 ? -1 : 0)));

    // Initialize path with start point
    path.push({ x: startPoint.x, y: startPoint.y });
    visited[startPoint.y][startPoint.x] = 1;
    console.log('Added starting point to path');

    // Initialize boundaries based on start and end points
    let left = startPoint.x;
    let right = startPoint.x;
    let top = startPoint.y;
    let bottom = startPoint.y;

    const maxIterations = cols * rows * 4; // Prevent infinite loops
    let iterations = 0;

    while (left > 0 || right < cols - 1 || top > 0 || bottom < rows - 1) {
      // Expand boundaries
      left = Math.max(0, left - loopSpacing);
      right = Math.min(cols - 1, right + loopSpacing);
      top = Math.max(0, top - loopSpacing);
      bottom = Math.min(rows - 1, bottom + loopSpacing);

      // Move right along the top boundary
      for (let i = left; i <= right; i += 1) {
        addPointToPath(i, top);
      }

      // Move down along the right boundary
      for (let i = top + 1; i <= bottom; i += 1) {
        addPointToPath(right, i);
      }

      // Move left along the bottom boundary
      for (let i = right - 1; i >= left; i -= 1) {
        addPointToPath(i, bottom);
      }

      // Move up along the left boundary
      for (let i = bottom - 1; i > top; i -= 1) {
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

    // Helper function to add point to path
    function addPointToPath(x, y) {
      if (grid[y][x] !== -1 && visited[y][x] === 0) {
        const lastPoint = path[path.length - 1];
        const segmentLength = calculateDistance(lastPoint, { x, y }, gridSize);
        if (totalPipeLength + segmentLength > maxPipeLength) {
          console.log('Max pipe length exceeded during spiral.');
          return;
        }
        path.push({ x, y });
        visited[y][x] = 1;
        totalPipeLength += segmentLength;
        // console.log('Added point:', { x, y });

        // Check if we've reached the end point
        if (x === endPoint.x && y === endPoint.y) {
          console.log('End point reached.');
          return { path, totalPipeLength };
        }
      }
    }

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
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
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
 * Calculates the distance between two points.
 *
 * @param {Object} pointA - First point { x: number, y: number }.
 * @param {Object} pointB - Second point { x: number, y: number }.
 * @param {number} gridSize - Physical size of each grid cell in meters.
 *
 * @returns {number} - Distance in meters.
 */
const calculateDistance = (pointA, pointB, gridSize) => {
  const dx = pointB.x - pointA.x;
  const dy = pointB.y - pointA.y;
  return Math.sqrt(dx * dx + dy * dy) * gridSize;
};

/**
 * Calculates the total length of a path segment.
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
    const dx = segment[i].x - segment[i - 1].x;
    const dy = segment[i].y - segment[i - 1].y;
    length += Math.sqrt(dx * dx + dy * dy) * gridSize;
  }
  return length;
};
