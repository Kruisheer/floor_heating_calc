// src/utils/pathGenerator.js

/**
 * Generates a heating loop path for underfloor heating using a double spiral pattern.
 *
 * @param {Array<Array<number>>} grid - 2D array representing the floor plan grid. Cells with value -1 are obstacles.
 * @param {Object} options - Configuration options.
 * @param {number} [options.gridSize=0.1] - Physical size of each grid cell in meters.
 * @param {number} [options.loopSpacing=1] - Spacing between loops in grid units.
 * @param {Object} [options.startPoint] - Starting point for the loop { x: number, y: number }.
 * @param {number} [options.maxPipeLength=Infinity] - Maximum allowed pipe length in meters.
 *
 * @returns {Object} - Object containing the generated path and total pipe length.
 */
export const generateHeatingLoopPath = (grid, options = {}) => {
  const gridSize = options.gridSize || 0.1; // in meters (default is 10 cm)
  const maxPipeLength = options.maxPipeLength || Infinity; // in meters
  const loopSpacing = options.loopSpacing || 1; // in grid units
  const startPoint = options.startPoint || { x: 0, y: 0 }; // Start near the collector

  const rows = grid.length;
  const cols = grid[0].length;
  const path = [];

  // Create a copy of the grid to mark visited cells
  const visited = grid.map((row) => row.map((cell) => (cell === -1 ? -1 : 0)));

  // Initialize starting point
  let x = startPoint.x;
  let y = startPoint.y;

  if (visited[y][x] !== -1) {
    path.push({ x, y });
    visited[y][x] = 1;
  } else {
    throw new Error('Starting point is an obstacle.');
  }

  // Initialize directions: Right, Down, Left, Up
  const directions = [
    { dx: 1, dy: 0 }, // Right
    { dx: 0, dy: 1 }, // Down
    { dx: -1, dy: 0 }, // Left
    { dx: 0, dy: -1 }, // Up
  ];
  let dirIndex = 0; // Start moving right

  // Initialize steps for current direction
  let steps = loopSpacing;

  // Spiral generation
  while (steps > 0) {
    for (let i = 0; i < 2; i++) { // Two turns for each layer
      for (let j = 0; j < steps; j++) {
        x += directions[dirIndex].dx;
        y += directions[dirIndex].dy;

        // Check boundaries and obstacles
        if (
          x < 0 ||
          x >= cols ||
          y < 0 ||
          y >= rows ||
          grid[y][x] === -1 ||
          visited[y][x] === 1
        ) {
          continue; // Skip invalid or already visited cells
        }

        // Add to path
        path.push({ x, y });
        visited[y][x] = 1;

        // Check pipe length
        const currentLength = calculateSegmentLength(path, gridSize);
        if (currentLength > maxPipeLength) {
          return truncatePath(path, maxPipeLength, gridSize);
        }
      }
      // Change direction
      dirIndex = (dirIndex + 1) % 4;
    }
    // Increase steps after completing two directions
    steps += loopSpacing;
  }

  // Attempt to close the loop by finding a path back to the start
  const returnPath = findPathToStart(path[path.length - 1], startPoint, grid, visited);
  if (returnPath) {
    returnPath.forEach((point) => {
      path.push(point);
      if (calculateSegmentLength(path, gridSize) > maxPipeLength) {
        path.pop(); // Remove the last point if it exceeds max length
        return;
      }
    });
  }

  const totalPipeLength = calculateSegmentLength(path, gridSize);
  return { path, totalPipeLength };
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
 * Truncates the path to fit within the maximum allowed pipe length.
 *
 * @param {Array<{ x: number, y: number }>} path - Current path.
 * @param {number} maxPipeLength - Maximum allowed pipe length in meters.
 * @param {number} gridSize - Physical size of each grid cell in meters.
 *
 * @returns {Object} - Truncated path and its length.
 */
const truncatePath = (path, maxPipeLength, gridSize) => {
  let length = 0;
  const truncatedPath = [path[0]];

  for (let i = 1; i < path.length; i++) {
    const dx = path[i].x - path[i - 1].x;
    const dy = path[i].y - path[i - 1].y;
    const segmentLength = Math.sqrt(dx * dx + dy * dy) * gridSize;

    if (length + segmentLength > maxPipeLength) {
      break;
    }

    length += segmentLength;
    truncatedPath.push(path[i]);
  }

  return { path: truncatedPath, totalPipeLength: length };
};

/**
 * Finds a path back to the starting point using BFS.
 *
 * @param {{ x: number, y: number }} currentPoint - Current point in the path.
 * @param {{ x: number, y: number }} startPoint - Starting point to return to.
 * @param {Array<Array<number>>} grid - The grid.
 * @param {Array<Array<number>>} visited - The grid with visited cells marked.
 *
 * @returns {Array<{ x: number, y: number }>|null} - The path back to the starting point or null if none found.
 */
const findPathToStart = (currentPoint, startPoint, grid, visited) => {
  const queue = [];
  const cameFrom = {};
  const key = (x, y) => `${x},${y}`;

  queue.push(currentPoint);
  cameFrom[key(currentPoint.x, currentPoint.y)] = null;

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
      return path.slice(1); // Exclude the current point
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
