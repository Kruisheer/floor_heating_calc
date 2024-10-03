// src/utils/roomGrid.js

/**
 * Creates a grid for the room based on dimensions and grid resolution.
 *
 * @param {string} dimensions - Room dimensions in the format "LxW" (e.g., "5x5").
 * @param {number} gridResolution - Size of each grid cell in meters.
 * @returns {Array<Array<number>>} - 2D array representing the grid.
 */
export const createRoomGrid = (dimensions, gridResolution) => {
  const [length, width] = dimensions.split('x').map(Number);
  const rows = Math.ceil(length / gridResolution);
  const cols = Math.ceil(width / gridResolution);
  const grid = Array.from({ length: rows }, () => Array(cols).fill(0));
  return grid;
};

/**
 * Adds obstacles to the grid.
 *
 * @param {Array<Array<number>>} grid - The room grid.
 * @param {Array<Object>} obstacles - Array of obstacle objects with x, y, width, height.
 * @returns {Array<Array<number>>} - Updated grid with obstacles marked as -1.
 */
export const addObstaclesToGrid = (grid, obstacles) => {
  if (!obstacles || obstacles.length === 0) return grid;

  const newGrid = grid.map(row => [...row]);

  obstacles.forEach(obstacle => {
    const { x, y, width, height } = obstacle;
    for (let i = y; i < y + height; i++) {
      for (let j = x; j < x + width; j++) {
        if (i >= 0 && i < newGrid.length && j >= 0 && j < newGrid[0].length) {
          newGrid[i][j] = -1; // Mark obstacle
        }
      }
    }
  });

  return newGrid;
};

/**
 * Adds passageways to the grid.
 *
 * @param {Array<Array<number>>} grid - The room grid.
 * @param {Array<Object>} passageways - Array of passageway objects with side, position, width.
 * @param {string} dimensions - Room dimensions in the format "LxW" (e.g., "5x5").
 * @param {number} gridResolution - Size of each grid cell in meters.
 * @returns {Array<Array<number>>} - Updated grid with passageways marked.
 */
export const addPassagewaysToGrid = (grid, passageways, dimensions, gridResolution) => {
  if (!passageways || passageways.length === 0) return grid;

  const [length, width] = dimensions.split('x').map(Number);
  const rows = grid.length;
  const cols = grid[0].length;
  const newGrid = grid.map(row => [...row]);

  passageways.forEach(passageway => {
    const { side, position, width: passageWidth } = passageway;
    let x1, y1, x2, y2;

    if (side === 'top' || side === 'bottom') {
      // Calculate starting and ending x-coordinates based on position and passageWidth
      const startX = Math.floor(position / gridResolution);
      const endX = Math.floor((position + passageWidth) / gridResolution);
      const y = side === 'top' ? 0 : rows - 1;

      for (let j = startX; j <= endX; j++) {
        if (j >= 0 && j < cols) {
          newGrid[y][j] = 0; // Clear passageway
        }
      }
    } else if (side === 'left' || side === 'right') {
      // Calculate starting and ending y-coordinates based on position and passageWidth
      const startY = Math.floor(position / gridResolution);
      const endY = Math.floor((position + passageWidth) / gridResolution);
      const x = side === 'left' ? 0 : cols - 1;

      for (let i = startY; i <= endY; i++) {
        if (i >= 0 && i < rows) {
          newGrid[i][x] = 0; // Clear passageway
        }
      }
    }
  });

  return newGrid;
};

/**
 * Adds no-pipe zones to the grid.
 *
 * @param {Array<Array<number>>} grid - The room grid.
 * @param {Array<Object>} noPipeZones - Array of no-pipe zone objects with x, y, width, height.
 * @returns {Array<Array<number>>} - Updated grid with no-pipe zones marked as -1.
 */
export const addNoPipeZonesToGrid = (grid, noPipeZones) => {
  if (!noPipeZones || noPipeZones.length === 0) return grid;

  const newGrid = grid.map(row => [...row]);

  noPipeZones.forEach(zone => {
    const { x, y, width, height } = zone;
    for (let i = y; i < y + height; i++) {
      for (let j = x; j < x + width; j++) {
        if (i >= 0 && i < newGrid.length && j >= 0 && j < newGrid[0].length) {
          newGrid[i][j] = -1; // Mark no-pipe zone as obstacle
        }
      }
    }
  });

  return newGrid;
};
