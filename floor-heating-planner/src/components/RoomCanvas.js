// src/components/RoomCanvas.js

import React from 'react';
import { Stage, Layer, Line, Rect } from 'react-konva';

const RoomCanvas = ({ grid, path, roomWidth, roomHeight }) => {
  // Calculate cell sizes
  const cols = grid[0].length;
  const rows = grid.length;
  const cellSizeX = roomWidth / cols;
  const cellSizeY = roomHeight / rows;

  // Generate points for the Line component
  const linePoints = path.flatMap((point) => [
    point.x * cellSizeX + cellSizeX / 2,
    point.y * cellSizeY + cellSizeY / 2,
  ]);

  return (
    <Stage width={roomWidth} height={roomHeight}>
      <Layer>
        {/* Draw Obstacles */}
        {grid.map((row, y) =>
          row.map((cell, x) => {
            if (cell === -1) {
              return (
                <Rect
                  key={`obstacle-${x}-${y}`}
                  x={x * cellSizeX}
                  y={y * cellSizeY}
                  width={cellSizeX}
                  height={cellSizeY}
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
