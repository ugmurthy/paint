import React, { useEffect, useState } from 'react';

interface BackgroundSelectorProps {
  selectedBackground: string;
  onSelectBackground: (background: string) => void;
}

const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({ 
  selectedBackground, 
  onSelectBackground 
}) => {
  const [backgrounds, setBackgrounds] = useState<string[]>([]);

  // Load background images
  useEffect(() => {
    // In a real app, these would be loaded from a server or assets folder
    // For this example, we'll use placeholder images
    const backgroundImages = [
      'https://placekitten.com/800/600', // Cute kitten
      'https://placedog.net/800/600', // Cute dog
      'https://picsum.photos/id/1015/800/600', // Mountain landscape
      'https://picsum.photos/id/1019/800/600', // Ocean
      'https://picsum.photos/id/1039/800/600', // Forest
      'https://picsum.photos/id/1043/800/600', // Clouds
    ];
    
    setBackgrounds(backgroundImages);
  }, []);

  return (
    <div className="background-selector">
      <h2 className="section-title">Backgrounds</h2>
      <div className="backgrounds-container">
        <button
          className={`background-button ${!selectedBackground ? 'selected' : ''}`}
          onClick={() => onSelectBackground('')}
          title="No Background"
        >
          None
        </button>
        
        {backgrounds.map((bg, index) => (
          <button
            key={index}
            className={`background-button ${selectedBackground === bg ? 'selected' : ''}`}
            onClick={() => onSelectBackground(bg)}
            title={`Background ${index + 1}`}
          >
            <img src={bg} alt={`Background ${index + 1}`} className="background-thumbnail" />
          </button>
        ))}
      </div>
      
      {/* Styles moved to App.css */}
    </div>
  );
};

export default BackgroundSelector;