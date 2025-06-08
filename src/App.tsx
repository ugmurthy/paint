import React, { useState } from 'react';
import './App.css';
import DrawingCanvas from './components/DrawingCanvas';
import Toolbar from './components/Toolbar';
import ColorPicker from './components/ColorPicker';

// Define tool types
export type ToolType =
  | 'pen-thin'
  | 'pen-medium'
  | 'pen-thick'
  | 'eraser'
  | 'spray'
  | 'rectangle'
  | 'circle'
  | 'triangle';

function App() {
  // State for selected tool and color
  const [selectedTool, setSelectedTool] = useState<ToolType>('pen-medium');
  const [selectedColor, setSelectedColor] = useState<string>('#FF0000');
  const [clearCanvas, setClearCanvas] = useState<boolean>(false);

  // Function to handle tool selection
  const handleToolSelect = (tool: ToolType) => {
    setSelectedTool(tool);
  };

  // Function to handle color selection
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  // Function to handle new drawing
  const handleNewDrawing = () => {
    setClearCanvas(true);
    // Reset the flag after a short delay to allow the canvas to detect the change
    setTimeout(() => {
      setClearCanvas(false);
    }, 100);
  };

  // Function to save drawing as PNG
  const handleSaveDrawing = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'my-drawing.png';
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>DoodleDazzle</h1>
        <div className="header-buttons">
          <button className="action-button new-button" onClick={handleNewDrawing} title="New Drawing">
            <span style={{ fontSize: '24px' }}>🆕</span>
            <span className="action-label">New Drawing</span>
          </button>
          <button className="action-button save-button" onClick={handleSaveDrawing} title="Save Drawing">
            <span style={{ fontSize: '24px' }}>💾</span>
            <span className="action-label">Save Drawing</span>
          </button>
        </div>
      </header>
      <main className="App-main">
        <div className="sidebar">
          <Toolbar
            selectedTool={selectedTool}
            onSelectTool={handleToolSelect}
          />
          <ColorPicker
            selectedColor={selectedColor}
            onSelectColor={handleColorSelect}
          />
        </div>
        <div className="canvas-container">
          <DrawingCanvas
            tool={selectedTool}
            color={selectedColor}
            clearCanvas={clearCanvas}
          />
        </div>
      </main>
    </div>
  );
}

export default App;