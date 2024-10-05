// src/utils/doubleSpiralGenerator.js

/**
 * Generates a double spiral path similar to the provided Python script.
 *
 * @param {number} size - Number of layers for the spiral.
 * @param {number} loopSpacing - Spacing between spiral loops in grid units.
 * @returns {Array<{x: number, y: number}>} - Array of points representing the double spiral path.
 */
export const generateDoubleSpiralPath = (size, loopSpacing = 2) => {
    const x = [];
    const y = [];
  
    // Outward spiral
    for (let i = 0; i < size; i += loopSpacing) {
      // Move right
      for (let j = i; j < size - i; j += loopSpacing) {
        x.push(j);
        y.push(i);
      }
      // Move down
      for (let j = i + loopSpacing; j < size - i; j += loopSpacing) {
        x.push(size - i - 1);
        y.push(j);
      }
      // Move left
      for (let j = size - i - 2; j >= i; j -= loopSpacing) {
        x.push(j);
        y.push(size - i - 1);
      }
      // Move up (shortened)
      for (let j = size - i - 2; j > i; j -= loopSpacing) {
        x.push(i);
        y.push(j);
      }
    }
  
    // Return spiral
    const xReturn = [];
    const yReturn = [];
  
    for (let i = loopSpacing; i < size; i += loopSpacing) {
      // Move right
      for (let j = i; j < size - i; j += loopSpacing) {
        xReturn.push(j);
        yReturn.push(i);
      }
      // Move down
      for (let j = i + loopSpacing; j < size - i; j += loopSpacing) {
        xReturn.push(size - i - 1);
        yReturn.push(j);
      }
      // Move left
      for (let j = size - i - 2; j >= i; j -= loopSpacing) {
        xReturn.push(j);
        yReturn.push(size - i - 1);
      }
      // Move up (shortened)
      for (let j = size - i - 2; j > i; j -= loopSpacing) {
        xReturn.push(i);
        yReturn.push(j);
      }
    }
  
    // Combine outward and return spirals
    const spiralPath = [];
  
    // Outward spiral
    for (let i = 0; i < x.length; i++) {
      spiralPath.push({ x: x[i], y: y[i] });
    }
  
    // Return spiral (reverse to connect smoothly)
    for (let i = xReturn.length - 1; i >= 0; i--) {
      spiralPath.push({ x: xReturn[i], y: yReturn[i] });
    }
  
    return spiralPath;
  };
  