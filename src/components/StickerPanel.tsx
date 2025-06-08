import React, { useEffect, useState } from 'react';

interface StickerPanelProps {
  onSelectSticker: (sticker: string) => void;
}

const StickerPanel: React.FC<StickerPanelProps> = ({ onSelectSticker }) => {
  const [stickers, setStickers] = useState<string[]>([]);

  // Load sticker images
  useEffect(() => {
    // In a real app, these would be loaded from a server or assets folder
    // For this example, we'll use emoji SVGs from a free service
    const stickerImages = [
      'https://twemoji.maxcdn.com/v/latest/svg/1f600.svg', // Grinning face
      'https://twemoji.maxcdn.com/v/latest/svg/1f308.svg', // Rainbow
      'https://twemoji.maxcdn.com/v/latest/svg/1f33a.svg', // Flower
      'https://twemoji.maxcdn.com/v/latest/svg/1f431.svg', // Cat
      'https://twemoji.maxcdn.com/v/latest/svg/1f436.svg', // Dog
      'https://twemoji.maxcdn.com/v/latest/svg/1f98b.svg', // Butterfly
      'https://twemoji.maxcdn.com/v/latest/svg/1f984.svg', // Unicorn
      'https://twemoji.maxcdn.com/v/latest/svg/1f680.svg', // Rocket
      'https://twemoji.maxcdn.com/v/latest/svg/1f31f.svg', // Star
      'https://twemoji.maxcdn.com/v/latest/svg/1f490.svg', // Bouquet
      'https://twemoji.maxcdn.com/v/latest/svg/1f419.svg', // Octopus
      'https://twemoji.maxcdn.com/v/latest/svg/1f981.svg', // Lion
    ];
    
    setStickers(stickerImages);
  }, []);

  return (
    <div className="sticker-panel">
      <h2 className="section-title">Stickers</h2>
      <div className="stickers-container">
        {stickers.map((sticker, index) => (
          <button
            key={index}
            className="sticker-button"
            onClick={() => onSelectSticker(sticker)}
            title={`Sticker ${index + 1}`}
          >
            <img src={sticker} alt={`Sticker ${index + 1}`} className="sticker-thumbnail" />
          </button>
        ))}
      </div>
      
      {/* Styles moved to App.css */}
    </div>
  );
};

export default StickerPanel;