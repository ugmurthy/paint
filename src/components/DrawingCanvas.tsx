import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Line, Rect, Circle, RegularPolygon } from 'react-konva';
import Konva from 'konva';
import { ToolType } from '../App';

// Define props interface
interface DrawingCanvasProps {
  tool: ToolType;
  color: string;
  clearCanvas?: boolean;
}

// Define point interface for drawing
interface Point {
  x: number;
  y: number;
}

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
  strokeWidth?: number;
  preview?: boolean;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ tool, color, clearCanvas }) => {
  // Refs
  const stageRef = useRef<Konva.Stage>(null);
  const isDrawing = useRef(false);
  const drawingWorkerRef = useRef<Worker | null>(null);

  // State
  const [lines, setLines] = useState<LineElement[]>([]);
  const [shapes, setShapes] = useState<ShapeElement[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [startPoint, setStartPoint] = useState<Point | null>(null);

  // Initialize web worker for drawing operations
  useEffect(() => {
    // Create a web worker for drawing operations
    const worker = new Worker(new URL('../workers/drawingWorker.ts', import.meta.url));
    
    // Set up message handler
    worker.onmessage = (e) => {
      const { type, data } = e.data;
      
      if (type === 'LINE_UPDATED') {
        setLines(data);
      } else if (type === 'SHAPE_UPDATED') {
        setShapes(data);
      }
    };
    
    drawingWorkerRef.current = worker;
    
    // Clean up worker on unmount
    return () => {
      worker.terminate();
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const container = document.querySelector('.canvas-container');
      if (container) {
        const width = container.clientWidth - 40; // Subtract padding
        const height = container.clientHeight - 40; // Subtract padding
        setCanvasSize({ width, height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Clear canvas when clearCanvas prop changes to true
  useEffect(() => {
    if (clearCanvas) {
      setLines([]);
      setShapes([]);
      setStartPoint(null);
    }
  }, [clearCanvas]);


  // Get stroke width based on tool
  const getStrokeWidth = () => {
    switch (tool) {
      case 'pen-thin':
        return 2;
      case 'pen-medium':
        return 5;
      case 'pen-thick':
        return 10;
      case 'eraser':
        return 20;
      case 'spray':
        return 1;
      default:
        return 5;
    }
  };

  // Handle mouse down event
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    isDrawing.current = true;
    const pos = e.target.getStage()?.getPointerPosition();
    
    if (!pos) return;
    
    setStartPoint({ x: pos.x, y: pos.y });
    
    if (['rectangle', 'circle', 'triangle'].includes(tool)) {
      // For shape tools, we'll create the shape on mouse up
      return;
    }
    
    if (['pen-thin', 'pen-medium', 'pen-thick', 'eraser', 'spray'].includes(tool)) {
      // For drawing tools, start a new line
      const newLine = {
        tool,
        points: [pos.x, pos.y],
        color: tool === 'eraser' ? '#FFFFFF' : color,
        strokeWidth: getStrokeWidth()
      };
      
      // Use web worker to update lines
      drawingWorkerRef.current?.postMessage({
        type: 'ADD_LINE',
        data: { lines, newLine }
      });
    }
  };

  // Handle mouse move event
  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current) return;
    
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    
    if (!pos || !startPoint) return;
    
    if (['rectangle', 'circle', 'triangle'].includes(tool)) {
      // For shape tools, update preview
      let shapeProps: ShapeElement;
      
      if (tool === 'rectangle') {
        shapeProps = {
          tool,
          x: startPoint.x,
          y: startPoint.y,
          width: pos.x - startPoint.x,
          height: pos.y - startPoint.y,
          color,
          strokeWidth: 3
        };
      } else if (tool === 'circle' || tool === 'triangle') {
        // For both circle and triangle, calculate radius based on distance
        const radius = Math.sqrt(
          Math.pow(pos.x - startPoint.x, 2) + Math.pow(pos.y - startPoint.y, 2)
        );
        shapeProps = {
          tool,
          x: startPoint.x,
          y: startPoint.y,
          radius,
          color,
          strokeWidth: 3
        };
      } else {
        // This should never happen, but TypeScript needs it
        shapeProps = {
          tool,
          x: startPoint.x,
          y: startPoint.y,
          color,
          strokeWidth: 3
        };
      }
      
      // Use web worker to update shape preview
      drawingWorkerRef.current?.postMessage({
        type: 'UPDATE_SHAPE_PREVIEW',
        data: { shapes, shapeProps }
      });
      return;
    }
    
    if (tool === 'spray') {
      // For spray tool, add multiple points with randomness
      const numPoints = 40; // Doubled the number of points for better density
      const radius = getStrokeWidth() * 10; // Doubled the radius to make area 4x larger
      const points: number[] = [];
      
      for (let i = 0; i < numPoints; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * radius;
        points.push(
          pos.x + Math.cos(angle) * r,
          pos.y + Math.sin(angle) * r
        );
      }
      
      const newLines = points.map((_, i) => {
        if (i % 2 === 0 && i < points.length - 1) {
          return {
            tool: 'spray',
            points: [points[i], points[i + 1], points[i], points[i + 1]],
            color,
            strokeWidth: 1
          };
        }
        return null;
      }).filter(Boolean) as LineElement[];
      
      // Use web worker to update lines
      drawingWorkerRef.current?.postMessage({
        type: 'ADD_MULTIPLE_LINES',
        data: { lines, newLines }
      });
      return;
    }
    
    if (['pen-thin', 'pen-medium', 'pen-thick', 'eraser'].includes(tool)) {
      // For drawing tools, add point to the last line
      const lastLine = lines[lines.length - 1];
      if (lastLine) {
        // Use web worker to update the last line
        drawingWorkerRef.current?.postMessage({
          type: 'UPDATE_LAST_LINE',
          data: { lines, pos }
        });
      }
    }
  };

  // Handle mouse up event
  const handleMouseUp = () => {
    isDrawing.current = false;
    
    if (!startPoint) return;
    
    if (['rectangle', 'circle', 'triangle'].includes(tool)) {
      // For shape tools, finalize the shape
      const stage = stageRef.current;
      const pos = stage?.getPointerPosition();
      
      if (!pos) return;
      
      // Initialize with default values
      let newShape: ShapeElement = {
        tool,
        x: startPoint.x,
        y: startPoint.y,
        color,
        strokeWidth: 3
      };
      
      if (tool === 'rectangle') {
        newShape = {
          tool,
          x: startPoint.x,
          y: startPoint.y,
          width: pos.x - startPoint.x,
          height: pos.y - startPoint.y,
          color
        };
      } else if (tool === 'circle' || tool === 'triangle') {
        // For both circle and triangle, calculate radius based on distance
        const radius = Math.sqrt(
          Math.pow(pos.x - startPoint.x, 2) + Math.pow(pos.y - startPoint.y, 2)
        );
        newShape = {
          tool,
          x: startPoint.x,
          y: startPoint.y,
          radius,
          color,
          strokeWidth: 3
        };
      }
      
      setShapes([...shapes, newShape]);
    }
    
    setStartPoint(null);
  };

  return (
    <Stage
      width={canvasSize.width}
      height={canvasSize.height}
      onMouseDown={handleMouseDown}
      onMousemove={handleMouseMove}
      onMouseup={handleMouseUp}
      onTouchStart={(e) => {
        // Convert touch event to mouse event format
        const touch = e.evt.touches[0];
        const mouseEvent = {
          ...e,
          evt: {
            ...e.evt,
            clientX: touch.clientX,
            clientY: touch.clientY,
            button: 0,
            buttons: 1
          }
        } as unknown as Konva.KonvaEventObject<MouseEvent>;
        handleMouseDown(mouseEvent);
      }}
      onTouchMove={(e) => {
        // Convert touch event to mouse event format
        const touch = e.evt.touches[0];
        const mouseEvent = {
          ...e,
          evt: {
            ...e.evt,
            clientX: touch.clientX,
            clientY: touch.clientY,
            button: 0,
            buttons: 1
          }
        } as unknown as Konva.KonvaEventObject<MouseEvent>;
        handleMouseMove(mouseEvent);
      }}
      onTouchEnd={handleMouseUp}
      ref={stageRef}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '10px',
        boxShadow: '0 18px 36px rgba(75, 0, 130, 0.3), 0 9px 18px rgba(75, 0, 130, 0.2), inset 0 0 10px rgba(75, 0, 130, 0.1)',
        border: '1px solid #e0e0e0'
      }}
    >
      <Layer>
        {/* Shapes */}
        {shapes.map((shape, i) => {
          if (shape.tool === 'rectangle') {
            return (
              <Rect
                key={i}
                x={shape.x}
                y={shape.y}
                width={shape.width || 0}
                height={shape.height || 0}
                fill={shape.color}
                cornerRadius={5}
              />
            );
          } else if (shape.tool === 'circle') {
            return (
              <Circle
                key={i}
                x={shape.x}
                y={shape.y}
                radius={shape.radius || 0}
                stroke={shape.color}
                strokeWidth={shape.strokeWidth || 3}
                fill="transparent"
              />
            );
          } else if (shape.tool === 'triangle') {
            return (
              <RegularPolygon
                key={i}
                x={shape.x}
                y={shape.y}
                sides={3}
                radius={shape.radius || 0}
                stroke={shape.color}
                strokeWidth={shape.strokeWidth || 3}
                fill="transparent"
                rotation={0}
              />
            );
          }
          return null;
        })}
        
        {/* Lines */}
        {lines.map((line, i) => (
          <Line
            key={i}
            points={line.points}
            stroke={line.color}
            strokeWidth={line.strokeWidth}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
            globalCompositeOperation={
              line.tool === 'eraser' ? 'destination-out' : 'source-over'
            }
          />
        ))}
        
      </Layer>
    </Stage>
  );
};

export default DrawingCanvas;