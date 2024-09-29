// src/utils/pathGenerator.js

import { calculateSegmentLength, getAllowablePoints } from './pathCalculator';

/**
 * Generates a heating loop path for underfloor heating using a spiral pattern with configurable loop spacing.
 *
 * @param {Array<Array<number>>} grid - 2D array representing the floor plan grid. Cells with value -1 are obstacles.
 * @param {Object} options - Configuration options.
 * @param {number} [options.gridSize=0.1] - Physical size of each grid cell in meters.
 * @param {Object} [options.startPoint] - Starting point for the loop { x: number, y: number }.
 * @param {number} [options.maxPipeLength=Infinity] - Maximum allowed pipe length in meters.
 * @param {number} [options.loopSpacing=1] - Spacing between loops in grid units.
 *
 * @returns {Object} - Object containing the generated path and total pipe length.
 */
export const generateHeatingLoopPath = (grid, options = {}) => {
  console.log('Starting generateHeatingLoopPath');

  const gridSize = options.gridSize || 0.1; // in meters (default is 10 cm)
  const maxPipeLength = options.maxPipeLength || Infinity; // in meters
  const startPoint = options.startPoint || { x: 0, y: 0 }; // Start near the collector
  const loopSpacing = options.loopSpacing || 1; // Loop spacing in grid units

  const rows = grid.length;
  const cols = grid[0].length;
  const path = [];

  console.log(`Grid Size: Rows=${rows}, Cols=${cols}`);
  console.log(`Start Point: x=${startPoint.x}, y=${startPoint.y}`);
  console.log(`Loop Spacing: ${loopSpacing} grid units`);

  // Validate start point
  if (
    startPoint.x < 0 ||
    startPoint.x >= cols ||
    startPoint.y < 0 ||
    startPoint.y >= rows
  ) {
    throw new Error('Starting point is out of grid boundaries.');
  }

  // Create a copy of the grid to mark visited cells
  const visited = grid.map((row) =>
    row.map((cell) => (cell === -1 ? -1 : 0))
  );

  let top = 0;
  let bottom = rows - 1;
  let left = 0;
  let right = cols - 1;

  let x = startPoint.x;
  let y = startPoint.y;

  if (visited[y][x] !== -1) {
    path.push({ x, y });
    visited[y][x] = 1;
    console.log('Added starting point to path');
  } else {
    throw new Error('Starting point is an obstacle.');
  }

  let layer = 0;
  let spiralComplete = false;

  while (left + layer <= right - layer && top + layer <= bottom - layer) {
    console.log(`Processing Spiral Layer: ${layer}`);

    // Determine current boundaries with loopSpacing
    const currentTop = top + layer;
    const currentBottom = bottom - layer;
    const currentLeft = left + layer;
    const currentRight = right - layer;

    // Move right across the top boundary
    for (let currentX = currentLeft + 1; currentX <= currentRight; currentX++) {
      let currentY = currentTop;
      if (grid[currentY][currentX] !== -1 && visited[currentY][currentX] === 0) {
        path.push({ x: currentX, y: currentY });
        visited[currentY][currentX] = 1;
        console.log('Added point:', { x: currentX, y: currentY });

        // Check pipe length
        let totalPipeLength = calculateSegmentLength(path, gridSize);
        if (totalPipeLength > maxPipeLength) {
          console.log('Max pipe length exceeded during spiral');
          const allowablePoints = getAllowablePoints(
            path,
            maxPipeLength,
            gridSize
          );
          return {
            path: allowablePoints,
            totalPipeLength: calculateSegmentLength(
              allowablePoints,
              gridSize
            ),
          };
        }
      }
    }

    // Move down along the right boundary
    for (let currentY = currentTop + 1; currentY <= currentBottom; currentY++) {
      let currentX = currentRight;
      if (grid[currentY][currentX] !== -1 && visited[currentY][currentX] === 0) {
        path.push({ x: currentX, y: currentY });
        visited[currentY][currentX] = 1;
        console.log('Added point:', { x: currentX, y: currentY });

        // Check pipe length
        let totalPipeLength = calculateSegmentLength(path, gridSize);
        if (totalPipeLength > maxPipeLength) {
          console.log('Max pipe length exceeded during spiral');
          const allowablePoints = getAllowablePoints(
            path,
            maxPipeLength,
            gridSize
          );
          return {
            path: allowablePoints,
            totalPipeLength: calculateSegmentLength(
              allowablePoints,
              gridSize
            ),
          };
        }
      }
    }

    // Move left across the bottom boundary
    for (
      let currentX = currentRight - 1;
      currentX >= currentLeft;
      currentX--
    ) {
      let currentY = currentBottom;
      if (grid[currentY][currentX] !== -1 && visited[currentY][currentX] === 0) {
        path.push({ x: currentX, y: currentY });
        visited[currentY][currentX] = 1;
        console.log('Added point:', { x: currentX, y: currentY });

        // Check pipe length
        let totalPipeLength = calculateSegmentLength(path, gridSize);
        if (totalPipeLength > maxPipeLength) {
          console.log('Max pipe length exceeded during spiral');
          const allowablePoints = getAllowablePoints(
            path,
            maxPipeLength,
            gridSize
          );
          return {
            path: allowablePoints,
            totalPipeLength: calculateSegmentLength(
              allowablePoints,
              gridSize
            ),
          };
        }
      }
    }

    // Move up along the left boundary
    for (
      let currentY = currentBottom - 1;
      currentY >= currentTop + 1;
      currentY--
    ) {
      let currentX = currentLeft;
      if (grid[currentY][currentX] !== -1 && visited[currentY][currentX] === 0) {
        path.push({ x: currentX, y: currentY });
        visited[currentY][currentX] = 1;
        console.log('Added point:', { x: currentX, y: currentY });

        // Check pipe length
        let totalPipeLength = calculateSegmentLength(path, gridSize);
        if (totalPipeLength > maxPipeLength) {
          console.log('Max pipe length exceeded during spiral');
          const allowablePoints = getAllowablePoints(
            path,
            maxPipeLength,
            gridSize
          );
          return {
            path: allowablePoints,
            totalPipeLength: calculateSegmentLength(
              allowablePoints,
              gridSize
            ),
          };
        }
      }
    }

    // Increment the layer by loopSpacing
    layer += loopSpacing;

    // Terminate if all layers have been processed
    if (layer > Math.floor(Math.min(cols, rows) / 2)) {
      console.log('All spiral layers processed');
      spiralComplete = true;
      break;
    }
  }

  if (!spiralComplete) {
    console.warn('Spiral did not complete all layers');
  }

  // Attempt to smoothly connect the end back to the start without overlapping
  const lastPoint = path[path.length - 1];
  console.log('Last Point before connecting back:', lastPoint);
  console.log('Attempting to connect back to start without overlapping');

  const returnPath = findPathToStart(
    lastPoint.x,
    lastPoint.y,
    startPoint,
    grid,
    visited,
    path
  );
  if (returnPath) {
    console.log('Return path found:', returnPath);
    path.push(...returnPath);
  } else {
    console.warn('No return path found to the starting point.');
  }

  const finalPipeLength = calculateSegmentLength(path, gridSize);
  console.log('Final Pipe Length:', finalPipeLength);
  console.log('Path Generation Completed');

  return { path, totalPipeLength: finalPipeLength };
};
