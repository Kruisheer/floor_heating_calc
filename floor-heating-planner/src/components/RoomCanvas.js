// src/components/RoomCanvas.js
import React from 'react';
import PropTypes from 'prop-types';

const MM_PER_METER = 1000;

// Define constants for grid cell types if your grid utils use them
const CELL_TYPES = {
    EMPTY: 0,
    OBSTACLE: 1,
    PASSAGEWAY: 2,
    NO_PIPE_ZONE: 3,
    PIPE: 4, // Example if grid was used for path
    // Add other types as defined in your grid logic
};

const RoomCanvas = ({
  zones = [], // Array of { id, pathCommands, pipeLength, color }
  roomWidthMeters,
  roomHeightMeters,
  pipeDiameterMM = 16, // Default diameter
  // Optional props for grid/obstacle visualization
  grid, // The 2D grid array (e.g., finalGrid)
  gridResolution, // Resolution in meters (e.g., 0.1)
  passageways = [], // Maybe needed for specific passageway styling
}) => {

  // Calculate pipe stroke width in meters (since viewBox is in meters)
  const pipeStrokeWidthMeters = pipeDiameterMM / MM_PER_METER;

  // Basic validation
  if (roomWidthMeters <= 0 || roomHeightMeters <= 0) {
    return null; // Don't render if dimensions are invalid
  }

  return (
    <svg
      width="100%" // Fill the container div
      height="100%"
      // *** IMPORTANT: viewBox uses actual room dimensions in METERS ***
      viewBox={`0 0 ${roomWidthMeters} ${roomHeightMeters}`}
      preserveAspectRatio="none" // Stretch SVG content if container aspect ratio differs
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      {/* Optional: Render Grid Background */}
      {grid && gridResolution > 0 && (
        <g id="grid-layer" stroke="#eee" strokeWidth={0.001}> {/* Thin grid lines */}
          {/* Vertical Lines */}
          {Array.from({ length: Math.floor(roomWidthMeters / gridResolution) }).map((_, i) => (
            <line
              key={`v-line-${i}`}
              x1={ (i + 1) * gridResolution }
              y1={0}
              x2={ (i + 1) * gridResolution }
              y2={roomHeightMeters}
            />
          ))}
          {/* Horizontal Lines */}
          {Array.from({ length: Math.floor(roomHeightMeters / gridResolution) }).map((_, i) => (
            <line
              key={`h-line-${i}`}
              x1={0}
              y1={ (i + 1) * gridResolution }
              x2={roomWidthMeters}
              y2={ (i + 1) * gridResolution }
            />
          ))}
        </g>
      )}

      {/* Optional: Render Obstacles and No-Pipe Zones from Grid */}
      {grid && gridResolution > 0 && (
         <g id="obstacle-layer">
           {grid.map((row, y) =>
             row.map((cellType, x) => {
               const cellX = x * gridResolution;
               const cellY = y * gridResolution;
               let fill = 'none';
               let opacity = 0.5;

               if (cellType === CELL_TYPES.OBSTACLE) {
                 fill = '#888'; // Dark grey for obstacles
                 opacity = 0.7;
               } else if (cellType === CELL_TYPES.NO_PIPE_ZONE) {
                 fill = '#fdd'; // Light red tint for no-pipe zones
               } else if (cellType === CELL_TYPES.PASSAGEWAY) {
                 // Maybe visualize passageways differently? e.g., lighter background or outline
                 fill = '#eef'; // Light blue tint for passageways
               }

               if (fill !== 'none') {
                 return (
                   <rect
                     key={`cell-${y}-${x}`}
                     x={cellX}
                     y={cellY}
                     width={gridResolution}
                     height={gridResolution}
                     fill={fill}
                     opacity={opacity}
                     stroke="none" // No stroke for filled cells unless desired
                   />
                 );
               }
               return null;
             })
           )}
         </g>
      )}

      {/* Render Heating Pipe Zones */}
      <g id="pipe-layer">
        {zones.map((zone) => (
          <path
            key={zone.id}
            d={zone.pathCommands} // Use the pre-calculated SVG path data
            stroke={zone.color || '#ff0000'} // Default to red if no color provided
            // Stroke width is based on pipe diameter, converted to meters
            strokeWidth={pipeStrokeWidthMeters}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </g>

    </svg>
  );
};

RoomCanvas.propTypes = {
  zones: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      pathCommands: PropTypes.string.isRequired,
      pipeLength: PropTypes.number,
      color: PropTypes.string,
  })),
  roomWidthMeters: PropTypes.number.isRequired,
  roomHeightMeters: PropTypes.number.isRequired,
  pipeDiameterMM: PropTypes.number,
  grid: PropTypes.array,
  gridResolution: PropTypes.number,
  passageways: PropTypes.array,
};

export default RoomCanvas;
