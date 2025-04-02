// src/components/DraggableRoom.js
import React, { useMemo, useEffect } from 'react';
import Draggable from 'react-draggable';
import PropTypes from 'prop-types';
import { doubleSpiralGenerator } from '../utils/doubleSpiralGenerator'; // Check path
import RoomCanvas from './RoomCanvas'; // Renders the SVG content
import {
  createRoomGrid,
  addObstaclesToGrid,
  addPassagewaysToGrid,
  addNoPipeZonesToGrid,
} from '../utils/roomGrid';
import './DraggableRoom.css'; // Your CSS

const MM_PER_METER = 1000;

const DraggableRoom = ({
  id,
  name,
  dimensions,
  obstacles = [],
  passageways = [],
  noPipeZones = [],
  position,
  pipeSettings, // Receive the whole object
  scaleFactor,
  onDragStop,
  onPipeLengthCalculated,
}) => {

  const [lengthMeters, widthMeters] = useMemo(() => {
    const dims = dimensions?.split('x').map(Number) || [];
    return dims.length === 2 && !isNaN(dims[0]) && !isNaN(dims[1]) && dims[0] > 0 && dims[1] > 0
      ? dims
      : [1, 1];
  }, [dimensions]);

  const roomWidthPixels = useMemo(() => widthMeters * scaleFactor, [widthMeters, scaleFactor]);
  const roomHeightPixels = useMemo(() => lengthMeters * scaleFactor, [lengthMeters, scaleFactor]);

  const gridResolution = 0.1;
  const grid = useMemo(() => createRoomGrid(`${lengthMeters}x${widthMeters}`, gridResolution), [lengthMeters, widthMeters, gridResolution]);
  const gridWithObstacles = useMemo(() => addObstaclesToGrid(grid, obstacles), [grid, obstacles]);
  const gridWithPassageways = useMemo(() => addPassagewaysToGrid(gridWithObstacles, passageways, `${lengthMeters}x${widthMeters}`, gridResolution), [gridWithObstacles, passageways, lengthMeters, widthMeters, gridResolution]);
  const finalGrid = useMemo(() => addNoPipeZonesToGrid(gridWithPassageways, noPipeZones), [gridWithPassageways, noPipeZones]);

  const heatingCalculation = useMemo(() => {
    // --- Destructure only needed values HERE ---
    const { loopSpacing = 150, maxPipeLength = 100 } = pipeSettings || {};
    // We don't need pipeDiameter directly in this calculation block

    const spacingMeters = loopSpacing / MM_PER_METER;
    const maxLenMeters = maxPipeLength;

    if (!widthMeters || !lengthMeters || !spacingMeters || !maxLenMeters || widthMeters <= 0 || lengthMeters <= 0 || spacingMeters <= 0 || maxLenMeters <= 0) {
        console.warn(`Invalid calculation inputs for room ${name}`);
        return { zones: [], totalLength: 0, totalElbows: 0 };
    }

    const { path: fullPathPoints, elbows: totalElbows } = doubleSpiralGenerator.generatePathAndElbows(widthMeters, lengthMeters, spacingMeters);
    if (!fullPathPoints || fullPathPoints.length < 2) return { zones: [], totalLength: 0, totalElbows: 0 };

    const totalCalculatedLengthMeters = doubleSpiralGenerator.calculateLength(fullPathPoints);
    const pathSegments = doubleSpiralGenerator.splitPath(fullPathPoints, maxLenMeters);

    const zones = pathSegments.map((segment, index) => ({
        id: `${id}-zone-${index}`,
        pathCommands: doubleSpiralGenerator.pathToSvg(segment.path),
        pipeLength: segment.length,
        color: `hsl(${(index * 50 + 10) % 360}, 65%, 55%)`
    }));

    return { zones, totalLength: totalCalculatedLengthMeters, totalElbows };

  }, [id, name, widthMeters, lengthMeters, pipeSettings]); // pipeSettings is still a dependency

  const { zones, totalLength, totalElbows } = heatingCalculation;

  useEffect(() => {
    if (onPipeLengthCalculated) {
      onPipeLengthCalculated(id, totalLength);
    }
  }, [onPipeLengthCalculated, id, totalLength]);

  const handleStop = (e, dragData) => {
    if (onDragStop) {
      onDragStop(id, { x: dragData.x, y: dragData.y });
    }
  };

  return (
    <Draggable
      position={position}
      onStop={handleStop}
      grid={[scaleFactor * gridResolution, scaleFactor * gridResolution]}
      bounds="parent"
      handle=".draggable-room-handle"
    >
      <div
        className="draggable-room draggable-room-handle"
        style={{
          position: 'absolute',
          left: 0,
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
        <div style={{ position: 'absolute', top: 1, left: 3, fontSize: '10px', fontWeight: 'bold', color: '#333', pointerEvents: 'none', zIndex: 10 }}>
            {name}
        </div>

        <RoomCanvas
          zones={zones}
          roomWidthMeters={widthMeters}
          roomHeightMeters={lengthMeters}
          // --- Pass diameter from the original pipeSettings prop ---
          pipeDiameterMM={pipeSettings?.pipeDiameter || 16} // Access directly here
          grid={finalGrid}
          gridResolution={gridResolution}
        />

        <div style={{ position: 'absolute', bottom: 1, right: 3, fontSize: '9px', backgroundColor: 'rgba(255, 255, 255, 0.85)', padding: '1px 3px', borderRadius: '2px', pointerEvents: 'none', zIndex: 10 }}>
            L:{totalLength.toFixed(1)}m | Z:{zones.length} | E:~{totalElbows}
        </div>
      </div>
    </Draggable>
  );
};

// Prop Types remain the same...
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
