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

  // Outward spiral
  let layer = 0;
  while (true) {
    const i = layer * loopSpacing;
    const left = i;
    const right = cols - i - 1;
    const top = i;
    const bottom = rows - i - 1;

    if (left > right || top > bottom) {
      break;
    }

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
    if (top !== bottom) {
      for (let j = right - 1; j >= left; j--) {
        x.push(j);
        y.push(bottom);
      }
    }

    // Move up
    if (left !== right) {
      for (let j = bottom - 1; j > top; j--) {
        x.push(left);
        y.push(j);
      }
    }

    layer += 1;
  }

  // Return spiral
  const xReturn = [];
  const yReturn = [];
  layer = 1; // Start return spiral from the next layer
  while (true) {
    const i = layer * loopSpacing;
    const left = i;
    const right = cols - i - 1;
    const top = i;
    const bottom = rows - i - 1;

    if (left > right || top > bottom) {
      break;
    }

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
    if (top !== bottom) {
      for (let j = right - 1; j >= left; j--) {
        xReturn.push(j);
        yReturn.push(bottom);
      }
    }

    // Move up
    if (left !== right) {
      for (let j = bottom - 1; j > top; j--) {
        xReturn.push(left);
        yReturn.push(j);
      }
    }

    layer += 1;
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
  let layer = 0;

  while (true) {
    const i = layer * loopSpacing;
    const left = i;
    const right = cols - i - 1;
    const top = i;
    const bottom = rows - i - 1;

    if (left > right || top > bottom) {
      break;
    }

    // Move right along the top row
    for (let x = left; x <= right; x++) {
      spiralPath.push({ x, y: top });
    }

    // Move down along the right column
    for (let y = top + 1; y <= bottom; y++) {
      spiralPath.push({ x: right, y });
    }

    // Move left along the bottom row
    if (top !== bottom) {
      for (let x = right - 1; x >= left; x--) {
        spiralPath.push({ x, y: bottom });
      }
    }

    // Move up along the left column
    if (left !== right) {
      for (let y = bottom - 1; y > top; y--) {
        spiralPath.push({ x: left, y });
      }
    }

    layer += 1;
  }

  return spiralPath;
};
