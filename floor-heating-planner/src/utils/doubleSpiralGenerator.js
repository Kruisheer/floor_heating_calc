// src/utils/doubleSpiralGenerator.js

/**
 * Generates a double spiral path that uses only right angles.
 *
 * @param {number} rows - Number of rows in the grid.
 * @param {number} cols - Number of columns in the grid.
 * @param {number} loopSpacing - Spacing between spiral loops in grid units.
 * @returns {Array<{x: number, y: number}>} - Array of points representing the double spiral path.
 */
export const generateDoubleSpiralPath = (rows, cols, loopSpacing = 2) => {
  const spiralPath = [];
  let left = 0;
  let right = cols - 1;
  let top = 0;
  let bottom = rows - 1;

  while (left <= right && top <= bottom) {
    // Move right along the top row
    for (let x = left; x <= right; x++) {
      spiralPath.push({ x, y: top });
    }
    top += loopSpacing;

    // Move down along the right column
    for (let y = top; y <= bottom; y++) {
      spiralPath.push({ x: right, y });
    }
    right -= loopSpacing;

    // Move left along the bottom row
    if (top <= bottom) {
      for (let x = right; x >= left; x--) {
        spiralPath.push({ x, y: bottom });
      }
      bottom -= loopSpacing;
    }

    // Move up along the left column
    if (left <= right) {
      for (let y = bottom; y >= top; y--) {
        spiralPath.push({ x: left, y });
      }
      left += loopSpacing;
    }
  }

  return spiralPath;
};

/**
 * Generates a counter-flow spiral path with interleaved supply and return paths.
 *
 * @param {number} rows - Number of rows in the grid.
 * @param {number} cols - Number of columns in the grid.
 * @param {number} loopSpacing - Spacing between spiral loops in grid units.
 * @returns {Array<{ x: number, y: number }>} - Array of points representing the counter-flow spiral path.
 */
export const generateCounterFlowSpiralPath = (rows, cols, loopSpacing = 2) => {
  const path = [];
  let left = 0;
  let right = cols - 1;
  let top = 0;
  let bottom = rows - 1;

  while (left <= right && top <= bottom) {
    // Supply path (moving inwards)
    // Move right along top row
    for (let x = left; x <= right; x++) {
      path.push({ x, y: top });
    }
    top += loopSpacing;

    // Move down along right column
    for (let y = top; y <= bottom; y++) {
      path.push({ x: right, y });
    }
    right -= loopSpacing;

    if (left <= right && top <= bottom) {
      // Return path (moving outwards)
      // Move left along bottom row
      for (let x = right; x >= left; x--) {
        path.push({ x, y: bottom });
      }
      bottom -= loopSpacing;

      // Move up along left column
      for (let y = bottom; y >= top; y--) {
        path.push({ x: left, y });
      }
      left += loopSpacing;
    }
  }

  return path;
};

/**
 * Helper function to generate a spiral layer.
 */
const generateSpiralLayer = (path, left, right, top, bottom) => {
  // Move right along top row
  for (let x = left; x <= right; x++) {
    path.push({ x, y: top });
  }
  // Move down along right column
  for (let y = top + 1; y <= bottom; y++) {
    path.push({ x: right, y });
  }
  // Move left along bottom row
  if (bottom > top) {
    for (let x = right - 1; x >= left; x--) {
      path.push({ x, y: bottom });
    }
  }
  // Move up along left column
  if (right > left) {
    for (let y = bottom - 1; y > top; y--) {
      path.push({ x: left, y });
    }
  }
};
