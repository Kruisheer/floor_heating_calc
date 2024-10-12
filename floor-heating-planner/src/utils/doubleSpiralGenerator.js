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
  let size = Math.min(rows, cols);

  for (let i = 0; i < size; i += loopSpacing * 2) {
    // Move right
    for (let j = i; j < size - i; j++) {
      spiralPath.push({ x: j, y: i });
    }
    // Move down
    for (let j = i + 1; j < size - i; j++) {
      spiralPath.push({ x: size - i - 1, y: j });
    }
    // Move left
    for (let j = size - i - 2; j >= i; j--) {
      spiralPath.push({ x: j, y: size - i - 1 });
    }
    // Move up (shortened by loopSpacing)
    for (let j = size - i - 2; j > i + loopSpacing - 1; j--) {
      spiralPath.push({ x: i, y: j });
    }
  }

  return spiralPath;
};

/**
 * Generates a double spiral with a return spiral, similar to the provided Python version.
 *
 * @param {number} rows - Number of rows in the grid.
 * @param {number} cols - Number of columns in the grid.
 * @param {number} loopSpacing - Spacing between spiral loops in grid units.
 * @returns {Array<{ x: number, y: number }>} - Array of points representing the double spiral with return path.
 */
export const generateCounterFlowSpiralPath = (rows, cols, loopSpacing = 2) => {
  const x = [];
  const y = [];
  const xReturn = [];
  const yReturn = [];
  let size = Math.min(rows, cols);

  // Outward spiral
  for (let i = 0; i < size; i += loopSpacing * 2) {
    // Move right
    for (let j = i; j < size - i; j++) {
      x.push(j);
      y.push(i);
    }
    // Move down
    for (let j = i + 1; j < size - i; j++) {
      x.push(size - i - 1);
      y.push(j);
    }
    // Move left
    for (let j = size - i - 2; j >= i; j--) {
      x.push(j);
      y.push(size - i - 1);
    }
    // Move up (shortened)
    for (let j = size - i - 2; j > i + loopSpacing - 1; j--) {
      x.push(i);
      y.push(j);
    }
  }

  // Return spiral
  for (let i = loopSpacing; i < size; i += loopSpacing * 2) {
    // Move right
    for (let j = i; j < size - i; j++) {
      xReturn.push(j);
      yReturn.push(i);
    }
    // Move down
    for (let j = i + 1; j < size - i; j++) {
      xReturn.push(size - i - 1);
      yReturn.push(j);
    }
    // Move left
    for (let j = size - i - 2; j >= i; j--) {
      xReturn.push(j);
      yReturn.push(size - i - 1);
    }
    // Move up (shortened)
    for (let j = size - i - 2; j > i + loopSpacing - 1; j--) {
      xReturn.push(i);
      yReturn.push(j);
    }
  }

  // Align start and end points
  if (xReturn.length > 0) {
    xReturn[0] = x[0]; // Align x-coordinate
  }

  // Combine the paths
  const combinedX = x.concat(xReturn.reverse());
  const combinedY = y.concat(yReturn.reverse());

  // Adjust for grid size and starting point
  const path = [];
  for (let i = 0; i < combinedX.length; i++) {
    path.push({ x: combinedX[i], y: combinedY[i] });
  }

  return path;
};
