// src/utils/pathGenerator.js

import {
  generateDoubleSpiralPath,
  generateDoubleSpiralWithReturnPath,
} from './doubleSpiralGenerator';

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
  const loopSpacing = options.loopSpacing || 2;
  const method = options.method || 'doubleSpiral';

  // Set endPoint based on loopSpacing if not provided
  const endPoint = options.endPoint || {
    x: startPoint.x + loopSpacing,
    y: startPoint.y,
  };

  const rows = grid.length;
  const cols = grid[0].length;

  let path = [];
  let totalPipeLength = 0;

  // Use the selected path generation method
  if (method === 'doubleSpiralSnake') {
    console.log('Using double spiral snake path generation method.');

    // Generate the double spiral with return path
    const spiralPath = generateDoubleSpiralWithReturnPath(cols, rows, loopSpacing);

    // Adjust path based on start point and apply constraints
    const adjustedResult = adjustPathToStartPoint(
      spiralPath,
      startPoint,
      grid,
      maxPipeLength,
      gridSize
    );
    path = adjustedResult.path;
    totalPipeLength = adjustedResult.totalPipeLength;
  } else if (method === 'doubleSpiral') {
    console.log('Using double spiral path generation method.');

    // Generate the double spiral path
    const spiralPath = generateDoubleSpiralPath(rows, cols, loopSpacing);

    // Adjust path based on start point and apply constraints
    const adjustedResult = adjustPathToStartPoint(
      spiralPath,
      startPoint,
      grid,
      maxPipeLength,
      gridSize
    );
    path = adjustedResult.path;
    totalPipeLength = adjustedResult.totalPipeLength;
  } else if (method === 'original') {
    console.log('Using original path generation method.');

    // Generate the original spiral path
    path = generateOriginalPath(grid, loopSpacing, startPoint);

    // Calculate total pipe length
    totalPipeLength = calculateSegmentLength(path, gridSize);

    // Check if maxPipeLength is exceeded
    if (totalPipeLength > maxPipeLength) {
      console.log('Max pipe length exceeded.');
      return { path, totalPipeLength };
    }

    // Create a copy of the grid to mark visited cells
    const visited = grid.map((row) =>
      row.map((cell) => (cell === -1 ? -1 : 0))
    );
    for (const point of path) {
      visited[point.y][point.x] = 1;
    }

    // Attempt to connect to end point if not already connected
    const lastPoint = path[path.length - 1];
    if (
      lastPoint &&
      (lastPoint.x !== endPoint.x || lastPoint.y !== endPoint.y)
    ) {
      console.log('Attempting to connect to end point using BFS');
      const connectionResult = connectToEndPoint(
        lastPoint,
        endPoint,
        grid,
        visited,
        path,
        maxPipeLength,
        gridSize,
        totalPipeLength
      );
      path = connectionResult.path;
      totalPipeLength = connectionResult.totalPipeLength;
    }
  } else {
    throw new Error(`Unknown path generation method: ${method}`);
  }

  // Attempt to connect to end point if not already connected
  if (method !== 'original') {
    const visited = grid.map((row) =>
      row.map((cell) => (cell === -1 ? -1 : 0))
    );
    for (const point of path) {
      visited[point.y][point.x] = 1;
    }

    const lastPoint = path[path.length - 1];
    if (
      lastPoint &&
      (lastPoint.x !== endPoint.x || lastPoint.y !== endPoint.y)
    ) {
      console.log('Attempting to connect to end point using BFS');
      const connectionResult = connectToEndPoint(
        lastPoint,
        endPoint,
        grid,
        visited,
        path,
        maxPipeLength,
        gridSize,
        totalPipeLength
      );
      path = connectionResult.path;
      totalPipeLength = connectionResult.totalPipeLength;
    }
  }

  console.log('Final Pipe Length:', totalPipeLength);
  console.log('Path Generation Completed');

  return { path, totalPipeLength };
};

