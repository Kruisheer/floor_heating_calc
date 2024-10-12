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

  // Generate return path (double spiral)
  const returnPath = spiralPath.slice().reverse();

  // Combine the outward and return paths
  const fullPath = spiralPath.concat(returnPath);

  return fullPath;
};
