// src/utils/doubleSpiralGenerator.js

/**
 * Generates a double spiral path that uses only right angles.
 *
 * @param {number} rows - Number of rows in the grid.
 * @param {number} cols - Number of columns in the grid.
 * @param {number} loopSpacing - Spacing between spiral loops in grid units.
 * @returns {Array<{ x: number, y: number }>} - Array of points representing the double spiral path.
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
        spiralPath.push({ x, y: left });
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
  const supplyPath = [];
  const returnPath = [];

  let left = 0;
  let right = cols - 1;
  let top = 0;
  let bottom = rows - 1;

  while (left <= right && top <= bottom) {
    // **Supply Path (Inward Spiral)**
    // Move right along the top row
    for (let x = left; x <= right; x++) {
      supplyPath.push({ x, y: top });
    }
    top += loopSpacing;

    // Move down along the right column
    for (let y = top; y <= bottom; y++) {
      supplyPath.push({ x: right, y });
    }
    right -= loopSpacing;

    // **Return Path (Outward Spiral)**
    if (left <= right && top <= bottom) {
      // Move left along the bottom row
      for (let x = right; x >= left; x--) {
        returnPath.push({ x, y: bottom });
      }
      bottom -= loopSpacing;

      // Move up along the left column
      for (let y = bottom; y >= top; y--) {
        returnPath.push({ x, y: left });
      }
      left += loopSpacing;
    }
  }

  // Reverse the return path to align it properly with the supply path
  returnPath.reverse();

  // **Interleave Supply and Return Paths**
  const path = [];
  const maxLength = Math.max(supplyPath.length, returnPath.length);
  for (let i = 0; i < maxLength; i++) {
    if (i < supplyPath.length) {
      path.push(supplyPath[i]);
    }
    if (i < returnPath.length) {
      path.push(returnPath[i]);
    }
  }

  return path;
};
