// src/utils/pathGenerator.js

export const generateHeatingLoopPath = (grid, loopSpacing = 1) => {
  const rows = grid.length;
  const cols = grid[0].length;
  const path = [];

  let direction = 1; // 1 for right, -1 for left
  for (let y = 0; y < rows; y += loopSpacing) {
    const rowPath = [];
    if (direction === 1) {
      for (let x = 0; x < cols; x++) {
        rowPath.push({ x, y });
      }
    } else {
      for (let x = cols - 1; x >= 0; x--) {
        rowPath.push({ x, y });
      }
    }
    path.push(...rowPath);
    direction *= -1; // Change direction
  }
  return path;
};
