import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import DraggableRoom from './DraggableRoom'; // Import the room component
// REMOVED: import { Room } from '../Room'; // No longer needed here
// We assume Settings type comes implicitly through props or isn't strictly checked here
// import { Settings } from '../App'; // Might not be needed if not used for propTypes

const DEFAULT_SCALE_FACTOR = 50; // Pixels per meter

const HouseCanvasWrapper = ({ rooms = [], setRooms, pipeSettings, scaleFactor = DEFAULT_SCALE_FACTOR }) => {
  const [positions, setPositions] = useState({});

  useEffect(() => {
    setPositions(prevPositions => {
      const newPositions = {};
      rooms.forEach(room => {
        // Use existing position from state, fallback to room object's position, then to 0,0
        newPositions[room.id] = prevPositions[room.id] || room.position || { x: 0, y: 0 };
      });
      return newPositions;
    });
  }, [rooms]);

  const handleDragStop = useCallback((roomId, newPosition) => {
    setPositions(prev => ({
      ...prev,
      [roomId]: newPosition,
    }));

    // Persist position back to the main rooms array in App.js state
    setRooms(currentRooms =>
      currentRooms.map(room =>
        room.id === roomId ? { ...room, position: newPosition } : room
      )
    );
  }, [setRooms]);

  const handlePipeLengthCalculated = useCallback((roomId, length) => {
    // Optional: Update room data or aggregate length
     // console.log(`Room ${roomId} calculated length: ${length.toFixed(1)}m`);
  }, []);


  const canvasStyle = {
    position: 'relative', // Essential for absolute positioning of DraggableRoom
    width: '100%',
    minHeight: '80vh', // Ensure it has some height
    backgroundColor: '#f4f4f4',
    border: '1px solid #ccc',
    overflow: 'auto', // Add scrollbars if rooms go outside bounds
    cursor: 'default',
  };

  return (
    <div style={canvasStyle}>
      {rooms.map((room) => (
        // Ensure room object has necessary fields before rendering
        room && room.id && room.name && room.dimensions && positions[room.id] ? (
          <DraggableRoom
            key={room.id}
            id={room.id}
            name={room.name}
            dimensions={room.dimensions}
            obstacles={room.obstacles || []} // Provide defaults for optional props
            passageways={room.passageways || []}
            noPipeZones={room.noPipeZones || []}
            position={positions[room.id]} // Pass controlled position
            pipeSettings={pipeSettings}
            scaleFactor={scaleFactor}
            onDragStop={handleDragStop}
            onPipeLengthCalculated={handlePipeLengthCalculated}
          />
        ) : null // Don't render if essential room data is missing
      ))}
    </div>
  );
};

// --- Corrected PropTypes ---
HouseCanvasWrapper.propTypes = {
  // Define the expected shape of objects in the rooms array directly
  rooms: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      dimensions: PropTypes.string.isRequired, // e.g., "5x4"
      position: PropTypes.shape({ // Position is now managed here
          x: PropTypes.number,
          y: PropTypes.number,
      }),
      obstacles: PropTypes.array, // Mark as optional if they might be missing
      passageways: PropTypes.array,
      noPipeZones: PropTypes.array,
      // Add other expected fields from your Room definition if needed for rendering checks
  })).isRequired,
  setRooms: PropTypes.func.isRequired,
  // Define shape for settings if you want stricter checking
  pipeSettings: PropTypes.shape({
      pipeSpacing: PropTypes.number,
      maxPipeLength: PropTypes.number,
      pipeDiameter: PropTypes.number,
  }),
  scaleFactor: PropTypes.number,
};

export default HouseCanvasWrapper;
