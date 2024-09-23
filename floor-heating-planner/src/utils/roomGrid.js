// src/utils/roomGrid.js

/**
 * Function to create a 2D grid representation of a room based on its dimensions.
 * @param {string} dimensions - The dimensions of the room in the format "length x width" (e.g., "5x4").
 * @param {number} gridSize - The size of each grid cell in meters (default is 0.1m, which is 10cm).
 * @returns {Array<Array<number>>} - A 2D array representing the room grid.
 */
export const createRoomGrid = (dimensions, gridSize = 0.1) => {
  const [lengthStr, widthStr] = dimensions.split('x').map(s => s.trim());

  // Remove any non-digit characters (like ' meters')
  const length = parseFloat(lengthStr.replace(/[^\d.]/g, ''));
  const width = parseFloat(widthStr.replace(/[^\d.]/g, ''));

  if (isNaN(length) || isNaN(width)) {
    throw new Error(`Invalid dimensions: ${dimensions}`);
  }

  const rows = Math.floor(length / gridSize);
  const cols = Math.floor(width / gridSize);
  const grid = Array.from({ length: rows }, () => Array(cols).fill(0));
  return grid;
};

/**
 * Function to add obstacles to the room grid.
 * @param {Array<Array<number>>} grid - The 2D grid representing the room.
 * @param {Array<Object>} obstacles - An array of obstacle objects with positions in grid units.
 * Each obstacle should have the structure:
 * { xStart: number, yStart: number, xEnd: number, yEnd: number }
 * @returns {Array<Array<number>>} - The updated grid with obstacles marked.
 */
export const addObstaclesToGrid = (grid, obstacles) => {
  obstacles.forEach((obstacle) => {
    const { xStart, yStart, xEnd, yEnd } = obstacle;
    for (let y = yStart; y <= yEnd; y++) {
      for (let x = xStart; x <= xEnd; x++) {
        if (grid[y] && grid[y][x] !== undefined) {
          grid[y][x] = -1; // Mark the cell as an obstacle
        }
      }
    }
  });
  return grid;
};

/**
 * Function to create a grid for an irregularly shaped room.
 * This function modifies the grid to represent the shape mask.
 * @param {Array<Array<number>>} grid - The 2D grid representing the room.
 * @param {Array<{ x: number, y: number }>} shapeMask - An array of points that define the room's shape.
 * @returns {Array<Array<number>>} - The updated grid representing the irregular room shape.
 */
export const applyShapeMaskToGrid = (grid, shapeMask) => {
  // Initialize a new grid with all cells marked as unavailable (-1)
  const newGrid = grid.map((row) => row.map(() => -1));

  // Use a flood fill algorithm or polygon fill algorithm to mark the cells within the shape
  // For simplicity, here's a placeholder that assumes shapeMask is a rectangle
  shapeMask.forEach(({ x, y }) => {
    if (newGrid[y] && newGrid[y][x] !== undefined) {
      newGrid[y][x] = 0; // Mark the cell as available
    }
  });

  return newGrid;
};
