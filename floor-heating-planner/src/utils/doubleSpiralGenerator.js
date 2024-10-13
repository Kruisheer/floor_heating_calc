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
  const path = [];
  const sizeX = cols;
  const sizeY = rows;
  const maxLayers = Math.floor(Math.min(sizeX, sizeY) / (loopSpacing * 2));

  // Outward spiral
  for (let layer = 0; layer < maxLayers; layer++) {
    const left = layer * loopSpacing * 2;
    const right = cols - layer * loopSpacing * 2 - 1;
    const top = layer * loopSpacing * 2;
    const bottom = rows - layer * loopSpacing * 2 - 1;

    // Move right
    for (let x = left; x <= right; x++) {
      path.push({ x, y: top });
    }

    // Move down
    for (let y = top + 1; y <= bottom; y++) {
      path.push({ x: right, y });
    }

    // Move left
    for (let x = right - 1; x >= left; x--) {
      path.push({ x, y: bottom });
    }

    // Move up (adjusted to match doubleSpiral)
    for (let y = bottom - 1; y >= top + 1; y--) {
      path.push({ x: left, y });
    }
  }

  // Return spiral
  for (let layer = maxLayers - 1; layer >= 0; layer--) {
    const left = layer * loopSpacing * 2 + loopSpacing;
    const right = cols - layer * loopSpacing * 2 - loopSpacing - 1;
    const top = layer * loopSpacing * 2 + loopSpacing;
    const bottom = rows - layer * loopSpacing * 2 - loopSpacing - 1;

    if (left > right || top > bottom) {
      continue;
    }

    // Move right
    for (let x = left; x <= right; x++) {
      path.push({ x, y: top });
    }

    // Move down
    for (let y = top + 1; y <= bottom; y++) {
      path.push({ x: right, y });
    }

    // Move left
    for (let x = right - 1; x >= left; x--) {
      path.push({ x, y: bottom });
    }

    // Move up (adjusted to match doubleSpiral)
    for (let y = bottom - 1; y >= top + 1; y--) {
      path.push({ x: left, y });
    }
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
