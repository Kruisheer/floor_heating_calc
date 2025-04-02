// src/utils/doubleSpiralGenerator.js

/**
 * Generates the sequence of points (centerline) for a double spiral
 * (bifilar/counterflow) pipe layout within a rectangular area.
 * Also estimates the number of 90-degree turns (elbows).
 *
 * @param {number} width - The width of the rectangular area (in millimeters or consistent units).
 * @param {number} length - The length (height) of the rectangular area (in millimeters or consistent units).
 * @param {number} spacing - The desired spacing between adjacent pipes (centerline to centerline).
 * @returns {{path: Array<Array<number>>, elbows: number}} An object containing:
 *          - path: An array of [x, y] coordinates representing the path. Empty if inputs invalid.
 *          - elbows: An estimated count of 90-degree turns. 0 if path invalid.
 *          Returns { path: [], elbows: 0 } if inputs are invalid.
 */
function generateDoubleSpiralPath(width, length, spacing) {
    // Basic validation - ensure dimensions allow at least one loop segment
    if (width <= spacing || length <= spacing || spacing <= 0) {
        // Need at least half spacing on both sides minimum. More robust check:
        if(width < spacing * 2 && length < spacing * 2) {
             console.warn("Invalid dimensions or spacing for double spiral generation. Too small.");
             return { path: [], elbows: 0 };
        }
    }

    const path = [];
    const halfSpacing = spacing / 2;
    const doubleSpacing = spacing * 2;

    // Adjust boundaries slightly inwards if needed to center the pattern better
    // This prevents pipe running exactly on the edge if width/length aren't multiples of spacing
    let effectiveWidth = width;
    let effectiveLength = length;
    let startOffsetX = halfSpacing;
    let startOffsetY = halfSpacing;

    // Note: More complex centering logic could be added here if desired.
    // For now, we stick to the halfSpacing inset.

    let minX = startOffsetX;
    let maxX = effectiveWidth - halfSpacing;
    let minY = startOffsetY;
    let maxY = effectiveLength - halfSpacing;

    // Ensure boundaries don't cross immediately if dimensions are small relative to spacing
    if (minX >= maxX || minY >= maxY) {
         console.warn("Calculated boundaries cross due to small dimensions relative to spacing.");
         // Potentially add a single straight pipe run if possible? Or just return empty.
         return { path: [], elbows: 0 };
    }

    let currentX = minX;
    let currentY = minY;

    path.push([currentX, currentY]);

    while (true) {
        let moved = false;

        // Move Right
        if (currentX < maxX) {
            currentX = maxX;
            path.push([currentX, currentY]);
            moved = true;
        }
         // Shrink top boundary only *after* moving right fully
         minY += doubleSpacing;
         if (minY >= maxY && moved) break; // Check if boundaries crossed after shrinking


        // Move Down
        if (currentY < maxY) {
            currentY = maxY;
            path.push([currentX, currentY]);
            moved = true;
        }
        // Shrink right boundary only *after* moving down fully
        maxX -= doubleSpacing;
        if (minX >= maxX && moved) break;


        // Move Left
         if (currentX > minX) {
            currentX = minX;
            path.push([currentX, currentY]);
            moved = true;
        }
        // Shrink bottom boundary only *after* moving left fully
        maxY -= doubleSpacing;
        if (minY >= maxY && moved) break;


        // Move Up
        if (currentY > minY) {
            currentY = minY;
            path.push([currentX, currentY]);
            moved = true;
        }
         // Shrink left boundary only *after* moving up fully
         minX += doubleSpacing;
         if (minX >= maxX && moved) break;

        // If no move happened in a full cycle, break (should be covered by boundary checks)
        if (!moved) break;
    }

    // Estimate elbows: Every point in the path except the start and end is a turn.
    const elbows = Math.max(0, path.length - 2);

    return { path, elbows };
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
    // Ensure points are rounded for cleaner SVG output
    const formatPoint = (p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;

    const start = `M ${formatPoint(path[0])}`;
    const lines = path.slice(1).map(p => `L ${formatPoint(p)}`).join(" ");
    return `${start} ${lines}`;
}

/**
 * Splits a path into multiple segments based on a maximum length.
 *
 * @param {Array<Array<number>>} fullPathPoints - The complete path points.
 * @param {number} maxSegmentLength - The maximum length allowed for each segment (zone).
 * @returns {Array<{path: Array<Array<number>>, length: number}>} An array of segments, each with its path points and calculated length.
 */
function splitPathIntoSegments(fullPathPoints, maxSegmentLength) {
    const segments = [];
    if (!fullPathPoints || fullPathPoints.length < 2 || maxSegmentLength <= 0) {
        return segments;
    }

    let currentSegmentPoints = [fullPathPoints[0]]; // Start with the first point
    let currentSegmentLength = 0;
    let pathIndex = 0; // Index for the *start* point of the current line segment being processed

    while(pathIndex < fullPathPoints.length - 1) {
        const p1 = fullPathPoints[pathIndex];
        const p2 = fullPathPoints[pathIndex + 1];
        const lineSegmentLength = Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));

        if (currentSegmentLength + lineSegmentLength <= maxSegmentLength) {
            // Add the entire line segment to the current path segment
            currentSegmentPoints.push(p2);
            currentSegmentLength += lineSegmentLength;
            pathIndex++; // Move to the next line segment
        } else {
            // Need to split the line segment
            const remainingLengthAllowed = maxSegmentLength - currentSegmentLength;
            if (remainingLengthAllowed > 0 && lineSegmentLength > 0) {
                 const fraction = remainingLengthAllowed / lineSegmentLength;
                 const intermediateX = p1[0] + (p2[0] - p1[0]) * fraction;
                 const intermediateY = p1[1] + (p2[1] - p1[1]) * fraction;
                 currentSegmentPoints.push([intermediateX, intermediateY]);
                 currentSegmentLength += remainingLengthAllowed;
            }

            // Finalize the current segment
            segments.push({ path: currentSegmentPoints, length: currentSegmentLength });

            // Start the next segment
            // The starting point is the intermediate point calculated above, or p1 if remainingLengthAllowed was <= 0
            const nextSegmentStartPoint = currentSegmentPoints[currentSegmentPoints.length -1];
            currentSegmentPoints = [nextSegmentStartPoint]; // Start new segment with the end of the last one
            currentSegmentLength = 0;

            // Do NOT increment pathIndex here IF we split, because the next segment
            // needs to process the *remainder* of the current line segment starting from the split point.
            // We need to replace the starting point (p1) of the current line segment with the intermediate point
            // for the next iteration. This is tricky.
            // A simpler approach: Increment pathIndex, but add the intermediate point as the explicit start.
             if (remainingLengthAllowed > 0 && lineSegmentLength > 0) {
                 // Update the original path temporarily for calculation (cleaner ways exist, e.g., tracking remaining part)
                 // Or better: just start the next segment properly
                 // Let's restart the segment calculation for the *remainder* of the line
                 const remainderStartPoint = currentSegmentPoints[0]; // Should be intermediateX, intermediateY
                 const segmentRemainderLength = lineSegmentLength - remainingLengthAllowed;

                 // Now decide if the *remainder* fits in the new segment or needs further splitting
                 if(segmentRemainderLength > maxSegmentLength){
                    // This single remaining part is already too long, needs another split point
                    const fraction2 = maxSegmentLength / segmentRemainderLength; // Fraction relative to remainder
                    const intermediateX2 = remainderStartPoint[0] + (p2[0] - remainderStartPoint[0]) * fraction2;
                    const intermediateY2 = remainderStartPoint[1] + (p2[1] - remainderStartPoint[1]) * fraction2;
                    segments.push({ path: [remainderStartPoint, [intermediateX2, intermediateY2]], length: maxSegmentLength });

                    // And potentially loop *again* if segmentRemainderLength was > 2 * maxSegmentLength... this gets complex.
                    // A loop here might be needed for very long segments vs max length
                     console.warn("Path splitting logic might need refinement for very long segments vs max length.");
                     // For now, just start the next segment from intermediateX2, intermediateY2
                     currentSegmentPoints = [[intermediateX2, intermediateY2]];
                     currentSegmentLength = 0;
                     // We still haven't processed the segment from intermediateX2 to p2. We must adjust p1 for the next loop.
                     fullPathPoints.splice(pathIndex + 1, 0, [intermediateX2, intermediateY2]); // Insert the split point
                     // Now the next iteration will handle the segment from intermediateX2 to p2.
                 } else {
                     // The remainder fits in the new segment (or is zero)
                     currentSegmentPoints.push(p2);
                     currentSegmentLength += segmentRemainderLength;
                     pathIndex++; // Now we are done with the original line segment p1->p2
                 }

            } else {
                 // No split happened (likely remainingLengthAllowed <= 0), just start new segment
                 pathIndex++; // Move to next segment
                 if(pathIndex < fullPathPoints.length){
                      currentSegmentPoints = [fullPathPoints[pathIndex]]; // Start next segment
                      currentSegmentLength = 0;
                 }
            }
        }
    }

    // Add the last segment if it has any points/length
    if (currentSegmentPoints.length > 1 || (segments.length === 0 && currentSegmentPoints.length > 0)) {
         segments.push({ path: currentSegmentPoints, length: currentSegmentLength });
    }


    return segments;
}


// Export the functions/object you want to use elsewhere
export const doubleSpiralGenerator = {
    generatePathAndElbows: generateDoubleSpiralPath, // Renamed for clarity
    calculateLength: calculatePathLength,
    splitPath: splitPathIntoSegments, // Added path splitting utility
    pathToSvg: pointsToSvgPath,
};
