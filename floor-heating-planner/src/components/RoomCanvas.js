// src/components/RoomCanvas.js
import React from 'react';
import PropTypes from 'prop-types';

const MM_PER_METER = 1000;

// Cell types (ensure these match your grid utility definitions)
const CELL_TYPES = {
    EMPTY: 0,
    OBSTACLE: 1,
    PASSAGEWAY: 2,
    NO_PIPE_ZONE: 3,
};

const RoomCanvas = ({
  zones = [],
  roomWidthMeters,
  roomHeightMeters,
  pipeDiameterMM = 16,
  grid,
  gridResolution,
  // passageways = [], // Currently unused, but could be for styling later
}) => {

  // Calculate pipe stroke width in METERS for SVG viewBox consistency
  const pipeStrokeWidthMeters = pipeDiameterMM / MM_PER_METER;

  if (roomWidthMeters <= 0 || roomHeightMeters <= 0) return null; // Render nothing if invalid size

  // Calculate grid cell dimensions in meters if grid exists
  const cellWidthMeters = gridResolution;
  const cellHeightMeters = gridResolution;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${roomWidthMeters} ${roomHeightMeters}`} // Use METERS
      preserveAspectRatio="none"
      style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }} // Ensure SVG is behind text overlays
    >
      {/* Layer for Grid Background (Optional) */}
      {grid && gridResolution > 0 && (
        <g id="grid-background" stroke="#ddd" strokeWidth={0.001}> {/* Very thin lines */}
          {Array.from({ length: Math.floor(roomWidthMeters / gridResolution) }).map((_, i) => (
            <line key={`v-${i}`} x1={(i + 1) * gridResolution} y1={0} x2={(i + 1) * gridResolution} y2={roomHeightMeters} />
          ))}
          {Array.from({ length: Math.floor(roomHeightMeters / gridResolution) }).map((_, i) => (
            <line key={`h-${i}`} x1={0} y1={(i + 1) * gridResolution} x2={roomWidthMeters} y2={(i + 1) * gridResolution} />
          ))}
        </g>
      )}

      {/* Layer for Obstacles/Zones (Optional) */}
      {grid && gridResolution > 0 && (
         <g id="obstacle-zone-layer">
           {grid.map((row, y) =>
             row.map((cellType, x) => {
               const cellX_meters = x * cellWidthMeters;
               const cellY_meters = y * cellHeightMeters;
               let fill = 'none';
               let fillOpacity = 0.6;

               switch(cellType) {
                   case CELL_TYPES.OBSTACLE:
                       fill = '#666'; // Darker grey for obstacles
                       break;
                   case CELL_TYPES.NO_PIPE_ZONE:
                       fill = '#ffcccc'; // Light red tint for no-pipe zones
                       break;
                   case CELL_TYPES.PASSAGEWAY:
                       fill = '#ddeeff'; // Light blue tint for passageways
                       break;
                   default:
                       fill = 'none';
               }

               if (fill !== 'none') {
                 return (
                   <rect
                     key={`cell-${y}-${x}`}
                     x={cellX_meters}
                     y={cellY_meters}
                     width={cellWidthMeters}
                     height={cellHeightMeters}
                     fill={fill}
                     fillOpacity={fillOpacity}
                     stroke="none"
                   />
                 );
               }
               return null;
             })
           )}
         </g>
      )}

      {/* Layer for Heating Pipes */}
      <g id="heating-pipe-layer">
        {zones.map((zone) => (
          <path
            key={zone.id}
            d={zone.pathCommands} // SVG path data (coords in meters)
            stroke={zone.color || '#e41a1c'} // Default color if needed
            strokeWidth={pipeStrokeWidthMeters} // Width in meters
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
  // passageways: PropTypes.array, // Prop type if used later
};

export default RoomCanvas;
