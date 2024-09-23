// src/components/RoomCanvas.js

import React from 'react';
import { Stage, Layer, Line, Rect } from 'react-konva';

const RoomCanvas = ({ grid, path }) => {
  const cellSize = 10; // Size of each cell in pixels

  // Check if path is an array
  if (!Array.isArray(path)) {
    console.error('The "path" provided to RoomCanvas is not an array:', path);
    return null; // Or render a fallback UI
  }

  // Generate the points for the Line component
  const points = path.reduce((acc, point) => {
    acc.push(point.x * cellSize + cellSize / 2, point.y * cellSize + cellSize / 2);
    return acc;
  }, []);

  return (
    <Stage width={grid[0].length * cellSize} height={grid.length * cellSize}>
      <Layer>
        {/* Draw Obstacles */}
        {grid.map((row, y) =>
          row.map((cell, x) => {
            if (cell === -1) {
              return (
                <Rect
                  key={`${x}-${y}`}
                  x={x * cellSize}
                  y={y * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill="gray"
                />
              );
            }
            return null;
          })
        )}

        {/* Draw Heating Loop Path */}
        <Line
          points={points}
          stroke="red"
          strokeWidth={2}
          lineCap="round"
          lineJoin="round"
        />
      </Layer>
    </Stage>
  );
};

export default RoomCanvas;
