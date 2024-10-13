// src/utils/doubleSpiralGenerator.js

/**
 * Generates a double spiral path with a return spiral, using only right angles.
 *
 * @param {number} cols - Number of columns in the grid (gridWidth).
 * @param {number} rows - Number of rows in the grid (gridHeight).
 * @param {number} loopSpacing - Spacing between spiral loops in grid units.
 * @returns {Array<{ x: number, y: number }>} - Array of points representing the double spiral path with return.
 */
export const generateDoubleSpiralWithReturnPath = (cols, rows, loopSpacing = 2) => {
  const x = [];
  const y = [];

  const sizeX = cols;
  const sizeY = rows;
  const size = Math.min(sizeX, sizeY);

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
    // Move up (shortened by the space of two layers)
    for (let j = size - i - 2; j > i; j--) {
      x.push(i);
      y.push(j);
    }
  }

  // Return spiral
  const xReturn = [];
  const yReturn = [];

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
    // Move up (shortened by the space of two layers) #GK
    for (let j = size - i - 4; j > i; j--) {
      xReturn.push(i);
      yReturn.push(j);
    }
  }

  // Adjust the end of the return path to align with the start of the outward path
  if (xReturn.length > 0) {
    xReturn[xReturn.length - 1] = x[0];
    yReturn[yReturn.length - 1] = y[0];
  }

  // Combine paths
  const path = [];

  // Add outward spiral
  for (let i = 0; i < x.length; i++) {
    path.push({ x: x[i], y: y[i] });
  }

  // Add return spiral in reverse
  for (let i = xReturn.length - 1; i >= 0; i--) {
    path.push({ x: xReturn[i], y: yReturn[i] });
  }

  return path;
};

/**
 * Generates a double spiral path that uses only right angles.
 *
 * @param {number} cols - Number of columns in the grid.
 * @param {number} rows - Number of rows in the grid.
 * @param {number} loopSpacing - Spacing between spiral loops in grid units.
 * @returns {Array<{ x: number, y: number }>} - Array of points representing the double spiral path.
 */
export const generateDoubleSpiralPath = (cols, rows, loopSpacing = 2) => {
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
