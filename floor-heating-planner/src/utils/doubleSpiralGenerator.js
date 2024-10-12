// src/utils/doubleSpiralGenerator.js

/**
 * Generates a double spiral path that uses only right angles with configurable spacing.
 *
 * @param {number} rows - Number of rows in the grid.
 * @param {number} cols - Number of columns in the grid.
 * @param {number} loopSpacing - Spacing between spiral loops in grid units.
 * @param {number} spiralSpacing - Spacing between the outgoing and incoming spirals in grid units.
 * @returns {Array<{x: number, y: number}>} - Array of points representing the double spiral path.
 */
export const generateDoubleSpiralPath = (rows, cols, loopSpacing = 2, spiralSpacing = 2) => {
  const spiralPath1 = [];
  const spiralPath2 = [];

  // First Spiral (Outgoing)
  let left1 = 0;
  let right1 = cols - 1;
  let top1 = 0;
  let bottom1 = rows - 1;

  while (left1 <= right1 && top1 <= bottom1) {
    // Move right
    for (let x = left1; x <= right1; x++) {
      spiralPath1.push({ x, y: top1 });
    }
    top1 += loopSpacing;

    // Move down
    for (let y = top1; y <= bottom1; y++) {
      spiralPath1.push({ x: right1, y });
    }
    right1 -= loopSpacing;

    // Move left
    if (top1 <= bottom1) {
      for (let x = right1; x >= left1; x--) {
        spiralPath1.push({ x, y: bottom1 });
      }
      bottom1 -= loopSpacing;
    }

    // Move up
    if (left1 <= right1) {
      for (let y = bottom1; y >= top1; y--) {
        spiralPath1.push({ x: left1, y });
      }
      left1 += loopSpacing;
    }
  }

  // Second Spiral (Incoming) - Offset by spiralSpacing
  let left2 = spiralSpacing;
  let right2 = cols - 1 - spiralSpacing;
  let top2 = spiralSpacing;
  let bottom2 = rows - 1 - spiralSpacing;

  while (left2 <= right2 && top2 <= bottom2) {
    // Move right
    for (let x = left2; x <= right2; x++) {
      spiralPath2.push({ x, y: top2 });
    }
    top2 += loopSpacing;

    // Move down
    for (let y = top2; y <= bottom2; y++) {
      spiralPath2.push({ x: right2, y });
    }
    right2 -= loopSpacing;

    // Move left
    if (top2 <= bottom2) {
      for (let x = right2; x >= left2; x--) {
        spiralPath2.push({ x, y: bottom2 });
      }
      bottom2 -= loopSpacing;
    }

    // Move up
    if (left2 <= right2) {
      for (let y = bottom2; y >= top2; y--) {
        spiralPath2.push({ x: left2, y });
      }
      left2 += loopSpacing;
    }
  }

  // Combine both spirals into a double spiral path
  // Interleave points from both spirals to create a double spiral effect
  const maxLength = Math.max(spiralPath1.length, spiralPath2.length);
  const fullPath = [];

  for (let i = 0; i < maxLength; i++) {
    if (i < spiralPath1.length) {
      fullPath.push(spiralPath1[i]);
    }
    if (i < spiralPath2.length) {
      fullPath.push(spiralPath2[i]);
    }
  }

  return fullPath;
};
