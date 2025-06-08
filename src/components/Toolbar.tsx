import React from 'react';
import { ToolType } from '../App';

interface ToolbarProps {
  selectedTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ selectedTool, onSelectTool }) => {
  // Tool definitions with icons and labels
  const tools = [
    { id: 'pen-thin' as ToolType, label: 'Thin Pen', icon: '✏️' },
    { id: 'pen-medium' as ToolType, label: 'Medium Pen', icon: '✏️' },
    { id: 'pen-thick' as ToolType, label: 'Thick Pen', icon: '✏️' },
    { id: 'eraser' as ToolType, label: 'Eraser', icon: '🧽' },
    { id: 'spray' as ToolType, label: 'Spray', icon: '🎨' },
    { id: 'rectangle' as ToolType, label: 'Rectangle', icon: '⬜' },
    { id: 'circle' as ToolType, label: 'Circle', icon: '⭕' },
    { id: 'triangle' as ToolType, label: 'Triangle', icon: '▲' },
  ];

  return (
    <div className="toolbar">
      <h2 className="section-title">Drawing Tools</h2>
      <div className="tools-container">
        {tools.map((tool) => (
          <button
            key={tool.id}
            className={`tool-button ${selectedTool === tool.id ? 'selected' : ''}`}
            onClick={() => onSelectTool(tool.id)}
            title={tool.label}
          >
            <span style={{ fontSize: '24px' }}>{tool.icon}</span>
            <span className="tool-label">{tool.label}</span>
          </button>
        ))}
      </div>
      {/* Styles moved to App.css */}
    </div>
  );
};

export default Toolbar;