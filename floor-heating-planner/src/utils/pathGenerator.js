// src/utils/pathGenerator.js

/**
 * Generates a heating loop path for underfloor heating using a spiral filling strategy.
 *
 * @param {Array<Array<number>>} grid - 2D array representing the floor plan grid. Cells with value -1 are obstacles.
 * @param {Object} options - Configuration options.
 * @param {number} [options.gridSize=0.1] - Physical size of each grid cell in meters.
 * @param {Object} [options.startPoint] - Starting point for the loop { x: number, y: number }.
 * @param {number} [options.maxPipeLength=Infinity] - Maximum allowed pipe length in meters.
 *
 * @returns {Object} - Object containing the generated path and total pipe length.
 */
export const generateHeatingLoopPath = (grid, options = {}) => {
  const gridSize = options.gridSize || 0.1; // in meters (default is 10 cm)
  const maxPipeLength = options.maxPipeLength || Infinity; // in meters
  const startPoint = options.startPoint || { x: 0, y: 0 }; // Start near the collector

  const rows = grid.length;
  const cols = grid[0].length;
  const path = [];

  // Create a copy of the grid to mark visited cells
  const visited = grid.map((row) => row.map((cell) => (cell === -1 ? -1 : 0)));

  // Direction vectors: right, down, left, up
  const dirX = [1, 0, -1, 0];
  const dirY = [0, 1, 0, -1];

  let x = startPoint.x;
  let y = startPoint.y;
  let dir = 0; // Start moving right
  let steps = 1;
  let changeDir = 0;

  // Add the starting point to the path
  if (visited[y][x] !== -1) {
    path.push({ x, y });
    visited[y][x] = 1;
  } else {
    throw new Error('Starting point is an obstacle.');
  }

  while (true) {
    let moved = false;
    for (let i = 0; i < steps; i++) {
      x += dirX[dir];
      y += dirY[dir];

      // Check boundaries and obstacles
      if (
        x >= 0 &&
        x < cols &&
        y >= 0 &&
        y < rows &&
        visited[y][x] === 0 &&
        grid[y][x] !== -1
      ) {
        path.push({ x, y });
        visited[y][x] = 1;
        moved = true;
      } else {
        // Adjust position back if we hit an obstacle or boundary
        x -= dirX[dir];
        y -= dirY[dir];
        break;
      }

      // Calculate total pipe length
      if (path.length >= 2) {
        const totalPipeLength = calculateSegmentLength(path, gridSize);
        if (totalPipeLength > maxPipeLength) {
          // Truncate the path to fit within maxPipeLength
          const allowablePoints = getAllowablePoints(path, maxPipeLength, gridSize);
          return {
            path: allowablePoints,
            totalPipeLength: calculateSegmentLength(allowablePoints, gridSize),
          };
        }
      }
    }

    // Change direction
    dir = (dir + 1) % 4;
    changeDir++;

    // Increase steps after every two direction changes
    if (changeDir % 2 === 0) {
      steps++;
    }

    if (!moved) {
      // If we didn't move, check for unvisited cells
      const nextCell = findNearestUnvisitedCell(visited, grid);
      if (nextCell) {
        x = nextCell.x;
        y = nextCell.y;
        path.push({ x, y });
        visited[y][x] = 1;
      } else {
        break; // No more cells to visit
      }
    }
  }

  // Attempt to return to the starting point
  const returnPath = findPathToStart(x, y, startPoint, grid, visited);
  if (returnPath) {
    path.push(...returnPath);
  }

  const totalPipeLength = calculateSegmentLength(path, gridSize);
  return { path, totalPipeLength };
};

/**
 * Finds the nearest unvisited cell to continue the spiral.
 * @param {Array<Array<number>>} visited - The grid with visited cells marked.
 * @param {Array<Array<number>>} grid - The original grid.
 * @returns {Object|null} - The coordinates of the nearest unvisited cell or null if none found.
 */
const findNearestUnvisitedCell = (visited, grid) => {
  for (let y = 0; y < visited.length; y++) {
    for (let x = 0; x < visited[0].length; x++) {
      if (visited[y][x] === 0 && grid[y][x] !== -1) {
        return { x, y };
      }
    }
  }
  return null;
};

/**
 * Finds a path back to the starting point using BFS.
 * @param {number} x - Current x-coordinate.
 * @param {number} y - Current y-coordinate.
 * @param {Object} startPoint - The starting point { x: number, y: number }.
 * @param {Array<Array<number>>} grid - The grid.
 * @param {Array<Array<number>>} visited - The grid with visited cells marked.
 * @returns {Array<Object>|null} - The path to the starting point or null if none found.
 */
const findPathToStart = (x, y, startPoint, grid, visited) => {
  const queue = [];
  const cameFrom = {};
  const key = (x, y) => `${x},${y}`;

  queue.push({ x, y });
  cameFrom[key(x, y)] = null;

  while (queue.length > 0) {
    const current = queue.shift();
    if (current.x === startPoint.x && current.y === startPoint.y) {
      // Reconstruct path
      const path = [];
      let currKey = key(current.x, current.y);
      while (currKey) {
        const [cx, cy] = currKey.split(',').map(Number);
        path.unshift({ x: cx, y: cy });
        currKey = cameFrom[currKey];
      }
      return path.slice(1); // Exclude current position
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
        !(nKey in cameFrom)
      ) {
        queue.push({ x: nx, y: ny });
        cameFrom[nKey] = key(current.x, current.y);
      }
    }
  }

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

/**
 * Determines the allowable number of points to stay within the remaining length.
 *
 * @param {Array<{ x: number, y: number }>} segment - The current segment of points.
 * @param {number} remainingLength - Remaining allowable length in meters.
 * @param {number} gridSize - Physical size of each grid cell in meters.
 *
 * @returns {Array<{ x: number, y: number }>} - Truncated array of points within the remaining length.
 */
const getAllowablePoints = (segment, remainingLength, gridSize) => {
  if (segment.length < 2) {
    return segment;
  }

  let length = 0;
  const allowablePoints = [segment[0]]; // Start with the first point

  for (let i = 1; i < segment.length; i++) {
    const dx = segment[i].x - segment[i - 1].x;
    const dy = segment[i].y - segment[i - 1].y;
    const segmentLength = Math.sqrt(dx * dx + dy * dy) * gridSize;

    if (length + segmentLength > remainingLength) {
      break;
    }

    length += segmentLength;
    allowablePoints.push(segment[i]);
  }

  return allowablePoints;
};
