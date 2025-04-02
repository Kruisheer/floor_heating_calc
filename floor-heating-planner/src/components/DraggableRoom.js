// src/components/DraggableRoom.js
import React, { useMemo, useEffect } from 'react';
import Draggable from 'react-draggable';
import PropTypes from 'prop-types';
import { doubleSpiralGenerator } from '../utils/doubleSpiralGenerator'; // Check path
import RoomCanvas from './RoomCanvas'; // Renders the SVG content
// Grid utilities - Keep if visualizing obstacles/grid
import {
  createRoomGrid,
  addObstaclesToGrid,
  addPassagewaysToGrid,
  addNoPipeZonesToGrid,
} from '../utils/roomGrid';
import './DraggableRoom.css'; // Your CSS

// --- Constants ---
const MM_PER_METER = 1000;

const DraggableRoom = ({
  id,
  name,
  dimensions, // e.g., "5x4" (in meters)
  obstacles = [], // Receive obstacles if needed for grid/visuals
  passageways = [],
  noPipeZones = [],
  position, // Controlled position from parent { x, y }
  pipeSettings, // { loopSpacing, maxPipeLength, pipeDiameter }
  scaleFactor, // Pixels per meter
  onDragStop,
  onPipeLengthCalculated,
}) => {

  // --- Parse Dimensions (in meters) ---
  const [lengthMeters, widthMeters] = useMemo(() => {
    const dims = dimensions?.split('x').map(Number) || [];
    return dims.length === 2 && !isNaN(dims[0]) && !isNaN(dims[1]) && dims[0] > 0 && dims[1] > 0
      ? dims
      : [1, 1]; // Default to 1x1m if invalid
  }, [dimensions]);

  // --- Calculate Display Size in Pixels ---
  const roomWidthPixels = useMemo(() => widthMeters * scaleFactor, [widthMeters, scaleFactor]);
  const roomHeightPixels = useMemo(() => lengthMeters * scaleFactor, [lengthMeters, scaleFactor]);

  // --- Optional: Grid calculation (for obstacle/zone visualization) ---
  // Note: Grid is NOT used for pipe path generation with doubleSpiralGenerator
  const gridResolution = 0.1; // meters (10cm)
  const grid = useMemo(
    () => createRoomGrid(`${lengthMeters}x${widthMeters}`, gridResolution),
    [lengthMeters, widthMeters, gridResolution]
  );
  const gridWithObstacles = useMemo(() => addObstaclesToGrid(grid, obstacles), [grid, obstacles]);
  const gridWithPassageways = useMemo(() => addPassagewaysToGrid(gridWithObstacles, passageways, `${lengthMeters}x${widthMeters}`, gridResolution), [gridWithObstacles, passageways, lengthMeters, widthMeters, gridResolution]);
  const finalGrid = useMemo(() => addNoPipeZonesToGrid(gridWithPassageways, noPipeZones), [gridWithPassageways, noPipeZones]);


  // --- Heating Path Calculation ---
  const heatingCalculation = useMemo(() => {
    // Ensure pipeSettings has defaults if not provided
    const { loopSpacing = 150, maxPipeLength = 100, pipeDiameter = 16 } = pipeSettings || {};

    // Convert units to METERS for calculation
    const spacingMeters = loopSpacing / MM_PER_METER;
    const maxLenMeters = maxPipeLength; // Assuming maxPipeLength is already in meters

    if (!widthMeters || !lengthMeters || !spacingMeters || !maxLenMeters || widthMeters <= 0 || lengthMeters <= 0 || spacingMeters <= 0 || maxLenMeters <= 0) {
        console.warn(`Invalid calculation inputs for room ${name}`);
        return { zones: [], totalLength: 0, totalElbows: 0 };
    }

    // 1. Generate path & elbows (using METERS)
    const { path: fullPathPoints, elbows: totalElbows } = doubleSpiralGenerator.generatePathAndElbows(widthMeters, lengthMeters, spacingMeters);
    if (!fullPathPoints || fullPathPoints.length < 2) return { zones: [], totalLength: 0, totalElbows: 0 };

    // 2. Calculate total length (METERS)
    const totalCalculatedLengthMeters = doubleSpiralGenerator.calculateLength(fullPathPoints);

    // 3. Split into zones (using METERS)
    const pathSegments = doubleSpiralGenerator.splitPath(fullPathPoints, maxLenMeters);

    // 4. Create Zone objects with SVG data (coords in METERS)
    const zones = pathSegments.map((segment, index) => ({
        id: `${id}-zone-${index}`,
        pathCommands: doubleSpiralGenerator.pathToSvg(segment.path),
        pipeLength: segment.length, // meters
        color: `hsl(${(index * 50 + 10) % 360}, 65%, 55%)` // Slightly offset colors
    }));

    return { zones, totalLength: totalCalculatedLengthMeters, totalElbows };

  }, [id, name, widthMeters, lengthMeters, pipeSettings]); // Recalculate if these change

  const { zones, totalLength, totalElbows } = heatingCalculation;

  // --- Notify Parent of Calculated Length ---
  useEffect(() => {
    if (onPipeLengthCalculated) {
      onPipeLengthCalculated(id, totalLength); // Pass ID and length in METERS
    }
  }, [onPipeLengthCalculated, id, totalLength]);

  // --- Drag Stop Handler ---
  // This calls the handler passed down from HouseCanvasWrapper
  const handleStop = (e, dragData) => {
    if (onDragStop) {
      onDragStop(id, { x: dragData.x, y: dragData.y }); // Pass ID and new raw {x, y}
    }
  };

  return (
    // Draggable component uses the controlled 'position' prop
    <Draggable
      position={position} // Use position from parent state
      onStop={handleStop} // Notify parent on drag end
      // Snap grid could be based on scaleFactor for visual consistency
      grid={[scaleFactor * gridResolution, scaleFactor * gridResolution]} // e.g., snap to 10cm visual grid
      bounds="parent" // Constrain to parent bounds (HouseCanvasWrapper div)
      handle=".draggable-room-handle" // Use the div itself as the drag handle
    >
      {/* The Absolutely Positioned Container for the Room */}
      <div
        className="draggable-room draggable-room-handle"
        style={{
          position: 'absolute', // Absolutely positioned within the relative parent
          left: 0, // Position controlled by Draggable's transform style
          top: 0,
          width: roomWidthPixels,
          height: roomHeightPixels,
          border: '1px solid #555',
          overflow: 'hidden',
          cursor: 'grab',
          backgroundColor: 'rgba(250, 250, 250, 0.9)',
          boxShadow: '2px 2px 5px rgba(0,0,0,0.1)',
        }}
      >
        {/* Room Name */}
        <div style={{ position: 'absolute', top: 1, left: 3, fontSize: '10px', fontWeight: 'bold', color: '#333', pointerEvents: 'none', zIndex: 10 }}>
            {name}
        </div>

        {/* The SVG Rendering Canvas */}
        <RoomCanvas
          zones={zones}
          roomWidthMeters={widthMeters}
          roomHeightMeters={lengthMeters}
          pipeDiameterMM={pipeSettings?.pipeDiameter || 16}
          // Pass grid info if RoomCanvas renders obstacles/grid visuals
          grid={finalGrid}
          gridResolution={gridResolution}
          // passageways={passageways} // Pass if needed by RoomCanvas
        />

        {/* Display Calculated Info */}
         <div style={{ position: 'absolute', bottom: 1, right: 3, fontSize: '9px', backgroundColor: 'rgba(255, 255, 255, 0.85)', padding: '1px 3px', borderRadius: '2px', pointerEvents: 'none', zIndex: 10 }}>
            L:{totalLength.toFixed(1)}m | Z:{zones.length} | E:~{totalElbows}
        </div>
      </div>
    </Draggable>
  );
};

// Prop Type definitions
DraggableRoom.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  dimensions: PropTypes.string.isRequired,
  obstacles: PropTypes.array,
  passageways: PropTypes.array,
  noPipeZones: PropTypes.array,
  position: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }).isRequired,
  pipeSettings: PropTypes.shape({
    loopSpacing: PropTypes.number,
    maxPipeLength: PropTypes.number,
    pipeDiameter: PropTypes.number,
  }),
  scaleFactor: PropTypes.number.isRequired,
  onDragStop: PropTypes.func.isRequired,
  onPipeLengthCalculated: PropTypes.func.isRequired,
};

export default DraggableRoom;
