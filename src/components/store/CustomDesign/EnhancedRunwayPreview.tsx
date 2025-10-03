// src/components/store/CustomDesign/EnhancedRunwayPreview.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Shirt, X, Palette } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface EnhancedRunwayPreviewProps {
  selectedDesign?: string;
  selectedColors: string[];
  selectedFabric?: string;
  uploadedImage?: string;
  measurements?: Record<string, string>;
  onColorsChange?: (colors: string[]) => void;
}

const designTemplates = {
  'full-shirts': { name: 'Executive Shirt', imagePath: '/assets/img/Design gallery/FullShirt.png' },
  'half-shirts': { name: 'Casual Shirt', imagePath: '/assets/img/Design gallery/Half Shirt.png' },
  't-shirts': { name: 'Premium Tee', imagePath: '/assets/img/Design gallery/T-Shirt (2).png' },
  'kurtas': { name: 'Designer Kurta', imagePath: '/assets/img/Design gallery/Kurta.png' },
  'pants': { name: 'Tailored Pants', imagePath: '/assets/img/Design gallery/Pants.png' },
  'pajamas': { name: 'Comfort Pajamas', imagePath: '/assets/img/Design gallery/Pajamas.png' },
  'blazers': { name: 'Business Blazer', imagePath: '/assets/img/Design gallery/Blazer.png' },
  'dresses': { name: 'Elegant Dress', imagePath: '/assets/img/Design gallery/Dress.png' },
  'shorts': { name: 'Comfort Shorts', imagePath: '/assets/img/Design gallery/Shorts.png' },
};

const fabricOptions: Record<string, string> = {
  'cotton-100': '100% Cotton',
  'linen': 'Linen',
  'cotton-poly': 'Cotton Poly',
  'polyester': 'Polyester',
  'giza-cotton': 'Giza Cotton',
  'poplin': 'Poplin',
  'oxford-cotton': 'Oxford Cotton',
  'rayon': 'Rayon',
  'silk': 'Silk',
  'wool': 'Wool',
  'denim': 'Denim',
  'chambray': 'Chambray',
  'flannel': 'Flannel',
  'satin': 'Satin',
};

// Color palette for selection
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
    shades: ['#000000', '#1A1A1A', '#333333', '#4D4D4D', '#666666', '#808080', '#CCCCCC', '#FFFFFF']
  }
};

