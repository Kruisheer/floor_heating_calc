// src/utils/pathGenerator.js

/**
 * Generates a heating loop path for underfloor heating using a spiral pattern with configurable loop spacing.
 *
 * @param {Array<Array<number>>} grid - 2D array representing the floor plan grid. Cells with value -1 are obstacles.
 * @param {Object} options - Configuration options.
 * @param {number} [options.gridSize=0.1] - Physical size of each grid cell in meters.
 * @param {Object} [options.startPoint] - Starting point for the loop { x: number, y: number }.
 * @param {Object} [options.endPoint] - Ending point for the loop { x: number, y: number }.
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
  const endPoint = options.endPoint || { x: 0, y: 0 };     // End point
  const loopSpacing = options.loopSpacing || 1;          // Loop spacing in grid units

  const rows = grid.length;
  const cols = grid[0].length;
  const path = [];

  console.log(`Grid Size: Rows=${rows}, Cols=${cols}`);
  console.log(`Start Point: x=${startPoint.x}, y=${startPoint.y}`);
  console.log(`End Point: x=${endPoint.x}, y=${endPoint.y}`);
  console.log(`Loop Spacing: ${loopSpacing} grid units`);

  // Validate start and end points
  if (
    startPoint.x < 0 || startPoint.x >= cols ||
    startPoint.y < 0 || startPoint.y >= rows
  ) {
    throw new Error('Starting point is out of grid boundaries.');
  }

  if (
    endPoint.x < 0 || endPoint.x >= cols ||
    endPoint.y < 0 || endPoint.y >= rows
  ) {
    throw new Error('Ending point is out of grid boundaries.');
  }

  // Ensure start and end points are not obstacles
  if (grid[startPoint.y][startPoint.x] === -1) {
    throw new Error('Starting point is an obstacle.');
  }

  if (grid[endPoint.y][endPoint.x] === -1) {
    throw new Error('Ending point is an obstacle.');
  }

  // Create a copy of the grid to mark visited cells
  const visited = grid.map(row => row.map(cell => (cell === -1 ? -1 : 0)));

  // Initialize path with start point
  path.push({ x: startPoint.x, y: startPoint.y });
  visited[startPoint.y][startPoint.x] = 1;
  console.log('Added starting point to path');

  // Initialize boundaries based on start and end points
  let left = Math.min(startPoint.x, endPoint.x);
  let right = Math.max(startPoint.x, endPoint.x);
  let top = Math.min(startPoint.y, endPoint.y);
  let bottom = Math.max(startPoint.y, endPoint.y);

  let totalPipeLength = 0;
  const maxIterations = cols * rows * 4; // Prevent infinite loops
  let iterations = 0;

  while (left > 0 || right < cols - 1 || top > 0 || bottom < rows - 1) {
    // Expand boundaries
    left = Math.max(0, left - loopSpacing);
    right = Math.min(cols - 1, right + loopSpacing);
    top = Math.max(0, top - loopSpacing);
    bottom = Math.min(rows - 1, bottom + loopSpacing);

    // Move right along the top boundary
    for (let i = left; i <= right; i += loopSpacing) {
      if (grid[top][i] !== -1 && visited[top][i] === 0) {
        const lastPoint = path[path.length - 1];
        const segmentLength = calculateDistance(lastPoint, { x: i, y: top }, gridSize);
        if (totalPipeLength + segmentLength > maxPipeLength) {
          console.log('Max pipe length exceeded during spiral at top boundary');
          return { path, totalPipeLength };
        }
        path.push({ x: i, y: top });
        visited[top][i] = 1;
        totalPipeLength += segmentLength;
        console.log('Added point:', { x: i, y: top });

        // Check if we've reached the end point
        if (i === endPoint.x && top === endPoint.y) {
          console.log('End point reached at top boundary');
          return { path, totalPipeLength };
        }
      }
    }

    // Move down along the right boundary
    for (let i = top + loopSpacing; i <= bottom; i += loopSpacing) {
      if (grid[i][right] !== -1 && visited[i][right] === 0) {
        const lastPoint = path[path.length - 1];
        const segmentLength = calculateDistance(lastPoint, { x: right, y: i }, gridSize);
        if (totalPipeLength + segmentLength > maxPipeLength) {
          console.log('Max pipe length exceeded during spiral at right boundary');
          return { path, totalPipeLength };
        }
        path.push({ x: right, y: i });
        visited[i][right] = 1;
        totalPipeLength += segmentLength;
        console.log('Added point:', { x: right, y: i });

        // Check if we've reached the end point
        if (right === endPoint.x && i === endPoint.y) {
          console.log('End point reached at right boundary');
          return { path, totalPipeLength };
        }
      }
    }

    // Move left along the bottom boundary
    for (let i = right - loopSpacing; i >= left; i -= loopSpacing) {
      if (grid[bottom][i] !== -1 && visited[bottom][i] === 0) {
        const lastPoint = path[path.length - 1];
        const segmentLength = calculateDistance(lastPoint, { x: i, y: bottom }, gridSize);
        if (totalPipeLength + segmentLength > maxPipeLength) {
          console.log('Max pipe length exceeded during spiral at bottom boundary');
          return { path, totalPipeLength };
        }
        path.push({ x: i, y: bottom });
        visited[bottom][i] = 1;
        totalPipeLength += segmentLength;
        console.log('Added point:', { x: i, y: bottom });

        // Check if we've reached the end point
        if (i === endPoint.x && bottom === endPoint.y) {
          console.log('End point reached at bottom boundary');
          return { path, totalPipeLength };
        }
      }
    }

    // Move up along the left boundary
    for (let i = bottom - loopSpacing; i >= top; i -= loopSpacing) {
      if (grid[i][left] !== -1 && visited[i][left] === 0) {
        const lastPoint = path[path.length - 1];
        const segmentLength = calculateDistance(lastPoint, { x: left, y: i }, gridSize);
        if (totalPipeLength + segmentLength > maxPipeLength) {
          console.log('Max pipe length exceeded during spiral at left boundary');
          return { path, totalPipeLength };
        }
        path.push({ x: left, y: i });
        visited[i][left] = 1;
        totalPipeLength += segmentLength;
        console.log('Added point:', { x: left, y: i });

        // Check if we've reached the end point
        if (left === endPoint.x && i === endPoint.y) {
          console.log('End point reached at left boundary');
          return { path, totalPipeLength };
        }
      }
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

  // After spiral, attempt to connect to end point if not already connected
  const lastPoint = path[path.length - 1];
  if (lastPoint.x !== endPoint.x || lastPoint.y !== endPoint.y) {
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
        !path.some((point) => point.x === nx && point.y === ny) // Avoid overlapping
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
