// src/utils/pathGenerator.js

/**
 * Generates a heating loop path for underfloor heating using a spiral pattern with configurable loop spacing.
 *
 * @param {Array<Array<number>>} grid - 2D array representing the floor plan grid. Cells with value -1 are obstacles.
 * @param {Object} options - Configuration options.
 * @param {number} [options.gridSize=0.1] - Physical size of each grid cell in meters.
 * @param {Object} [options.startPoint] - Starting point for the loop { x: number, y: number }.
 * @param {number} [options.maxPipeLength=Infinity] - Maximum allowed pipe length in meters.
 * @param {number} [options.loopSpacing=1] - Spacing between loops in grid units.
 *
 * @returns {Object} - Object containing the generated path and total pipe length.
 */
export const generateHeatingLoopPath = (grid, options = {}) => {
  console.log('Starting generateHeatingLoopPath');

  const gridSize = options.gridSize || 0.1; // in meters (default is 10 cm)
  const maxPipeLength = options.maxPipeLength || Infinity; // in meters
  const startPoint = options.startPoint || { x: 0, y: 0 }; // Start near the collector
  const loopSpacing = options.loopSpacing || 1; // Loop spacing in grid units

  const rows = grid.length;
  const cols = grid[0].length;
  const path = [];

  console.log(`Grid Size: Rows=${rows}, Cols=${cols}`);
  console.log(`Start Point: x=${startPoint.x}, y=${startPoint.y}`);
  console.log(`Loop Spacing: ${loopSpacing} grid units`);

  // Validate start point
  if (
    startPoint.x < 0 ||
    startPoint.x >= cols ||
    startPoint.y < 0 ||
    startPoint.y >= rows
  ) {
    throw new Error('Starting point is out of grid boundaries.');
  }

  // Create a copy of the grid to mark visited cells
  const visited = grid.map((row) =>
    row.map((cell) => (cell === -1 ? -1 : 0))
  );

  let x = startPoint.x;
  let y = startPoint.y;

  if (visited[y][x] !== -1) {
    path.push({ x, y });
    visited[y][x] = 1;
    console.log('Added starting point to path');
  } else {
    throw new Error('Starting point is an obstacle.');
  }

  let left = 0;
  let right = cols - 1;
  let top = 0;
  let bottom = rows - 1;

  let totalPipeLength = 0;
  const maxSteps = cols * rows; // Maximum steps to prevent infinite loops

  while (left <= right && top <= bottom && path.length < maxSteps) {
    // Move right along the top boundary
    for (let i = left + (path.length > 1 ? loopSpacing : 0); i <= right; i += loopSpacing) {
      if (grid[top][i] !== -1 && visited[top][i] === 0) {
        const segmentLength = calculateDistance(path[path.length - 1], { x: i, y: top }, gridSize);
        if (totalPipeLength + segmentLength > maxPipeLength) {
          console.log('Max pipe length exceeded during spiral at top boundary');
          return { path, totalPipeLength };
        }
        path.push({ x: i, y: top });
        visited[top][i] = 1;
        totalPipeLength += segmentLength;
        console.log('Added point:', { x: i, y: top });
      }
    }
    top += loopSpacing;

    // Move down along the right boundary
    for (let i = top; i <= bottom; i += loopSpacing) {
      if (grid[i][right] !== -1 && visited[i][right] === 0) {
        const segmentLength = calculateDistance(path[path.length - 1], { x: right, y: i }, gridSize);
        if (totalPipeLength + segmentLength > maxPipeLength) {
          console.log('Max pipe length exceeded during spiral at right boundary');
          return { path, totalPipeLength };
        }
        path.push({ x: right, y: i });
        visited[i][right] = 1;
        totalPipeLength += segmentLength;
        console.log('Added point:', { x: right, y: i });
      }
    }
    right -= loopSpacing;

    // Move left along the bottom boundary
    for (let i = right; i >= left; i -= loopSpacing) {
      if (grid[bottom][i] !== -1 && visited[bottom][i] === 0) {
        const segmentLength = calculateDistance(path[path.length - 1], { x: i, y: bottom }, gridSize);
        if (totalPipeLength + segmentLength > maxPipeLength) {
          console.log('Max pipe length exceeded during spiral at bottom boundary');
          return { path, totalPipeLength };
        }
        path.push({ x: i, y: bottom });
        visited[bottom][i] = 1;
        totalPipeLength += segmentLength;
        console.log('Added point:', { x: i, y: bottom });
      }
    }
    bottom -= loopSpacing;

    // Move up along the left boundary
    for (let i = bottom; i >= top; i -= loopSpacing) {
      if (grid[i][left] !== -1 && visited[i][left] === 0) {
        const segmentLength = calculateDistance(path[path.length - 1], { x: left, y: i }, gridSize);
        if (totalPipeLength + segmentLength > maxPipeLength) {
          console.log('Max pipe length exceeded during spiral at left boundary');
          return { path, totalPipeLength };
        }
        path.push({ x: left, y: i });
        visited[i][left] = 1;
        totalPipeLength += segmentLength;
        console.log('Added point:', { x: left, y: i });
      }
    }
    left += loopSpacing;

    // Check if we've reached the center or if there are no more valid cells
    if (left > right || top > bottom) {
      break;
    }
  }

  // Attempt to smoothly connect the end back to the start without overlapping
  const lastPoint = path[path.length - 1];
  console.log('Last Point before connecting back:', lastPoint);
  console.log('Attempting to connect back to start without overlapping');

  const returnPath = findPathToStart(
    lastPoint.x,
    lastPoint.y,
    startPoint,
    grid,
    visited,
    path
  );
  if (returnPath) {
    // Calculate the length of the return path
    const returnPathLength = calculateSegmentLength(returnPath, gridSize);
    if (totalPipeLength + returnPathLength <= maxPipeLength) {
      path.push(...returnPath);
      totalPipeLength += returnPathLength;
    } else {
      console.log('Max pipe length exceeded during return path');
    }
  } else {
    console.warn('No return path found to the starting point.');
  }

  console.log('Final Pipe Length:', totalPipeLength);
  console.log('Path Generation Completed');

  return { path, totalPipeLength };
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
 * Finds a path back to the starting point using BFS without overlapping existing path.
 * Ensures the return path follows the spiral-like progression.
 * @param {number} x - Current x-coordinate.
 * @param {number} y - Current y-coordinate.
 * @param {Object} startPoint - The starting point { x: number, y: number }.
 * @param {Array<Array<number>>} grid - The grid.
 * @param {Array<Array<number>>} visited - The grid with visited cells marked.
 * @param {Array<Object>} path - The current path to avoid overlapping.
 * @returns {Array<Object>|null} - The path to the starting point or null if none found.
 */
const findPathToStart = (x, y, startPoint, grid, visited, path) => {
  console.log('Starting findPathToStart');
  const queue = [];
  const cameFrom = {};
  const key = (x, y) => `${x},${y}`;

  queue.push({ x, y });
  cameFrom[key(x, y)] = null;

  while (queue.length > 0) {
    const current = queue.shift();

    if (current.x === startPoint.x && current.y === startPoint.y) {
      // Reconstruct path
      const pathToStart = [];
      let currKey = key(current.x, current.y);
      while (currKey) {
        const [cx, cy] = currKey.split(',').map(Number);
        pathToStart.unshift({ x: cx, y: cy });
        currKey = cameFrom[currKey];
      }
      console.log('Path to start found:', pathToStart);
      return pathToStart.slice(1); // Exclude current position
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
        !path.some((point) => point.x === nx && point.y === ny) // Avoid overlapping
      ) {
        queue.push({ x: nx, y: ny });
        cameFrom[nKey] = key(current.x, current.y);
      }
    }
  }

  console.warn('No path found to the starting point.');
  return null;
};

/**
 * Calculates the length of a path segment.
 *
 * @param {Array<{ x: number, y: number }>} segment - Array of points representing the path segment.
 * @param {number} gridSize - Physical size of each grid cell in meters.
 *
 * @returns {number} - Length of the path segment in meters.
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
