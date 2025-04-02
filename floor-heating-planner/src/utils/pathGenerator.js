// src/lib/doubleSpiralGenerator.js

/**
 * Generates the sequence of points (centerline) for a double spiral
 * (bifilar/counterflow) pipe layout within a rectangular area.
 *
 * @param {number} width - The width of the rectangular area.
 * @param {number} length - The length (height) of the rectangular area.
 * @param {number} spacing - The desired spacing between adjacent pipes.
 * @returns {Array<Array<number>>} An array of [x, y] coordinates representing the path. Returns an empty array if inputs are invalid.
 */
function generateDoubleSpiralPath(width, length, spacing) {
    if (width <= 0 || length <= 0 || spacing <= 0 || spacing * 2 > width || spacing * 2 > length) {
        console.warn("Invalid dimensions or spacing for double spiral generation.");
        return []; // Not enough space for even one loop
    }

    const path = [];
    const halfSpacing = spacing / 2;
    const doubleSpacing = spacing * 2;

    let minX = halfSpacing;
    let maxX = width - halfSpacing;
    let minY = halfSpacing;
    let maxY = length - halfSpacing;

    let currentX = minX;
    let currentY = minY;

    path.push([currentX, currentY]);

    while (minX < maxX && minY < maxY) {
        // Move Right
        if (currentX < maxX) {
            currentX = maxX;
            path.push([currentX, currentY]);
        }
        minY += doubleSpacing; // Move top boundary down
        if (minY > maxY) break; // Check if boundaries crossed

        // Move Down
        if (currentY < maxY) {
            currentY = maxY;
            path.push([currentX, currentY]);
        }
        maxX -= doubleSpacing; // Move right boundary left
         if (minX > maxX) break; // Check if boundaries crossed

        // Move Left
         if (currentX > minX) {
            currentX = minX;
            path.push([currentX, currentY]);
        }
        maxY -= doubleSpacing; // Move bottom boundary up
        if (minY > maxY) break; // Check if boundaries crossed

        // Move Up
        if (currentY > minY) {
            currentY = minY;
            path.push([currentX, currentY]);
        }
        minX += doubleSpacing; // Move left boundary right
        if (minX > maxX) break; // Check if boundaries crossed
    }

    // Potentially add a final small segment to connect near the center
    // depending on how the loop exited. Find the last point added.
    const lastPoint = path[path.length - 1];
    const secondLastPoint = path[path.length - 2];

    // Simple check: if the loop ended mid-segment, finish it towards the center point
    // This might need refinement based on visual checks. A more robust check
    // would analyze the remaining space (maxX-minX, maxY-minY).
    if (lastPoint && secondLastPoint) {
       // Example: If last move was horizontal, try a vertical move inwards
       if (lastPoint[1] === secondLastPoint[1] && Math.abs(lastPoint[0] - secondLastPoint[0]) > spacing) {
          // If moving left ended, move up slightly
          if(lastPoint[0] < secondLastPoint[0]) {
             path.push([lastPoint[0], lastPoint[1] + spacing]);
          } else { // If moving right ended, move down slightly
             path.push([lastPoint[0], lastPoint[1] - spacing]);
          }
       }
       // Example: If last move was vertical, try a horizontal move inwards
       else if (lastPoint[0] === secondLastPoint[0] && Math.abs(lastPoint[1] - secondLastPoint[1]) > spacing) {
           // If moving up ended, move right slightly
          if(lastPoint[1] < secondLastPoint[1]) {
             path.push([lastPoint[0] + spacing, lastPoint[1]]);
          } else { // If moving down ended, move left slightly
             path.push([lastPoint[0] - spacing, lastPoint[1]]);
          }
       }
    }


    return path;
}

/**
 * Calculates the total length of a path represented by an array of points.
 * @param {Array<Array<number>>} path - Array of [x, y] coordinates.
 * @returns {number} Total length of the path.
 */
function calculatePathLength(path) {
    let totalLength = 0;
    for (let i = 1; i < path.length; i++) {
        const [x1, y1] = path[i - 1];
        const [x2, y2] = path[i];
        totalLength += Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
    return totalLength;
}

/**
 * Converts an array of points into an SVG path string (M L L L...).
 * @param {Array<Array<number>>} path - Array of [x, y] coordinates.
 * @returns {string} SVG path data string. Returns empty string if path is empty.
 */
function pointsToSvgPath(path) {
    if (!path || path.length === 0) {
        return "";
    }
    const start = `M ${path[0][0]} ${path[0][1]}`;
    const lines = path.slice(1).map(p => `L ${p[0]} ${p[1]}`).join(" ");
    return `${start} ${lines}`;
}


// Export the functions you want to use elsewhere
export const doubleSpiralGenerator = {
    generatePath: generateDoubleSpiralPath,
    calculateLength: calculatePathLength,
    pathToSvg: pointsToSvgPath,
};
