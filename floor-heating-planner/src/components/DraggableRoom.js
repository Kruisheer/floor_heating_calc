import React from 'react';
import { useDrag } from 'react-dnd';

const DraggableRoom = ({ id, room }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ROOM',
    item: { id, ...room },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        border: '1px solid black',
        padding: '10px',
        marginBottom: '10px',
        backgroundColor: '#f0f0f0',
      }}
    >
      Room {id + 1}: {room.width}m x {room.height}m
    </div>
  );
};

export default DraggableRoom;
