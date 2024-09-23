// src/utils/pathGenerator.js

/**
 * Generates a heating loop path for underfloor heating using a back-and-forth filling strategy.
 *
 * @param {Array<Array<number>>} grid - 2D array representing the floor plan grid. Cells with value -1 are obstacles.
 * @param {Object} options - Configuration options.
 * @param {number} [options.loopSpacing=1] - Spacing between the loops in grid units.
 * @param {number} [options.gridSize=0.1] - Physical size of each grid cell in meters.
 * @param {Object} [options.startPoint] - Starting point for the loop { x: number, y: number }.
 * @param {number} [options.maxPipeLength=Infinity] - Maximum allowed pipe length in meters.
 *
 * @returns {Object} - Object containing the generated path and total pipe length.
 */
export const generateHeatingLoopPath = (grid, options = {}) => {
  const loopSpacing = options.loopSpacing || 1; // in grid units
  const gridSize = options.gridSize || 0.1; // in meters (default is 10 cm)
  const maxPipeLength = options.maxPipeLength || Infinity; // in meters
  const startPoint = options.startPoint || findStartingPoint(grid);

  const rows = grid.length;
  const cols = grid[0].length;
  const path = [];

  let totalPipeLength = 0;
  let direction = 1; // 1 for right, -1 for left

  // Start from the starting point's row
  let yStart = startPoint.y;

  // Iterate over the grid rows with specified loop spacing
  for (let y = yStart; y < rows && y >= 0; y += loopSpacing) {
    const rowPath = [];
    if (direction === 1) {
      // Move right
      for (let x = 0; x < cols; x++) {
        if (grid[y][x] !== -1) {
          rowPath.push({ x, y });
        }
      }
    } else {
      // Move left
      for (let x = cols - 1; x >= 0; x--) {
        if (grid[y][x] !== -1) {
          rowPath.push({ x, y });
        }
      }
    }

    // Calculate the length of this row segment
    const segmentLength = calculateSegmentLength(rowPath, gridSize);

    // Check if adding this segment exceeds maxPipeLength
    if (totalPipeLength + segmentLength > maxPipeLength) {
      // Truncate the path to fit within maxPipeLength
      const remainingLength = maxPipeLength - totalPipeLength;
      const allowablePoints = getAllowablePoints(rowPath, remainingLength, gridSize);
      path.push(...allowablePoints);
      totalPipeLength += calculateSegmentLength(allowablePoints, gridSize);
      break; // Stop adding more segments
    }

    // Add the row path to the main path
    path.push(...rowPath);
    totalPipeLength += segmentLength;

    // Change direction for the next row
    direction *= -1;
  }

  return { path, totalPipeLength };
};

/**
 * Finds a suitable starting point in the grid (e.g., the first non-obstacle cell).
 *
 * @param {Array<Array<number>>} grid - 2D array representing the floor plan grid.
 *
 * @returns {Object} - Starting point { x: number, y: number }.
 */
const findStartingPoint = (grid) => {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      if (grid[y][x] !== -1) {
        return { x, y };
      }
    }
  }
  return { x: 0, y: 0 }; // Default to (0,0) if no empty cell found
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