export default function EnhancedRunwayPreview({ 
  selectedDesign, 
  selectedColors, 
  selectedFabric, 
  uploadedImage,
  measurements = {},
  onColorsChange
}: EnhancedRunwayPreviewProps) {
  const [hoveredPalette, setHoveredPalette] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const designInfo = selectedDesign ? designTemplates[selectedDesign as keyof typeof designTemplates] : null;
  const fabricName = selectedFabric ? fabricOptions[selectedFabric] : null;
  const maxColors = 5;
  const canSelectMore = selectedColors.length < maxColors;

  const handleColorSelect = (color: string) => {
    if (canSelectMore && !selectedColors.includes(color)) {
      onColorsChange?.([...selectedColors, color]);
    }
  };

  const handleColorRemove = (color: string) => {
    onColorsChange?.(selectedColors.filter(c => c !== color));
  };

  const handleMouseEnter = (paletteName: string) => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    const timeout = setTimeout(() => {
      setHoveredPalette(paletteName);
    }, 300);
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setHoveredPalette(null);
  };

  return (
    <div className="space-y-4">
      {/* Main Preview Card */}
      <Card className="overflow-hidden bg-white border-gray-200 backdrop-blur-sm bg-white/90 border border-white/50 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <span className="text-gray-900">Runway Preview</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Main Preview Display */}
          <div className="relative h-80 bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center">
            {selectedDesign && designInfo ? (
              <div className="w-48 h-64 flex items-center justify-center relative">
                <div className="relative w-full h-full">
                  <Image
                    src={designInfo.imagePath}
                    alt={designInfo.name}
                    fill
                    className="object-contain"
                  />
                  {/* Color overlay */}
                  {selectedColors.length > 0 && (
                    <div 
                      className="absolute inset-0 mix-blend-multiply opacity-60"
                      style={{ backgroundColor: selectedColors[0] }}
                    />
                  )}
                </div>
                
                {/* Design Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 rounded-b">
                  <p className="text-sm font-medium text-center">{designInfo.name}</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <Shirt className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Select a design to preview</p>
                <p className="text-sm">Choose from the gallery to see your custom design</p>
              </div>
            )}
          </div>
          
          {/* Current Selection Info */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Design:</span>
                <span className="text-sm text-gray-900">{designInfo?.name || 'Not selected'}</span>
              </div>
              
              {fabricName && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Fabric:</span>
                  <span className="text-sm text-gray-900">{fabricName}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Colors:</span>
                <span className="text-sm text-gray-500">{selectedColors.length} / {maxColors}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Selection Card */}
      <Card className="overflow-hidden backdrop-blur-sm bg-white/90 border border-white/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-purple-500" />
              <span>🎨 Color Selection</span>
            </div>
            <Badge variant="secondary">
              {selectedColors.length} / {maxColors}
            </Badge>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Hover over colors to see shades, click to select
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Colors Display */}
          {selectedColors.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900 mb-2">Selected Colors:</p>
              <div className="flex flex-wrap gap-2">
                {selectedColors.map((color, index) => (
                  <div
                    key={index}
                    className="group relative flex items-center gap-2 bg-white px-3 py-2 rounded-lg border-2 shadow-sm hover:shadow-md transition-all"
                    style={{ borderColor: color }}
                  >
                    <div
                      className="w-6 h-6 rounded border-2 border-white shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs font-mono text-gray-600">{color}</span>
                    <button
                      onClick={() => handleColorRemove(color)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove color"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection Limit Notice */}
          {!canSelectMore && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-800">
                Maximum {maxColors} colors reached. Remove a color to add a different one.
              </p>
            </div>
          )}

          {/* Color Palette Grid */}
          <div className="grid grid-cols-5 gap-3">
            {Object.entries(colorPalettes).map(([key, palette]) => (
              <div
                key={key}
                className="relative"
                onMouseEnter={() => handleMouseEnter(key)}
                onMouseLeave={handleMouseLeave}
              >
                <div
                  className={`w-full aspect-square rounded-lg cursor-pointer transition-all ${
                    canSelectMore ? 'hover:scale-110 hover:shadow-lg' : 'opacity-50 cursor-not-allowed'
                  }`}
                  style={{ backgroundColor: palette.shades[0] }}
                  onClick={() => canSelectMore && handleColorSelect(palette.shades[0])}
                  title={palette.name}
                />
                <p className="text-xs text-center mt-1 text-gray-600">{palette.name}</p>
              </div>
            ))}
          </div>

          {/* Shade Selector - Appears on Hover */}
          {hoveredPalette && (
            <div className="bg-white border-2 border-blue-300 rounded-lg p-3 shadow-lg">
              <p className="text-sm font-semibold mb-2 text-gray-800">
                {colorPalettes[hoveredPalette as keyof typeof colorPalettes].name} Shades
              </p>
              <div className="grid grid-cols-8 gap-2">
                {colorPalettes[hoveredPalette as keyof typeof colorPalettes].shades.map((shade, idx) => (
                  <button
                    key={idx}
                    onClick={() => canSelectMore && handleColorSelect(shade)}
                    disabled={!canSelectMore}
                    className={`w-full aspect-square rounded border-2 transition-all ${
                      selectedColors.includes(shade)
                        ? 'border-green-500 ring-2 ring-green-200'
                        : 'border-gray-300'
                    } ${
                      canSelectMore ? 'hover:scale-110 hover:border-blue-400' : 'opacity-50 cursor-not-allowed'
                    }`}
                    style={{ backgroundColor: shade }}
                    title={shade}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quick Tips */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <h4 className="font-medium text-sm text-purple-800 mb-2">💡 Color Tips</h4>
            <ul className="text-xs text-purple-700 space-y-1">
              <li>• Hover over any color to see available shades</li>
              <li>• Click on a shade to add it to your design</li>
              <li>• Mix complementary colors for best results</li>
              <li>• First selected color appears as primary on preview</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}