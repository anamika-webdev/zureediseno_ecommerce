// src/components/store/CustomDesign/RunwayPreview.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shirt, Palette, Scissors } from 'lucide-react';

interface RunwayPreviewProps {
  selectedDesign?: string;
  selectedColors: string[];
  selectedFabric?: string;
  uploadedImage?: string | null;
}

// Design templates for the runway preview
const designTemplates = {
  'full-shirt': { name: 'Full Shirt', icon: '👔', color: '#4F46E5' },
  'half-shirt': { name: 'Half Shirt', icon: '👕', color: '#059669' },
  't-shirts': { name: 'T-Shirt', icon: '👕', color: '#DC2626' },
  'kurtas': { name: 'Kurta', icon: '🥻', color: '#D97706' },
  'pants': { name: 'Pants', icon: '👖', color: '#7C3AED' },
  'pajamas': { name: 'Pajamas', icon: '🩲', color: '#EC4899' },
  'blazers': { name: 'Blazer', icon: '🧥', color: '#1F2937' },
  'dresses': { name: 'Dress', icon: '👗', color: '#BE185D' },
  'shorts': { name: 'Shorts', icon: '🩳', color: '#0891B2' },
};

const fabricTextures = {
  'cotton-100': '100% Cotton',
  'linen': 'Linen',
  'cotton-poly': 'Cotton Poly',
  'polyester': 'Polyester',
  'giza-cotton': 'Giza Cotton',
  'poplin': 'Poplin',
  'oxford-cotton': 'Oxford Cotton',
  'rayon': 'Rayon',
  'satin': 'Satin',
  'silk': 'Silk',
  'denim': 'Denim',
  'nylon': 'Nylon',
  'dobby': 'Dobby',
  'georgette': 'Georgette',
};

export default function RunwayPreview({ selectedDesign, selectedColors, selectedFabric, uploadedImage }: RunwayPreviewProps) {
  const designInfo = selectedDesign ? designTemplates[selectedDesign as keyof typeof designTemplates] : null;
  const fabricName = selectedFabric ? fabricTextures[selectedFabric as keyof typeof fabricTextures] : null;

  return (
    <Card className="sticky top-8 h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shirt className="h-5 w-5" />
          Runway Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Preview Area */}
        <div className="aspect-[3/4] bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg relative overflow-hidden border-2 border-dashed border-gray-300">
          {selectedDesign ? (
            <>
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="w-full h-full" style={{
                  backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,.1) 10px, rgba(0,0,0,.1) 20px)`,
                }} />
              </div>
              
              {/* Design Display */}
              <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                {/* Design Icon/Shape */}
                <div className="text-6xl mb-4 filter drop-shadow-lg">
                  {designInfo?.icon}
                </div>
                
                {/* Design Name */}
                <div className="text-center mb-4">
                  <h3 className="font-bold text-lg text-gray-800">{designInfo?.name}</h3>
                  {fabricName && (
                    <p className="text-sm text-gray-600">{fabricName}</p>
                  )}
                </div>
                
                {/* Color Swatches */}
                {selectedColors.length > 0 && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                      <div className="flex justify-center gap-2 mb-2">
                        {selectedColors.slice(0, 4).map((color, index) => (
                          <div
                            key={index}
                            className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                        {selectedColors.length > 4 && (
                          <div className="w-8 h-8 rounded-full bg-gray-600 border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold">
                            +{selectedColors.length - 4}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-center text-gray-600">Selected Colors</p>
                    </div>
                  </div>
                )}
                
                {/* Fabric Texture Indicator */}
                {selectedFabric && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="text-xs">
                      {fabricName}
                    </Badge>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Empty State
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
              <Shirt className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-sm text-center">Select a design from the gallery to see preview</p>
            </div>
          )}
        </div>

        {/* Reference Image */}
        {uploadedImage && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Reference Image
            </h4>
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={uploadedImage}
                alt="Reference design"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Design Summary */}
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Scissors className="h-4 w-4" />
            Design Summary
          </h4>
          
          <div className="space-y-2 text-sm">
            {selectedDesign ? (
              <div className="flex justify-between">
                <span className="text-gray-600">Design Type:</span>
                <span className="font-medium">{designInfo?.name}</span>
              </div>
            ) : (
              <div className="text-gray-500 italic">No design selected</div>
            )}
            
            {selectedFabric && (
              <div className="flex justify-between">
                <span className="text-gray-600">Fabric:</span>
                <span className="font-medium">{fabricName}</span>
              </div>
            )}
            
            {selectedColors.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Colors:</span>
                <span className="font-medium">{selectedColors.length} selected</span>
              </div>
            )}
            
            {uploadedImage && (
              <div className="flex justify-between">
                <span className="text-gray-600">Reference:</span>
                <span className="font-medium text-green-600">✓ Uploaded</span>
              </div>
            )}
          </div>
        </div>

        {/* Design Progress Indicator */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Design Progress</h4>
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span>Design Type</span>
              <span className={selectedDesign ? 'text-green-600 font-medium' : 'text-gray-400'}>
                {selectedDesign ? '✓' : '○'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span>Fabric Selection</span>
              <span className={selectedFabric ? 'text-green-600 font-medium' : 'text-gray-400'}>
                {selectedFabric ? '✓' : '○'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span>Color Selection</span>
              <span className={selectedColors.length > 0 ? 'text-green-600 font-medium' : 'text-gray-400'}>
                {selectedColors.length > 0 ? '✓' : '○'}
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(
                  (selectedDesign ? 33 : 0) + 
                  (selectedFabric ? 33 : 0) + 
                  (selectedColors.length > 0 ? 34 : 0)
                )}%` 
              }}
            />
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="font-medium text-sm text-blue-800 mb-2">💡 Design Tips</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Select a design type to start your preview</li>
            <li>• Choose colors that complement each other</li>
            <li>• Upload a reference image for better results</li>
            <li>• Add measurements for a perfect fit</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}