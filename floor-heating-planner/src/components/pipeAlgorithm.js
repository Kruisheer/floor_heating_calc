// floor-heating-planner/src/components/pipeAlgorithm.js

// Utility function to calculate the Euclidean distance between two points
const calculateDistance = (start, end) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// Function to split a path into segments not exceeding maxLength
const splitPath = (start, end, maxLength) => {
  const totalLength = calculateDistance(start, end);
  if (totalLength <= maxLength) {
    return [{ start, end, points: [] }];
  }

  const numberOfSegments = Math.ceil(totalLength / maxLength);
  const segmentLength = totalLength / numberOfSegments;
  const dx = (end.x - start.x) / numberOfSegments;
  const dy = (end.y - start.y) / numberOfSegments;

  const segments = [];
  for (let i = 0; i < numberOfSegments; i++) {
    const segmentStart = {
      x: start.x + dx * i,
      y: start.y + dy * i,
    };
    const segmentEnd = {
      x: start.x + dx * (i + 1),
      y: start.y + dy * (i + 1),
    };
    segments.push({ start: segmentStart, end: segmentEnd, points: [] });
  }

  return segments;
};

const generatePipePaths = (houseSize, placedRooms, doors) => {
  const heatingSource = { x: 0, y: 0 }; // Central heating source
  const paths = [];
  const elbows = [];

  placedRooms.forEach((room, index) => {
    // Calculate the center of the room
    const roomCenter = {
      x: room.x + room.width / 2,
      y: room.y + room.height / 2,
    };

    // Define a simple path: heatingSource -> roomCenter via horizontal then vertical
    const pathStart = heatingSource;
    const elbowPoint = { x: roomCenter.x, y: heatingSource.y }; // Horizontal first

    // Calculate segments
    const firstSegment = {
      start: pathStart,
      end: elbowPoint,
      points: [],
      length: calculateDistance(pathStart, elbowPoint),
    };

    const secondSegment = {
      start: elbowPoint,
      end: roomCenter,
      points: [],
      length: calculateDistance(elbowPoint, roomCenter),
    };

    // Add elbow
    elbows.push(elbowPoint);

    // Check if any segment exceeds 100m
    const maxLength = 100;
    let segmentsToAdd = [];

    [firstSegment, secondSegment].forEach((segment) => {
      if (segment.length > maxLength) {
        const splitSegments = splitPath(segment.start, segment.end, maxLength);
        segmentsToAdd = segmentsToAdd.concat(splitSegments);
        // Add elbows for each split
        splitSegments.slice(1).forEach((seg) => elbows.push(seg.start));
      } else {
        segmentsToAdd.push(segment);
      }
    });

    paths.push(...segmentsToAdd);
  });

  return { paths, elbows };
};

export default generatePipePaths;
