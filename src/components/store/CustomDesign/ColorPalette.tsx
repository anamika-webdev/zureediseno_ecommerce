// src/components/store/CustomDesign/ColorPalette.tsx
'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ColorPaletteProps {
  selectedColors: string[];
  onColorSelect: (color: string) => void;
  onColorRemove: (color: string) => void;
  maxColors?: number;
}

const colorPalettes = {
  red: {
    name: 'Red',
    shades: ['#FF0000', '#FF3333', '#FF6666', '#FF9999', '#FFCCCC', '#CC0000', '#990000', '#660000']
  },
  blue: {
    name: 'Blue', 
    shades: ['#0000FF', '#3333FF', '#6666FF', '#9999FF', '#CCCCFF', '#0000CC', '#000099', '#000066']
  },
  green: {
    name: 'Green',
    shades: ['#00FF00', '#33FF33', '#66FF66', '#99FF99', '#CCFFCC', '#00CC00', '#009900', '#006600']
  },
  yellow: {
    name: 'Yellow',
    shades: ['#FFFF00', '#FFFF33', '#FFFF66', '#FFFF99', '#FFFFCC', '#CCCC00', '#999900', '#666600']
  },
  purple: {
    name: 'Purple',
    shades: ['#9900FF', '#AA33FF', '#BB66FF', '#CC99FF', '#DDCCFF', '#7700CC', '#550099', '#330066']
  },
  orange: {
    name: 'Orange',
    shades: ['#FF6600', '#FF7733', '#FF8866', '#FF9999', '#FFCCCC', '#CC5500', '#994400', '#663300']
  },
  pink: {
    name: 'Pink',
    shades: ['#FF0099', '#FF33AA', '#FF66BB', '#FF99CC', '#FFCCDD', '#CC0077', '#990055', '#660033']
  },
  brown: {
    name: 'Brown',
    shades: ['#8B4513', '#A0522D', '#CD853F', '#D2B48C', '#F5DEB3', '#654321', '#8B4513', '#A0522D']
  },
  gray: {
    name: 'Gray',
    shades: ['#808080', '#999999', '#AAAAAA', '#BBBBBB', '#CCCCCC', '#666666', '#555555', '#444444']
  },
  black: {
    name: 'Black & White',
    shades: ['#000000', '#1A1A1A', '#333333', '#4D4D4D', '#666666', '#808080', '#999999', '#FFFFFF']
  }
};

export default function ColorPalette({ selectedColors, onColorSelect, onColorRemove, maxColors = 5 }: ColorPaletteProps) {
  const [hoveredPalette, setHoveredPalette] = useState<string | null>(null);

  const canSelectMore = selectedColors.length < maxColors;

  return (
    <div className="space-y-6">
      {/* Popular Colors */}
      <div>
        <h3 className="font-medium mb-3">Popular Colors</h3>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
          {Object.entries(colorPalettes).map(([paletteKey, palette]) => (
            <div key={paletteKey} className="relative">
              <button
                className="w-12 h-12 rounded-lg border-2 border-gray-300 hover:scale-110 transition-all duration-200 shadow-sm"
                style={{ backgroundColor: palette.shades[0] }}
                onMouseEnter={() => setHoveredPalette(paletteKey)}
                onMouseLeave={() => setHoveredPalette(null)}
                onClick={() => canSelectMore && onColorSelect(palette.shades[0])}
                disabled={!canSelectMore && !selectedColors.includes(palette.shades[0])}
                title={palette.name}
              />
              
              {/* Color Shades Tooltip */}
              {hoveredPalette === paletteKey && (
                <div className="absolute top-14 left-1/2 transform -translate-x-1/2 z-20 bg-white p-4 rounded-lg shadow-xl border-2 border-gray-200">
                  <div className="text-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{palette.name} Shades</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 min-w-[140px]">
                    {palette.shades.map((shade, index) => (
                      <button
                        key={index}
                        className="w-8 h-8 rounded border-2 border-gray-200 hover:scale-110 transition-transform duration-150 shadow-sm"
                        style={{ backgroundColor: shade }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (canSelectMore || selectedColors.includes(shade)) {
                            onColorSelect(shade);
                          }
                        }}
                        disabled={!canSelectMore && !selectedColors.includes(shade)}
                        title={shade}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 text-center mt-2">
                    Click any shade to select
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Colors Display */}
      {selectedColors.length > 0 && (
        <div>
          <h3 className="font-medium mb-3">Selected Colors ({selectedColors.length}/{maxColors})</h3>
          <div className="flex flex-wrap gap-2">
            {selectedColors.map((color, index) => (
              <Badge
                key={index}
                variant="outline"
                className="flex items-center gap-2 pl-1 pr-2 py-1"
              >
                <div
                  className="w-5 h-5 rounded-full border border-gray-300"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs font-mono">{color}</span>
                <button
                  onClick={() => onColorRemove(color)}
                  className="ml-1 hover:text-red-500 transition-colors"
                  aria-label="Remove color"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          {selectedColors.length >= maxColors && (
            <p className="text-sm text-orange-600 mt-2">
              Maximum {maxColors} colors selected. Remove a color to add another.
            </p>
          )}
        </div>
      )}

      {/* Custom Color Picker */}
      <div>
        <h3 className="font-medium mb-3">Custom Color</h3>
        <div className="flex items-center gap-3">
          <input
            type="color"
            className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
            onChange={(e) => canSelectMore && onColorSelect(e.target.value.toUpperCase())}
            disabled={!canSelectMore}
          />
          <span className="text-sm text-gray-600">
            {canSelectMore ? 'Click to pick a custom color' : 'Remove a color to add custom color'}
          </span>
        </div>
      </div>
    </div>
  );
}