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

  const maxLayersX = Math.floor(cols / (loopSpacing * 2));
  const maxLayersY = Math.floor(rows / (loopSpacing * 2));
  const maxLayers = Math.min(maxLayersX, maxLayersY);

  // Outward spiral
  for (let i = 0; i < maxLayers * loopSpacing * 2; i += loopSpacing * 2) {
    const left = i;
    const right = cols - i - 1;
    const top = i;
    const bottom = rows - i - 2;

    // Move right
    for (let j = left; j <= right; j++) {
      x.push(j);
      y.push(top);
    }
    // Move down
    for (let j = top + 1; j <= bottom; j++) {
      x.push(right);
      y.push(j);
    }
    // Move left
    for (let j = right - 1; j >= left; j--) {
      x.push(j);
      y.push(bottom);
    }
    // Move up
    for (let j = bottom - 1; j > top; j--) {
      x.push(left);
      y.push(j);
    }
  }

  // Return spiral
  const xReturn = [];
  const yReturn = [];

  for (let i = loopSpacing; i < maxLayers * loopSpacing * 2; i += loopSpacing * 2) {
    const left = i;
    const right = cols - i - 1;
    const top = i;
    const bottom = rows - i - 1;

    // Move right
    for (let j = left; j <= right; j++) {
      xReturn.push(j);
      yReturn.push(top);
    }
    // Move down
    for (let j = top + 1; j <= bottom; j++) {
      xReturn.push(right);
      yReturn.push(j);
    }
    // Move left
    for (let j = right - 1; j >= left; j--) {
      xReturn.push(j);
      yReturn.push(bottom);
    }
    // Move up
    for (let j = bottom - 1; j > top; j--) {
      xReturn.push(left);
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
  console.log('Edge lengths:');
  console.log('Right edge length:', right - left + 1);
  console.log('Down edge length:', bottom - top);
  console.log('Left edge length:', right - left + 1);
  console.log('Up edge length:', bottom - top - 1);

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