/**
 * Adjusts the generated path to start from the specified starting point,
 * updates the total pipe length, and applies max pipe length constraint.
 *
 * @param {Array<{ x: number, y: number }>} spiralPath - The generated spiral path.
 * @param {Object} startPoint - The starting point { x: number, y: number }.
 * @param {Array<Array<number>>} grid - The grid.
 * @param {number} maxPipeLength - Maximum allowed pipe length in meters.
 * @param {number} gridSize - Physical size of each grid cell in meters.
 *
 * @returns {Object} - { path: adjustedPath, totalPipeLength }
 */
const adjustPathToStartPoint = (
  spiralPath,
  startPoint,
  grid,
  maxPipeLength,
  gridSize
) => {
  const adjustedPath = [];
  const visited = grid.map((row) =>
    row.map((cell) => (cell === -1 ? -1 : 0))
  );
  const rows = grid.length;
  const cols = grid[0].length;

  let totalPipeLength = 0;

  const offsetX = startPoint.x;
  const offsetY = startPoint.y;

  for (let i = 0; i < spiralPath.length; i++) {
    let x = spiralPath[i].x + offsetX;
    let y = spiralPath[i].y + offsetY;

    // Boundary and obstacle checks
    if (
      x >= 0 &&
      x < cols &&
      y >= 0 &&
      y < rows &&
      grid[y][x] !== -1 &&
      visited[y][x] === 0
    ) {
      // Calculate distance if not the first point
      if (adjustedPath.length > 0) {
        const lastPoint = adjustedPath[adjustedPath.length - 1];
        const segmentLength = calculateDistance(lastPoint, { x, y }, gridSize);
        totalPipeLength += segmentLength;

        // Stop if max pipe length is exceeded
        if (totalPipeLength > maxPipeLength) {
          console.log('Max pipe length exceeded.');
          return { path: adjustedPath, totalPipeLength };
        }
      }

      adjustedPath.push({ x, y });
      visited[y][x] = 1;
    }
  }

  return { path: adjustedPath, totalPipeLength };
};

/**
 * Attempts to connect the last point of the path to the end point using BFS.
 *
 * @param {Object} lastPoint - The last point in the current path { x, y }.
 * @param {Object} endPoint - The desired end point { x, y }.
 * @param {Array<Array<number>>} grid - The grid.
 * @param {Array<Array<number>>} visited - The grid with visited cells marked.
 * @param {Array<{ x: number, y: number }>} path - The current path.
 * @param {number} maxPipeLength - Maximum allowed pipe length in meters.
 * @param {number} gridSize - Physical size of each grid cell in meters.
 * @param {number} totalPipeLength - The total pipe length so far.
 *
 * @returns {Object} - { path: updatedPath, totalPipeLength: updatedTotalPipeLength }
 */
const connectToEndPoint = (
  lastPoint,
  endPoint,
  grid,
  visited,
  path,
  maxPipeLength,
  gridSize,
  totalPipeLength
) => {
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
 * Calculates the distance between two points moving along grid lines (right angles).
 *
 * @param {Object} pointA - First point { x: number, y: number }.
 * @param {Object} pointB - Second point { x: number, y: number }.
 * @param {number} gridSize - Physical size of each grid cell in meters.
 *
 * @returns {number} - Distance in meters.
 */
const calculateDistance = (pointA, pointB, gridSize) => {
  const dx = Math.abs(pointB.x - pointA.x);
  const dy = Math.abs(pointB.y - pointA.y);
  return (dx + dy) * gridSize; // Manhattan distance along grid axes
};

/**
 * Calculates the total length of a path segment moving along grid lines.
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
    length += calculateDistance(segment[i - 1], segment[i], gridSize);
  }
  return length;
};

/**
 * Generates the original spiral path.
 */
const generateOriginalPath = (grid, loopSpacing, startPoint) => {
  const path = [];
  const visited = grid.map((row) =>
    row.map((cell) => (cell === -1 ? -1 : 0))
  );
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
