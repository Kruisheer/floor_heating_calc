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
  for (let layer = 0; layer < maxLayers; layer++) {
    const i = layer * loopSpacing * 2;
    const left = i;
    const right = cols - i - 1;
    const top = i;
    const bottom = rows - i - 1;

    console.log(Layer ${layer}:);
    console.log(Left: ${left}, Right: ${right}, Top: ${top}, Bottom: ${bottom});

    // Move right
    const rightEdgeStart = x.length;
    for (let j = left; j <= right; j++) {
      x.push(j);
      y.push(top);
    }
    const rightEdgeEnd = x.length;
    console.log(  Right edge length: ${rightEdgeEnd - rightEdgeStart});

    // Move down
    const downEdgeStart = x.length;
    for (let j = top + 1; j <= bottom; j++) {
      x.push(right);
      y.push(j);
    }
    const downEdgeEnd = x.length;
    console.log(  Down edge length: ${downEdgeEnd - downEdgeStart});

    // Move left
    const leftEdgeStart = x.length;
    for (let j = right - 1; j >= left; j--) {
      x.push(j);
      y.push(bottom);
    }
    const leftEdgeEnd = x.length;
    console.log(  Left edge length: ${leftEdgeEnd - leftEdgeStart});

    // Move up
    const upEdgeStart = x.length;
    for (let j = bottom - 1; j > top + 1; j--) {
      x.push(left);
      y.push(j);
    }
    const upEdgeEnd = x.length;
    console.log(  Up edge length: ${upEdgeEnd - upEdgeStart});
  }

  // Return spiral
  const xReturn = [];
  const yReturn = [];

  for (let layer = 0; layer < maxLayers; layer++) {
    const i = layer * loopSpacing * 2 + loopSpacing;
    const left = i;
    const right = cols - i - 1;
    const top = i;
    const bottom = rows - i - 1;

    if (left > right || top > bottom) {
      console.log(Return Layer ${layer}: Skipped (No space for return path));
      continue;
    }

    console.log(Return Layer ${layer}:);
    console.log(Left: ${left}, Right: ${right}, Top: ${top}, Bottom: ${bottom});

    // Move right
    const rightEdgeStart = xReturn.length;
    for (let j = left; j <= right; j++) {
      xReturn.push(j);
      yReturn.push(top);
    }
    const rightEdgeEnd = xReturn.length;
    console.log(  Right edge length: ${rightEdgeEnd - rightEdgeStart});

    // Move down
    const downEdgeStart = xReturn.length;
    for (let j = top + 1; j <= bottom; j++) {
      xReturn.push(right);
      yReturn.push(j);
    }
    const downEdgeEnd = xReturn.length;
    console.log(  Down edge length: ${downEdgeEnd - downEdgeStart});

    // Move left
    const leftEdgeStart = xReturn.length;
    for (let j = right - 1; j >= left; j--) {
      xReturn.push(j);
      yReturn.push(bottom);
    }
    const leftEdgeEnd = xReturn.length;
    console.log(  Left edge length: ${leftEdgeEnd - leftEdgeStart});

    // Move up GK
    const upEdgeStart = xReturn.length;
    for (let j = bottom - 1; j > top + 1; j--) {
      xReturn.push(left);
      yReturn.push(j);
    }
    const upEdgeEnd = xReturn.length;
    console.log(  Up edge length: ${upEdgeEnd - upEdgeStart});
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
