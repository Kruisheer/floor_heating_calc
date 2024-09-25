// src/components/RoomCanvas.js

import React, { useEffect, useState } from 'react';
import { Stage, Layer, Line, Rect, Circle } from 'react-konva';

const RoomCanvas = ({
  grid,
  path,
  roomWidth,
  roomHeight,
  cellSizeX,
  cellSizeY,
  passageways = [],
  loopSpacing,
  startingPoint,
}) => {
  // Generate points for the Line component
  const linePoints = path.flatMap((point) => [
    point.x * cellSizeX + cellSizeX / 2,
    point.y * cellSizeY + cellSizeY / 2,
  ]);

  // Visualize Starting Point
  const startingPointPx = [
    startingPoint.x * cellSizeX + cellSizeX / 2,
    startingPoint.y * cellSizeY + cellSizeY / 2,
  ];

  return (
    <Stage width={roomWidth} height={roomHeight}>
      <Layer>
        {/* Draw Room Boundaries */}
        <Line
          points={[
            0,
            0,
            roomWidth,
            0,
            roomWidth,
            roomHeight,
            0,
            roomHeight,
            0,
            0,
          ]}
          stroke="black"
          strokeWidth={2}
          closed={true}
        />

        {/* Draw Passageways */}
        {passageways.map((passageway, index) => {
          const { side, position, width: passageWidth } = passageway;
          let x1, y1, x2, y2;

          // Convert position and width to pixels
          let positionPx, passageWidthPx;
          if (side === 'top' || side === 'bottom') {
            positionPx = position * cellSizeX;
            passageWidthPx = passageWidth * cellSizeX;
          } else {
            positionPx = position * cellSizeY;
            passageWidthPx = passageWidth * cellSizeY;
          }

          if (side === 'top') {
            x1 = positionPx;
            y1 = 0;
            x2 = positionPx + passageWidthPx;
            y2 = 0;
          } else if (side === 'bottom') {
            x1 = positionPx;
            y1 = roomHeight;
            x2 = positionPx + passageWidthPx;
            y2 = roomHeight;
          } else if (side === 'left') {
            x1 = 0;
            y1 = positionPx;
            x2 = 0;
            y2 = positionPx + passageWidthPx;
          } else if (side === 'right') {
            x1 = roomWidth;
            y1 = positionPx;
            x2 = roomWidth;
            y2 = positionPx + passageWidthPx;
          }

          return (
            <Line
              key={`passageway-${index}`}
              points={[x1, y1, x2, y2]}
              stroke="white"
              strokeWidth={4}
            />
          );
        })}

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

        {/* Draw Starting Point Indicator */}
        <Circle
          x={startingPointPx[0]}
          y={startingPointPx[1]}
          radius={5}
          fill="blue"
          stroke="black"
          strokeWidth={1}
        />
      </Layer>
    </Stage>
  );
};

export default RoomCanvas;
