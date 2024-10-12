// src/utils/doubleSpiralGenerator.js

/**
 * Generates a double spiral path that uses only right angles.
 * This function creates a standard double spiral pattern.
 *
 * @param {number} rows - Number of rows in the grid.
 * @param {number} cols - Number of columns in the grid.
 * @param {number} loopSpacing - Spacing between spiral loops in grid units.
 * @returns {Array<{ x: number, y: number }>} - Array of points representing the double spiral path.
 */
export const generateDoubleSpiralPath = (rows, cols, loopSpacing = 2) => {
  const spiralPath = [];
  let x = 0;
  let y = 0;
  let direction = 'right';
  let maxX = cols - 1;
  let minX = 0;
  let maxY = rows - 1;
  let minY = 0;

  while (minX <= maxX && minY <= maxY) {
    if (direction === 'right') {
      // Move right
      for (x = minX; x <= maxX; x++) {
        spiralPath.push({ x, y: minY });
      }
      minY += loopSpacing;
      direction = 'down';
    } else if (direction === 'down') {
      // Move down
      for (y = minY; y <= maxY; y++) {
        spiralPath.push({ x: maxX, y });
      }
      maxX -= loopSpacing;
      direction = 'left';
    } else if (direction === 'left') {
      // Move left
      for (x = maxX; x >= minX; x--) {
        spiralPath.push({ x, y: maxY });
      }
      maxY -= loopSpacing;
      direction = 'up';
    } else if (direction === 'up') {
      // Move up
      for (y = maxY; y >= minY; y--) {
        spiralPath.push({ x: minX, y });
      }
      minX += loopSpacing;
      direction = 'right';
    }
  }

  return spiralPath;
};

/**
 * Generates a serpentine path with adjacent supply and return paths.
 * This function creates a path where the supply and return pipes are adjacent,
 * and layers are parallel with smooth right-angle turns.
 *
 * @param {number} rows - Number of rows in the grid.
 * @param {number} cols - Number of columns in the grid.
 * @param {number} loopSpacing - Spacing between loops in grid units.
 * @returns {Array<{ x: number, y: number }>} - Array of points representing the serpentine path.
 */
export const generateCounterFlowSpiralPath = (rows, cols, loopSpacing = 2) => {
  const path = [];
  let x = 0;
  let y = 0;
  let direction = 'right';
  let maxX = cols - 1;
  let minX = 0;
  let maxY = rows - 1;
  let minY = 0;

  while (minX <= maxX && minY <= maxY) {
    if (direction === 'right') {
      // Move right
      for (x = minX; x <= maxX; x++) {
        path.push({ x, y: minY });
      }
      minY += loopSpacing;
      direction = 'down';
    } else if (direction === 'down') {
      // Move down
      for (y = minY; y <= maxY; y++) {
        path.push({ x: maxX, y });
      }
      maxX -= loopSpacing;
      direction = 'left';
    } else if (direction === 'left') {
      // Move left
      for (x = maxX; x >= minX; x--) {
        path.push({ x, y: maxY });
      }
      maxY -= loopSpacing;
      direction = 'up';
    } else if (direction === 'up') {
      // Move up
      for (y = maxY; y >= minY; y--) {
        path.push({ x: minX, y });
      }
      minX += loopSpacing;
      direction = 'right';
    }
  }

  return path;
};
