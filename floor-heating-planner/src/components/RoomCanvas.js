// src/components/RoomCanvas.js

import React from 'react';
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
  startPoint,
  endPoint,
  onSetStartPoint, // Callback for interactive starting point setting
  onSetEndPoint,   // Callback for interactive ending point setting
}) => {
  // Generate points for the Line component
  const linePoints = path.flatMap((point) => [
    point.x * cellSizeX + cellSizeX / 2,
    point.y * cellSizeY + cellSizeY / 2,
  ]);

  // Visualize Starting Point
  const startPointPx = [
    startPoint.x * cellSizeX + cellSizeX / 2,
    startPoint.y * cellSizeY + cellSizeY / 2,
  ];

  // Visualize Ending Point
  const endPointPx = [
    endPoint.x * cellSizeX + cellSizeX / 2,
    endPoint.y * cellSizeY + cellSizeY / 2,
  ];

  // Handle click to set starting point
  const handleStartPointClick = (e) => {
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    const x = Math.floor(pointerPosition.x / cellSizeX);
    const y = Math.floor(pointerPosition.y / cellSizeY);

    // Ensure the clicked cell is within the grid and not an obstacle
    if (grid[y] && grid[y][x] !== -1) {
      console.log(`Setting new starting point: x=${x}, y=${y}`);
      onSetStartPoint({ x, y });
    } else {
      console.warn('Clicked position is invalid or an obstacle.');
    }
  };

  // Handle click to set ending point
  const handleEndPointClick = (e) => {
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    const x = Math.floor(pointerPosition.x / cellSizeX);
    const y = Math.floor(pointerPosition.y / cellSizeY);

    // Ensure the clicked cell is within the grid and not an obstacle
    if (grid[y] && grid[y][x] !== -1) {
      console.log(`Setting new ending point: x=${x}, y=${y}`);
      onSetEndPoint({ x, y });
    } else {
      console.warn('Clicked position is invalid or an obstacle.');
    }
  };

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
        {path.length > 1 && (
          <Line
            points={linePoints}
            stroke="red"
            strokeWidth={2}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Draw Starting Point Indicator */}
        <Circle
          x={startPointPx[0]}
          y={startPointPx[1]}
          radius={5}
          fill="blue"
          stroke="black"
          strokeWidth={1}
          onClick={handleStartPointClick}
          onTap={handleStartPointClick}
        />

        {/* Draw Ending Point Indicator */}
        <Circle
          x={endPointPx[0]}
          y={endPointPx[1]}
          radius={5}
          fill="green"
          stroke="black"
          strokeWidth={1}
          onClick={handleEndPointClick}
          onTap={handleEndPointClick}
        />
      </Layer>
    </Stage>
  );
};

export default RoomCanvas;
