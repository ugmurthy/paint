import React, { useState } from 'react';

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onSelectColor }) => {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  
  // Predefined colors for kids
  const colors = [
    '#FF0000', // Red
    '#FF9900', // Orange
    '#FFFF00', // Yellow
    '#00FF00', // Green
    '#00FFFF', // Cyan
    '#0000FF', // Blue
    '#9900FF', // Purple
    '#FF00FF', // Magenta
    '#FF99CC', // Pink
    '#663300', // Brown
    '#000000', // Black
    '#FFFFFF', // White
  ];

  return (
    <div className="color-picker">
      <h2 className="section-title">Colors</h2>
      <div className="colors-container">
        {colors.map((color) => (
          <button
            key={color}
            className={`color-button ${selectedColor === color ? 'selected' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => onSelectColor(color)}
            title={getColorName(color)}
          />
        ))}
        <button
          className="custom-color-button"
          onClick={() => setShowCustomPicker(!showCustomPicker)}
          title="Custom Color"
        >
          +
        </button>
      </div>
      
      {showCustomPicker && (
        <div className="custom-color-picker">
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => onSelectColor(e.target.value)}
            className="color-input"
          />
        </div>
      )}
      
      {/* Styles moved to App.css */}
    </div>
  );
};

// Helper function to get color names
function getColorName(hexColor: string): string {
  const colorMap: Record<string, string> = {
    '#FF0000': 'Red',
    '#FF9900': 'Orange',
    '#FFFF00': 'Yellow',
    '#00FF00': 'Green',
    '#00FFFF': 'Cyan',
    '#0000FF': 'Blue',
    '#9900FF': 'Purple',
    '#FF00FF': 'Magenta',
    '#FF99CC': 'Pink',
    '#663300': 'Brown',
    '#000000': 'Black',
    '#FFFFFF': 'White',
  };
  
  return colorMap[hexColor] || 'Custom';
}

export default ColorPicker;