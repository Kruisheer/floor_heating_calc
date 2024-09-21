import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableRoom from './DraggableRoom';
import HouseCanvas from './HouseCanvas';
import generatePipePaths from './pipeAlgorithm';

const STEP = {
  HOUSE_SIZE: 0,
  ROOM_COUNT: 1,
  ROOM_SIZES: 2,
  ROOM_PLACEMENT: 3,
  DOOR_PLACEMENT: 4,
  REVIEW: 5,
};

const FloorHeatingWizard = () => {
  const [step, setStep] = useState(STEP.HOUSE_SIZE);
  const [houseSize, setHouseSize] = useState({ width: 10, height: 10 }); // Default 10x10 meters
  const [roomCount, setRoomCount] = useState(2);
  const [rooms, setRooms] = useState([]);
  const [placedRooms, setPlacedRooms] = useState([]);
  const [doors, setDoors] = useState([]);
  const [pipePaths, setPipePaths] = useState([]);
  const [elbows, setElbows] = useState([]);

  const nextStep = () => {
    if (step === STEP.DOOR_PLACEMENT) {
      // After door placement, generate pipe paths
      const { paths, elbows: generatedElbows } = generatePipePaths(
        houseSize,
        placedRooms,
        doors
      );
      setPipePaths(paths);
      setElbows(generatedElbows);
      setStep(STEP.REVIEW);
    } else {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const renderStep = () => {
    switch (step) {
      case STEP.HOUSE_SIZE:
        return (
          <div>
            <h2>Step 1: House Size</h2>
            <label>
              Width (m):
              <input
                type="number"
                value={houseSize.width}
                onChange={(e) =>
                  setHouseSize({ ...houseSize, width: Number(e.target.value) })
                }
              />
            </label>
            <br />
            <label>
              Height (m):
              <input
                type="number"
                value={houseSize.height}
                onChange={(e) =>
                  setHouseSize({ ...houseSize, height: Number(e.target.value) })
                }
              />
            </label>
            <br />
            <button onClick={nextStep} disabled={houseSize.width <= 0 || houseSize.height <= 0}>
              Next
            </button>
          </div>
        );
      case STEP.ROOM_COUNT:
        return (
          <div>
            <h2>Step 2: Number of Rooms</h2>
            <label>
              Room Count:
              <input
                type="number"
                value={roomCount}
                onChange={(e) => setRoomCount(Number(e.target.value))}
                min="1"
              />
            </label>
            <br />
            <button onClick={prevStep}>Back</button>
            <button onClick={nextStep} disabled={roomCount < 1}>
              Next
            </button>
          </div>
        );
      case STEP.ROOM_SIZES:
        return (
          <div>
            <h2>Step 3: Room Sizes</h2>
            {Array.from({ length: roomCount }).map((_, index) => (
              <div key={index}>
                <h3>Room {index + 1}</h3>
                <label>
                  Width (m):
                  <input
                    type="number"
                    value={rooms[index]?.width || 0}
                    onChange={(e) => {
                      const newRooms = [...rooms];
                      newRooms[index] = { ...newRooms[index], width: Number(e.target.value) };
                      setRooms(newRooms);
                    }}
                    min="1"
                  />
                </label>
                <br />
                <label>
                  Height (m):
                  <input
                    type="number"
                    value={rooms[index]?.height || 0}
                    onChange={(e) => {
                      const newRooms = [...rooms];
                      newRooms[index] = { ...newRooms[index], height: Number(e.target.value) };
                      setRooms(newRooms);
                    }}
                    min="1"
                  />
                </label>
                <br />
              </div>
            ))}
            <button onClick={prevStep}>Back</button>
            <button
              onClick={nextStep}
              disabled={rooms.some((room) => room.width <= 0 || room.height <= 0)}
            >
              Next
            </button>
          </div>
        );
      case STEP.ROOM_PLACEMENT:
        return (
          <DndProvider backend={HTML5Backend}>
            <div>
              <h2>Step 4: Room Placement</h2>
              <div style={{ display: 'flex' }}>
                <div style={{ marginRight: '20px' }}>
                  {rooms.map((room, index) => (
                    <DraggableRoom key={index} id={index} room={room} />
                  ))}
                </div>
                <HouseCanvas
                  houseSize={houseSize}
                  placedRooms={placedRooms}
                  setPlacedRooms={setPlacedRooms}
                />
              </div>
              <button onClick={prevStep}>Back</button>
              <button onClick={nextStep} disabled={placedRooms.length !== roomCount}>
                Next
              </button>
            </div>
          </DndProvider>
        );
      case STEP.DOOR_PLACEMENT:
        return (
          <div>
            <h2>Step 5: Door Placement</h2>
            <HouseCanvas
              houseSize={houseSize}
              placedRooms={placedRooms}
              doors={doors}
              setDoors={setDoors}
              allowDoorPlacement={true}
            />
            <button onClick={prevStep}>Back</button>
            <button onClick={nextStep} disabled={doors.length === 0}>
              Next
            </button>
          </div>
        );
      case STEP.REVIEW:
        return (
          <div>
            <h2>Review and Bill of Materials</h2>
            <div>
              <h3>House Size:</h3>
              <p>
                Width: {houseSize.width} m, Height: {houseSize.height} m
              </p>
            </div>
            <div>
              <h3>Rooms:</h3>
              {placedRooms.map((room, index) => (
                <p key={index}>
                  Room {index + 1}: {room.width}m x {room.height}m at ({room.x}, {room.y})
                </p>
              ))}
            </div>
            <div>
              <h3>Doors:</h3>
              {doors.map((door, index) => (
                <p key={index}>
                  Door {index + 1}: Position ({door.x}, {door.y}), Width {door.width}m
                </p>
              ))}
            </div>
            <div>
              <h3>Pipe Paths:</h3>
              <ul>
                {pipePaths.map((path, index) => (
                  <li key={index}>
                    Path {index + 1}: {path.length} meters
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Elbows:</h3>
              <p>Total Elbows: {elbows.length}</p>
            </div>
            <HouseCanvas
              houseSize={houseSize}
              placedRooms={placedRooms}
              doors={doors}
              pipePaths={pipePaths}
              elbows={elbows}
              readOnly={true}
            />
            <button onClick={prevStep}>Back</button>
            <button
              onClick={() =>
                alert('Bill of Materials generated! Check the console for details.')
              }
            >
              Generate Bill of Materials
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="floor-heating-wizard">
      <h1>Floor Heating System Planner</h1>
      {renderStep()}
    </div>
  );
};

export default FloorHeatingWizard;
