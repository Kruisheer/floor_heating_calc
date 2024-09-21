// pipeAlgorithm.js
// This is a simplified example. In a real-world scenario, you might use more sophisticated algorithms.

const generatePipePaths = (houseSize, placedRooms, doors) => {
    // For simplicity, assume a central heating source at (0,0)
    const heatingSource = { x: 0, y: 0 };
    const paths = [];
    const elbows = [];
  
    placedRooms.forEach((room, index) => {
      // Calculate the center of the room
      const roomCenter = {
        x: room.x + room.width / 2,
        y: room.y + room.height / 2,
      };
  
      // Simple path: heating source -> room center
      const path = {
        start: heatingSource,
        end: roomCenter,
        points: [
          { x: heatingSource.x, y: roomCenter.y }, // Horizontal to y level
          { x: roomCenter.x, y: roomCenter.y }, // Then vertical to room
        ],
        length: calculatePathLength(heatingSource, roomCenter),
      };
  
      paths.push(path);
  
      // Add elbows at each turn
      path.points.forEach((point) => {
        elbows.push(point);
      });
  
      // Check if pipe length exceeds 100 meters
      if (path.length > 100) {
        // Split the pipe into two segments
        const midPoint = {
          x: (path.start.x + path.end.x) / 2,
          y: (path.start.y + path.end.y) / 2,
        };
        const firstSegment = {
          start: path.start,
          end: midPoint,
          points: [],
          length: calculatePathLength(path.start, midPoint),
        };
        const secondSegment = {
          start: midPoint,
          end: path.end,
          points: [],
          length: calculatePathLength(midPoint, path.end),
        };
        paths[index] = firstSegment;
        paths.push(secondSegment);
        elbows.push(midPoint);
      }
    });
  
    return { paths, elbows };
  };
  
  const calculatePathLength = (start, end) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  export default generatePipePaths;
  