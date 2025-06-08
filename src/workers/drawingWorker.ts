// Web worker for handling drawing operations
// This helps offload intensive calculations from the main thread

/* eslint-disable no-restricted-globals */
// The line above disables the ESLint rule that flags 'self' usage in web workers

// Define line interface
interface LineElement {
  tool: string;
  points: number[];
  color: string;
  strokeWidth: number;
}

// Define shape interface
interface ShapeElement {
  tool: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  color: string;
  points?: number[];
  preview?: boolean;
}

// Handle messages from main thread
self.onmessage = (e) => {
  const { type, data } = e.data;
  
  switch (type) {
    case 'ADD_LINE':
      handleAddLine(data);
      break;
    case 'UPDATE_LAST_LINE':
      handleUpdateLastLine(data);
      break;
    case 'ADD_MULTIPLE_LINES':
      handleAddMultipleLines(data);
      break;
    case 'UPDATE_SHAPE_PREVIEW':
      handleUpdateShapePreview(data);
      break;
    default:
      console.warn('Unknown message type:', type);
  }
};

// Add a new line to the lines array
function handleAddLine({ lines, newLine }: { lines: LineElement[], newLine: LineElement }) {
  const updatedLines = [...lines, newLine];
  self.postMessage({ type: 'LINE_UPDATED', data: updatedLines });
}

// Update the last line with new points
function handleUpdateLastLine({ lines, pos }: { lines: LineElement[], pos: { x: number, y: number } }) {
  const updatedLines = [...lines];
  const lastLine = updatedLines[updatedLines.length - 1];
  
  if (lastLine) {
    // Add new point to the last line
    lastLine.points = lastLine.points.concat([pos.x, pos.y]);
    self.postMessage({ type: 'LINE_UPDATED', data: updatedLines });
  }
}

// Add multiple lines at once (used for spray tool)
function handleAddMultipleLines({ lines, newLines }: { lines: LineElement[], newLines: LineElement[] }) {
  const updatedLines = [...lines, ...newLines];
  self.postMessage({ type: 'LINE_UPDATED', data: updatedLines });
}

// Update shape preview during drawing
function handleUpdateShapePreview({ shapes, shapeProps }: { shapes: ShapeElement[], shapeProps: ShapeElement }) {
  // Remove any previous preview shape
  const filteredShapes = shapes.filter(shape => !shape.preview);
  
  // Add the new preview shape
  const previewShape = { ...shapeProps, preview: true };
  const updatedShapes = [...filteredShapes, previewShape];
  
  self.postMessage({ type: 'SHAPE_UPDATED', data: updatedShapes });
}

// Export empty object to make TypeScript happy with the module format
export {};