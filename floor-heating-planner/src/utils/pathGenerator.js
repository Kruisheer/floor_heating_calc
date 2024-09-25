// src/utils/pathGenerator.js

/**
 * Generates a heating loop path for underfloor heating using a double spiral pattern.
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
  console.log('Starting generateHeatingLoopPath');

  const gridSize = options.gridSize || 0.1; // in meters (default is 10 cm)
  const maxPipeLength = options.maxPipeLength || Infinity; // in meters
  const startPoint = options.startPoint || { x: 0, y: 0 }; // Start near the collector

  const rows = grid.length;
  const cols = grid[0].length;
  const path = [];

  console.log(`Grid Size: Rows=${rows}, Cols=${cols}`);
  console.log(`Start Point: x=${startPoint.x}, y=${startPoint.y}`);

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

  // Initialize boundaries
  let top = 0;
  let bottom = rows - 1;
  let left = 0;
  let right = cols - 1;

  let x = startPoint.x;
  let y = startPoint.y;

  if (visited[y][x] !== -1) {
    path.push({ x, y });
    visited[y][x] = 1;
    console.log('Added starting point to path');
  } else {
    throw new Error('Starting point is an obstacle.');
  }

  let layer = 0;

  // Inward Spiral
  while (
    left + layer <= right - layer &&
    top + layer <= bottom - layer
  ) {
    console.log(`Processing Inward Spiral Layer: ${layer}`);

    // Right
    for (
      let currentX = left + layer;
      currentX <= right - layer;
      currentX++
    ) {
      let currentY = top + layer;
      if (
        grid[currentY][currentX] !== -1 &&
        visited[currentY][currentX] === 0
      ) {
        path.push({ x: currentX, y: currentY });
        visited[currentY][currentX] = 1;
        console.log('Added point:', { x: currentX, y: currentY });
      }
    }

    // Down
    for (
      let currentY = top + layer + 1;
      currentY <= bottom - layer;
      currentY++
    ) {
      let currentX = right - layer;
      if (
        grid[currentY][currentX] !== -1 &&
        visited[currentY][currentX] === 0
      ) {
        path.push({ x: currentX, y: currentY });
        visited[currentY][currentX] = 1;
        console.log('Added point:', { x: currentX, y: currentY });
      }
    }

    // Left
    for (
      let currentX = right - layer - 1;
      currentX >= left + layer;
      currentX--
    ) {
      let currentY = bottom - layer;
      if (
        grid[currentY][currentX] !== -1 &&
        visited[currentY][currentX] === 0
      ) {
        path.push({ x: currentX, y: currentY });
        visited[currentY][currentX] = 1;
        console.log('Added point:', { x: currentX, y: currentY });
      }
    }

    // Up
    for (
      let currentY = bottom - layer - 1;
      currentY >= top + layer + 1;
      currentY--
    ) {
      let currentX = left + layer;
      if (
        grid[currentY][currentX] !== -1 &&
        visited[currentY][currentX] === 0
      ) {
        path.push({ x: currentX, y: currentY });
        visited[currentY][currentX] = 1;
        console.log('Added point:', { x: currentX, y: currentY });
      }
    }

    // Check pipe length
    let totalPipeLength = calculateSegmentLength(path, gridSize);
    console.log('Total Pipe Length after inward spiral:', totalPipeLength);

    if (totalPipeLength > maxPipeLength) {
      console.log('Max pipe length exceeded during inward spiral');
      const allowablePoints = getAllowablePoints(
        path,
        maxPipeLength,
        gridSize
      );
      return {
        path: allowablePoints,
        totalPipeLength: calculateSegmentLength(
          allowablePoints,
          gridSize
        ),
      };
    }

    layer++; // Move to the next inner layer
    if (layer > Math.floor(Math.min(cols, rows) / 2)) {
      console.log('Reached maximum inward spiral layers');
      break;
    }
  }

  // Outward Spiral (filling the gaps)
  layer--; // Adjust layer for outward spiral

  while (layer >= 0) {
    console.log(`Processing Outward Spiral Layer: ${layer}`);

    // Right
    for (
      let currentX = left + layer + 1;
      currentX <= right - layer - 1;
      currentX++
    ) {
      let currentY = top + layer + 1;
      if (
        grid[currentY][currentX] !== -1 &&
        visited[currentY][currentX] === 0
      ) {
        path.push({ x: currentX, y: currentY });
        visited[currentY][currentX] = 1;
        console.log('Added point:', { x: currentX, y: currentY });
      }
    }

    // Down
    for (
      let currentY = top + layer + 2;
      currentY <= bottom - layer - 1;
      currentY++
    ) {
      let currentX = right - layer - 1;
      if (
        grid[currentY][currentX] !== -1 &&
        visited[currentY][currentX] === 0
      ) {
        path.push({ x: currentX, y: currentY });
        visited[currentY][currentX] = 1;
        console.log('Added point:', { x: currentX, y: currentY });
      }
    }

    // Left
    for (
      let currentX = right - layer - 2;
      currentX >= left + layer + 1;
      currentX--
    ) {
      let currentY = bottom - layer - 1;
      if (
        grid[currentY][currentX] !== -1 &&
        visited[currentY][currentX] === 0
      ) {
        path.push({ x: currentX, y: currentY });
        visited[currentY][currentX] = 1;
        console.log('Added point:', { x: currentX, y: currentY });
      }
    }

    // Up
    for (
      let currentY = bottom - layer - 2;
      currentY >= top + layer + 2;
      currentY--
    ) {
      let currentX = left + layer + 1;
      if (
        grid[currentY][currentX] !== -1 &&
        visited[currentY][currentX] === 0
      ) {
        path.push({ x: currentX, y: currentY });
        visited[currentY][currentX] = 1;
        console.log('Added point:', { x: currentX, y: currentY });
      }
    }

    // Check pipe length
    let totalPipeLength = calculateSegmentLength(path, gridSize);
    console.log('Total Pipe Length after outward spiral:', totalPipeLength);

    if (totalPipeLength > maxPipeLength) {
      console.log('Max pipe length exceeded during outward spiral');
      const allowablePoints = getAllowablePoints(
        path,
        maxPipeLength,
        gridSize
      );
      return {
        path: allowablePoints,
        totalPipeLength: calculateSegmentLength(
          allowablePoints,
          gridSize
        ),
      };
    }

    layer--; // Move to the next outer layer
  }

  // Attempt to return to the starting point
  const lastPoint = path[path.length - 1];
  console.log('Last Point before return path:', lastPoint);
  console.log('Attempting to find return path');

  const returnPath = findPathToStart(
    lastPoint.x,
    lastPoint.y,
    startPoint,
    grid,
    visited
  );

  if (returnPath) {
    console.log('Return path found:', returnPath);
    path.push(...returnPath);
  } else {
    console.warn('No return path found to the starting point.');
  }

  const finalPipeLength = calculateSegmentLength(path, gridSize);
  console.log('Final Pipe Length:', finalPipeLength);
  console.log('Path Generation Completed');

  return { path, totalPipeLength: finalPipeLength };
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
  console.log('Starting findPathToStart');
  const queue = [];
  const cameFrom = {};
  const key = (x, y) => `${x},${y}`;

  queue.push({ x, y });
  cameFrom[key(x, y)] = null;

  while (queue.length > 0) {
    const current = queue.shift();

    if (
      current.x === startPoint.x &&
      current.y === startPoint.y
    ) {
      // Reconstruct path
      const path = [];
      let currKey = key(current.x, current.y);
      while (currKey) {
        const [cx, cy] = currKey.split(',').map(Number);
        path.unshift({ x: cx, y: cy });
        currKey = cameFrom[currKey];
      }
      console.log('Path to start found:', path);
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
