import React from 'react';

interface InteractiveRunwayPreviewProps {
  parts: { [key: string]: string };
}

export const InteractiveRunwayPreview: React.FC<InteractiveRunwayPreviewProps> = ({ parts }) => {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <svg viewBox="0 0 500 500" className="w-full h-auto">
        {/* Base T-Shirt SVG */}
        <g>
          {/* Body */}
          <path
            id="body"
            d="M250 100 L150 150 L150 400 L350 400 L350 150 Z"
            style={{ fill: parts.body || '#ffffff', transition: 'fill 0.3s' }}
          />
          {/* Sleeves */}
          <path
            id="sleeves"
            d="M150 150 L50 200 L100 250 L150 200 Z M350 150 L450 200 L400 250 L350 200 Z"
            style={{ fill: parts.sleeves || '#ffffff', transition: 'fill 0.3s' }}
          />
          {/* Collar */}
          <circle
            id="collar"
            cx="250" cy="125" r="40"
            style={{ fill: parts.collar || '#ffffff', stroke: '#333', strokeWidth: 2, transition: 'fill 0.3s' }}
          />
        </g>
      </svg>
    </div>
  );
};