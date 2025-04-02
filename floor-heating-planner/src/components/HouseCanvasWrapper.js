import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import DraggableRoom from './DraggableRoom'; // Import the room component
import { Room } from '../Room'; // Assuming Room type/interface is defined here
import { Settings } from '../App'; // Assuming Settings type is defined here

// Define default scale or get it from context/props if dynamic
const DEFAULT_SCALE_FACTOR = 50; // Pixels per meter

const HouseCanvasWrapper = ({ rooms = [], setRooms, pipeSettings, scaleFactor = DEFAULT_SCALE_FACTOR }) => {
  // State to hold the positions of each room { [roomId]: { x, y } }
  const [positions, setPositions] = useState({});

  // Initialize positions when rooms load or change
  useEffect(() => {
    setPositions(prevPositions => {
      const newPositions = {};
      rooms.forEach(room => {
        // Keep existing position if available, otherwise default (e.g., 0,0 or maybe cascade?)
        // Or maybe load initial positions from the room object itself if stored there
        newPositions[room.id] = prevPositions[room.id] || room.position || { x: 0, y: 0 };
      });
      return newPositions;
    });
  }, [rooms]); // Re-run if the rooms array changes

  // Callback for when a room stops being dragged
  const handleDragStop = useCallback((roomId, newPosition) => {
    // Update local position state
    setPositions(prev => ({
      ...prev,
      [roomId]: newPosition,
    }));

    // --- IMPORTANT: Persist the position change back to the main state ---
    // This ensures the position is saved if using usePersistentState in App.tsx
    // It finds the room, updates its position, and calls setRooms with the new array.
    setRooms(currentRooms =>
      currentRooms.map(room =>
        room.id === roomId ? { ...room, position: newPosition } : room
      )
    );
  }, [setRooms]); // Include setRooms in dependencies

  // Callback for pipe length calculation (just logging for now, could aggregate)
  const handlePipeLengthCalculated = useCallback((roomId, length) => {
    // console.log(`Room ${roomId} calculated pipe length: ${length.toFixed(1)}m`);
    // Optionally update room data with length:
    // setRooms(currentRooms =>
    //   currentRooms.map(room =>
    //     room.id === roomId ? { ...room, calculatedLength: length } : room
    //   )
    // );
  }, []); // Empty dependency array if it doesn't depend on external state change


  const canvasStyle = {
    position: 'relative', // Crucial for absolute positioning of children
    width: '100%', // Or specific pixel size like '2000px'
    height: '100vh', // Or specific pixel size like '1500px'
    backgroundColor: '#f0f0f0', // Light background for the canvas
    border: '1px solid #ccc',
    overflow: 'auto', // Add scrollbars if content exceeds dimensions
    cursor: 'default', // Default cursor for the canvas background
  };

  return (
    <div style={canvasStyle}>
      {rooms.map((room) => (
        <DraggableRoom
          key={room.id}
          id={room.id}
          name={room.name}
          dimensions={room.dimensions} // e.g., "5x4"
          // obstacles={room.obstacles} // Pass if needed
          // passageways={room.passageways} // Pass if needed
          // noPipeZones={room.noPipeZones} // Pass if needed
          position={positions[room.id] || { x: 0, y: 0 }} // Pass controlled position from state
          pipeSettings={pipeSettings} // Pass global pipe settings
          scaleFactor={scaleFactor}
          onDragStop={handleDragStop} // Pass the handler to update position
          onPipeLengthCalculated={handlePipeLengthCalculated}
        />
      ))}
    </div>
  );
};

HouseCanvasWrapper.propTypes = {
  //rooms: PropTypes.arrayOf(PropTypes.shape(Room.propTypes || {})).isRequired, // Use shape if Room has propTypes
  setRooms: PropTypes.func.isRequired, // Function to update the main rooms array
  pipeSettings: PropTypes.shape(Settings.propTypes || {}), // Use shape if Settings has propTypes
  scaleFactor: PropTypes.number,
};

export default HouseCanvasWrapper;
