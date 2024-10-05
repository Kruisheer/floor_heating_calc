// src/components/HouseCanvas.js

import React, { useState } from 'react';
import DraggableRoom from './DraggableRoom';
import { useLocation, useNavigate } from 'react-router-dom';
import './HouseCanvas.css';

const HouseCanvas = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { rooms } = location.state || { rooms: [] };

  // State to track positions of rooms
  const [roomPositions, setRoomPositions] = useState({});

  // State to track pipe lengths for rooms
  const [pipeLengths, setPipeLengths] = useState({});

  // State for configurable parameters per room
  const [configurations, setConfigurations] = useState(() => {
    const initialConfig = {};
    rooms.forEach((room) => {
      initialConfig[room.name] = {
        loopSpacing: 1, // Default loop spacing
        startingPoint: { x: 0, y: 0 }, // Default starting point
        endingPoint: { x: 0, y: 0 },   // Initialize ending point
        pathMethod: 'doubleSpiral',    // Default path generation method
      };
    });
    return initialConfig;
  });

  // Function to handle pipe length updates from DraggableRoom
  const handlePipeLengthCalculated = (roomName, pipeLength) => {
    setPipeLengths((prev) => ({
      ...prev,
      [roomName]: pipeLength,
    }));
  };

  // Function to handle starting point selection per room
  const handleStartingPointChange = (roomName, newStartingPoint) => {
    console.log(`Updating starting point for ${roomName}:`, newStartingPoint);
    setConfigurations((prev) => ({
      ...prev,
      [roomName]: {
        ...prev[roomName],
        startingPoint: newStartingPoint,
      },
    }));
  };

  // Function to handle ending point selection per room
  const handleEndingPointChange = (roomName, newEndingPoint) => {
    console.log(`Updating ending point for ${roomName}:`, newEndingPoint);
    setConfigurations((prev) => ({
      ...prev,
      [roomName]: {
        ...prev[roomName],
        endingPoint: newEndingPoint,
      },
    }));
  };

  // Function to handle loop spacing change per room
  const handleLoopSpacingChange = (roomName, newSpacing) => {
    console.log(`Updating loop spacing for ${roomName}: ${newSpacing}`);
    setConfigurations((prev) => ({
      ...prev,
      [roomName]: {
        ...prev[roomName],
        loopSpacing: newSpacing,
      },
    }));
  };

  // Function to handle path method change per room
  const handlePathMethodChange = (roomName, newMethod) => {
    console.log(`Updating path method for ${roomName}: ${newMethod}`);
    setConfigurations((prev) => ({
      ...prev,
      [roomName]: {
        ...prev[roomName],
        pathMethod: newMethod,
      },
    }));
  };

  if (!rooms || rooms.length === 0) {
    return (
      <div>
        <h2>No Rooms Added</h2>
        <button onClick={() => navigate('/')}>Go Back</button>
      </div>
    );
  }

  // Define the size of the house canvas
  const houseWidth = 800; // Adjust as needed
  const houseHeight = 600; // Adjust as needed

  return (
    <div className="house-canvas-page">
      <h2>House Canvas</h2>

      {/* Configuration Sidebar */}
      <div className="configuration-sidebar">
        <h3>Configuration Settings</h3>
        {rooms.map((room, index) => (
          <div key={index} className="config-item">
            <h4>{room.name}</h4>
            {/* Loop Spacing Control */}
            <label htmlFor={`loopSpacing-${room.name}`}>
              Loop Spacing (grid units):
            </label>
            <input
              type="number"
              id={`loopSpacing-${room.name}`}
              min="1"
              max="10"
              value={configurations[room.name].loopSpacing}
              onChange={(e) =>
                handleLoopSpacingChange(
                  room.name,
                  parseInt(e.target.value, 10) || 1
                )
              }
            />

            {/* Starting Point Controls */}
            <div className="starting-point-controls">
              <label>Starting Point:</label>
              <div>
                <label htmlFor={`startingPointX-${room.name}`}>X:</label>
                <input
                  type="number"
                  id={`startingPointX-${room.name}`}
                  min="0"
                  value={configurations[room.name].startingPoint.x}
                  onChange={(e) =>
                    handleStartingPointChange(room.name, {
                      ...configurations[room.name].startingPoint,
                      x: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
              </div>
              <div>
                <label htmlFor={`startingPointY-${room.name}`}>Y:</label>
                <input
                  type="number"
                  id={`startingPointY-${room.name}`}
                  min="0"
                  value={configurations[room.name].startingPoint.y}
                  onChange={(e) =>
                    handleStartingPointChange(room.name, {
                      ...configurations[room.name].startingPoint,
                      y: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
              </div>
            </div>

            {/* Ending Point Controls */}
            <div className="ending-point-controls">
              <label>Ending Point:</label>
              <div>
                <label htmlFor={`endingPointX-${room.name}`}>X:</label>
                <input
                  type="number"
                  id={`endingPointX-${room.name}`}
                  min="0"
                  value={configurations[room.name].endingPoint.x}
                  onChange={(e) =>
                    handleEndingPointChange(room.name, {
                      ...configurations[room.name].endingPoint,
                      x: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
              </div>
              <div>
                <label htmlFor={`endingPointY-${room.name}`}>Y:</label>
                <input
                  type="number"
                  id={`endingPointY-${room.name}`}
                  min="0"
                  value={configurations[room.name].endingPoint.y}
                  onChange={(e) =>
                    handleEndingPointChange(room.name, {
                      ...configurations[room.name].endingPoint,
                      y: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
              </div>
            </div>

            {/* Path Generation Method Control */}
            <label htmlFor={`pathMethod-${room.name}`}>Path Generation Method:</label>
            <select
              id={`pathMethod-${room.name}`}
              value={configurations[room.name].pathMethod}
              onChange={(e) =>
                handlePathMethodChange(room.name, e.target.value)
              }
            >
              <option value="doubleSpiral">Double Spiral</option>
              <option value="original">Original Method</option>
            </select>
          </div>
        ))}

        {/* Reset Configurations */}
        <button
          onClick={() => {
            const resetConfig = {};
            rooms.forEach((room) => {
              resetConfig[room.name] = {
                loopSpacing: 1,
                startingPoint: { x: 0, y: 0 },
                endingPoint: { x: 0, y: 0 },
                pathMethod: 'doubleSpiral',
              };
            });
            setConfigurations(resetConfig);
          }}
          className="reset-button"
        >
          Reset to Default
        </button>
      </div>

      {/* Room Info Sidebar */}
      <div className="room-info-sidebar">
        <h3>Room Information</h3>
        {rooms.map((room, index) => (
          <div key={index} className="room-info">
            <h4>{room.name}</h4>
            <p>Dimensions: {room.dimensions} m</p>
            <p>
              Total Pipe Length:{' '}
              {pipeLengths[room.name]
                ? `${pipeLengths[room.name].toFixed(2)} m`
                : 'Calculating...'}
            </p>
          </div>
        ))}
      </div>

      {/* House Canvas */}
      <div className="house-canvas-container">
        <div
          className="house-canvas"
          style={{
            width: houseWidth,
            height: houseHeight,
          }}
        >
          {rooms.map((room, index) => (
            <DraggableRoom
              key={index}
              name={room.name}
              dimensions={room.dimensions}
              obstacles={room.obstacles}
              passageways={room.passageways}
              noPipeZones={room.noPipeZones} // Pass noPipeZones if available
              position={roomPositions[room.name] || { x: 0, y: 0 }}
              loopSpacing={configurations[room.name].loopSpacing} // Pass loopSpacing
              startPoint={configurations[room.name].startingPoint}
              endPoint={configurations[room.name].endingPoint} // Pass endingPoint
              pathMethod={configurations[room.name].pathMethod} // Pass pathMethod
              onDragStop={(e, data) => {
                setRoomPositions((prev) => ({
                  ...prev,
                  [room.name]: { x: data.x, y: data.y },
                }));
              }}
              onPipeLengthCalculated={handlePipeLengthCalculated}
              onStartPointChange={handleStartingPointChange}
              onEndPointChange={handleEndingPointChange} // Pass endingPoint handler
            />
          ))}
        </div>
      </div>
      <button
        onClick={() => navigate('/final-step')}
        className="next-button"
        disabled={rooms.length === 0}
      >
        Generate Heating Plan
      </button>
    </div>
  );
};

export default HouseCanvas;
