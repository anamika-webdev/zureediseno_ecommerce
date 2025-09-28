import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Shirt } from 'lucide-react';
import Image from 'next/image';

interface Enhanced3DRunwayPreviewProps {
  selectedDesign?: string;
  selectedColors: string[];
  selectedFabric?: string;
  uploadedImage?: string | null;
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

export default function Enhanced3DRunwayPreview({ 
  selectedDesign, 
  selectedColors, 
  selectedFabric, 
  uploadedImage,
  measurements = {},
  onColorsChange
}: Enhanced3DRunwayPreviewProps) {
  const designInfo = selectedDesign ? designTemplates[selectedDesign as keyof typeof designTemplates] : null;

  return (
    <div className="space-y-4">
      {/* Main Preview Card */}
      <Card className="overflow-hidden bg-white border-gray-200">
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
                  <div 
                    className="absolute inset-0 mix-blend-multiply opacity-60"
                    style={{ backgroundColor: selectedColors[0] || '#E5E7EB' }}
                  />
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
          {selectedDesign && (
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Design:</span>
                  <span className="text-sm text-gray-900">{designInfo?.name}</span>
                </div>
                
                {selectedFabric && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Fabric:</span>
                    <span className="text-sm text-gray-900">{selectedFabric}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Colors:</span>
                  <div className="flex gap-1">
                    {selectedColors.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}