// src/components/RoomCanvas.js

import React from 'react';
import { Stage, Layer, Line, Rect } from 'react-konva';

const RoomCanvas = ({ grid, path }) => {
  const cellSize = 10; // Size of each cell in pixels

  // Calculate the canvas size
  const width = grid[0].length * cellSize;
  const height = grid.length * cellSize;

  // Generate points for the Line component
  const linePoints = path.flatMap((point) => [
    point.x * cellSize + cellSize / 2,
    point.y * cellSize + cellSize / 2,
  ]);

  return (
    <Stage width={width} height={height}>
      <Layer>
        {/* Draw Obstacles */}
        {grid.map((row, y) =>
          row.map((cell, x) => {
            if (cell === -1) {
              return (
                <Rect
                  key={`obstacle-${x}-${y}`}
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
          points={linePoints}
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
