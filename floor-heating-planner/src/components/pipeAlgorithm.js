// src/components/pipeAlgorithm.js

export const calculatePipeRequirements = (rooms) => {
  // Example algorithm to calculate pipe lengths based on room dimensions
  let totalPipeLength = 0;

  rooms.forEach((room) => {
    const [length, width] = room.dimensions.split('x').map(Number);
    // Simple perimeter calculation as a placeholder
    totalPipeLength += 2 * (length + width);
  });

  return totalPipeLength;
};
