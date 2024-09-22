// floor-heating-planner/src/components/HouseCanvas.js
import React, { useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';

const HouseCanvas = ({
  houseSize,
  placedRooms,
  setPlacedRooms,
  doors = [],
  setDoors,
  allowDoorPlacement = false,
  pipePaths = [],
  elbows = [],
  readOnly = false,
}) => {
  const canvasRef = useRef(null);
  const scale = 50; // 1 meter = 50 pixels

  const [, drop] = useDrop(() => ({
    accept: 'ROOM',
    drop: (item, monitor) => {
      if (readOnly) return;
      const canvas = canvasRef.current;
      const canvasRect = canvas.getBoundingClientRect();
      const dropPosition = monitor.getClientOffset();
      const x = Math.round((dropPosition.x - canvasRect.left) / scale);
      const y = Math.round((dropPosition.y - canvasRect.top) / scale);

      // Check for overlapping rooms or boundaries here if necessary

      console.log(`Dropping room ${item.id + 1} at (${x}, ${y})`);
      setPlacedRooms([...placedRooms, { ...item, x, y }]);
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw house outline
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, houseSize.width * scale, houseSize.height * scale);

    // Draw placed rooms
    placedRooms.forEach((room, index) => {
      ctx.fillStyle = 'rgba(0, 128, 255, 0.3)';
      ctx.fillRect(room.x * scale, room.y * scale, room.width * scale, room.height * scale);
      ctx.strokeStyle = 'blue';
      ctx.strokeRect(room.x * scale, room.y * scale, room.width * scale, room.height * scale);

      // Optionally, label the rooms
      ctx.fillStyle = 'black';
      ctx.font = '14px Arial';
      ctx.fillText(`Room ${index + 1}`, room.x * scale + 5, room.y * scale + 20);
    });

    // Draw doors
    doors.forEach((door, index) => {
      ctx.fillStyle = 'brown';
      ctx.fillRect(door.x * scale, door.y * scale, door.width * scale, 5); // 5 pixels height for door
    });

    // Draw pipe paths
    pipePaths.forEach((path, index) => {
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(path.start.x * scale, path.start.y * scale);
      path.points.forEach((point) => {
        ctx.lineTo(point.x * scale, point.y * scale);
      });
      ctx.lineTo(path.end.x * scale, path.end.y * scale);
      ctx.stroke();

      // Optionally, label the pipes
      ctx.fillStyle = 'red';
      ctx.font = '12px Arial';
      ctx.fillText(`P${index + 1}`, path.end.x * scale, path.end.y * scale);
    });

    // Draw elbows
    elbows.forEach((elbow, index) => {
      ctx.fillStyle = 'green';
      ctx.beginPath();
      ctx.arc(elbow.x * scale, elbow.y * scale, 5, 0, 2 * Math.PI);
      ctx.fill();

      // Optionally, label the elbows
      ctx.fillStyle = 'green';
      ctx.font = '12px Arial';
      ctx.fillText(`E${index + 1}`, elbow.x * scale + 6, elbow.y * scale - 6);
    });
  }, [houseSize, placedRooms, doors, pipePaths, elbows]);

  const handleCanvasClick = (e) => {
    if (allowDoorPlacement && setDoors && !readOnly) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / scale);
      const y = Math.floor((e.clientY - rect.top) / scale);
      console.log(`Placing door at (${x}, ${y})`);
      setDoors([...doors, { x, y, width: 1 }]); // Standard door width of 1 meter
    }
  };

  return (
    <div ref={drop}>
      <canvas
        ref={canvasRef}
        width={houseSize.width * scale}
        height={houseSize.height * scale}
        onClick={handleCanvasClick}
        style={{ border: '1px solid black', cursor: allowDoorPlacement ? 'pointer' : 'default' }}
      />
    </div>
  );
};

export default HouseCanvas;
