// src/components/store/CustomDesign/MergedRunwayColorPreview.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Shirt, X, Palette, Plus, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface MergedRunwayColorPreviewProps {
  selectedDesign?: string;
  selectedColors: string[];
  selectedFabric?: string;
  uploadedImage?: string;
  measurements?: Record<string, string>;
  onColorsChange?: (colors: string[]) => void;
  onImageUpload?: (image: string) => void;
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

export default function MergedRunwayColorPreview({ 
  selectedDesign, 
  selectedColors = [], 
  selectedFabric, 
  uploadedImage,
  measurements = {},
  onColorsChange,
  onImageUpload
}: MergedRunwayColorPreviewProps) {
  const [hoveredPalette, setHoveredPalette] = useState<string | null>(null);
  const [customColor, setCustomColor] = useState<string>('#000000');

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

  const handleCustomColorAdd = () => {
    if (canSelectMore && !selectedColors.includes(customColor)) {
      onColorsChange?.([...selectedColors, customColor]);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload?.(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="overflow-hidden bg-white border-gray-200 backdrop-blur-sm bg-white/90 border border-white/50 shadow-xl h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          <span className="text-gray-900">Live Design Preview & Color Selection</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          See your design come to life as you select colors
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6 flex-1 overflow-y-auto">
        {/* Live Preview Display - FIXED HEIGHT */}
        <div className="relative bg-white rounded-lg flex items-center justify-center border-2 border-gray-300 overflow-hidden" style={{ height: '280px' }}>
          {selectedDesign && designInfo ? (
            <div className="relative w-full h-full flex items-center justify-center bg-white p-4">
              <div className="relative max-w-full max-h-full flex flex-col items-center justify-center">
                {/* PNG Image - Constrained to container */}
                <img
                  src={designInfo.imagePath}
                  alt={designInfo.name}
                  className="max-w-full max-h-[220px] w-auto h-auto object-contain"
                />
                
                {/* Design Name Label */}
                <div className="mt-2 bg-black bg-opacity-70 text-white px-4 py-2 rounded text-center">
                  <p className="text-sm font-medium">
                    {designInfo.name}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 p-6">
              <Shirt className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Select a design to preview</p>
              <p className="text-sm">Choose from the gallery and add colors</p>
            </div>
          )}

          {selectedColors.length > 0 && (
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 z-10">
              <p className="text-xs font-medium text-gray-600 mb-1">Live Colors</p>
              <div className="flex gap-1">
                {selectedColors.map((color, idx) => (
                  <div
                    key={idx}
                    className="w-5 h-5 rounded border-2 border-white shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Design Details Summary */}
        {selectedDesign && (
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Design:</span>
                <span className="text-gray-900">{designInfo?.name || 'Not selected'}</span>
              </div>
              
              {fabricName && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Fabric:</span>
                  <span className="text-gray-900">{fabricName}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Colors:</span>
                <span className="text-gray-500">{selectedColors.length} / {maxColors}</span>
              </div>

              {measurements && Object.keys(measurements).length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Measurements:</span>
                  <span className="text-gray-900">{Object.keys(measurements).length} provided</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t-2 border-gray-200 my-4"></div>

        {/* Color Selection Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold text-gray-900">Choose Your Colors</h3>
            </div>
            <Badge variant="secondary" className="text-sm">
              {selectedColors.length} / {maxColors}
            </Badge>
          </div>

          {/* Selected Colors Display */}
          {selectedColors.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900 mb-2">Selected Colors:</p>
              <div className="flex flex-wrap gap-2">
                {selectedColors.map((color, index) => (
                  <div
                    key={index}
                    className="group relative flex items-center gap-2 bg-white px-2 py-1.5 rounded-lg border-2 shadow-sm hover:shadow-md transition-all"
                    style={{ borderColor: color }}
                  >
                    <div
                      className="w-5 h-5 rounded border-2 border-white shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs font-mono text-gray-600">{color}</span>
                    <button
                      onClick={() => handleColorRemove(color)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove color"
                    >
                      <X className="h-3 w-3" />
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
                ⚠️ Maximum {maxColors} colors reached. Remove a color to add a different one.
              </p>
            </div>
          )}

          {/* Compact Color Palette Grid */}
          <div 
            className="space-y-4"
            onMouseLeave={() => setHoveredPalette(null)}
          >
            <div className="grid grid-cols-10 gap-1">
              {Object.entries(colorPalettes).map(([key, palette]) => (
                <div
                  key={key}
                  className="relative group"
                  onMouseEnter={() => setHoveredPalette(key)}
                >
                  <div
                    className={`w-full aspect-square rounded-sm cursor-pointer transition-all ${
                      canSelectMore ? 'hover:scale-110 hover:shadow-md' : 'opacity-50 cursor-not-allowed'
                    }`}
                    style={{ backgroundColor: palette.shades[0] }}
                    onClick={() => canSelectMore && handleColorSelect(palette.shades[0])}
                    title={palette.name}
                  />
                </div>
              ))}
            </div>

            {/* Shade Selector - Stays visible when hovering over it */}
            {hoveredPalette && (
              <div 
                className="bg-white border-2 border-blue-400 rounded-lg p-3 shadow-xl animate-in fade-in duration-200"
                onMouseEnter={() => setHoveredPalette(hoveredPalette)}
              >
                <p className="text-sm font-semibold mb-2 text-gray-800 text-center">
                  {colorPalettes[hoveredPalette as keyof typeof colorPalettes].name} Shades
                </p>
                <div className="grid grid-cols-8 gap-2">
                  {colorPalettes[hoveredPalette as keyof typeof colorPalettes].shades.map((shade, idx) => (
                    <button
                      key={idx}
                      onClick={() => canSelectMore && handleColorSelect(shade)}
                      disabled={!canSelectMore}
                      className={`w-10 h-10 rounded border-2 transition-all ${
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
          </div>

          {/* Custom Color Picker - New Minimalist Design */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-200">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-12 h-12 rounded-md border-2 border-white shadow-md cursor-pointer"
                title="Pick a custom color"
              />
              
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-xs font-mono focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  placeholder="#000000"
                  maxLength={7}
                />
                <Button
                  size="sm"
                  onClick={handleCustomColorAdd}
                  disabled={!canSelectMore || selectedColors.includes(customColor)}
                  className="bg-indigo-600 hover:bg-indigo-700 h-8 px-3 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Reference Image Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Reference Image (Optional)</Label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="reference-image-upload"
              />
              <label
                htmlFor="reference-image-upload"
                className="flex-1 cursor-pointer border-2 border-gray-300 rounded-lg p-3 hover:border-indigo-400 transition-colors bg-white"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <Upload className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Upload Design Reference</p>
                    <p className="text-xs text-gray-500">Click to choose image</p>
                  </div>
                </div>
              </label>
              
              {uploadedImage && (
                <div className="relative group">
                  <img 
                    src={uploadedImage} 
                    alt="Reference" 
                    className="w-20 h-20 object-cover rounded-lg border-2 border-indigo-300 shadow"
                  />
                  <button
                    onClick={() => onImageUpload?.('')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}