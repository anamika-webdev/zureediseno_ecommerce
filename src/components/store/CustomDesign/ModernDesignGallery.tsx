import React, { useState, useEffect } from 'react';
import { Palette, Sparkles, RotateCcw, Shirt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

// Define types for the component
interface GarmentType {
  name: string;
  description: string;
  imagePath: string;
  icon: React.ReactNode;
  template: React.ReactNode;
}

interface ModernDesignGalleryProps {
  selectedDesign: string;
  onDesignSelect: (designId: string) => void;
  selectedColors: string[];
}

const ModernDesignGallery: React.FC<ModernDesignGalleryProps> = ({
  selectedDesign,
  onDesignSelect,
  selectedColors
}) => {
  const [activeCategory, setActiveCategory] = useState('All Designs');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [previewColors, setPreviewColors] = useState<string[]>(selectedColors);
  const [activeColorIndex, setActiveColorIndex] = useState(0);

  // Sync preview colors with selected colors
  useEffect(() => {
    setPreviewColors(selectedColors);
  }, [selectedColors]);

  const categories = [
    'All Designs', 'Shirts', 'Casual Wear', 'Traditional', 'Formal Wear', "Women's Wear"
  ];

  // Color palette for quick selection
  const colorPalette = [
    '#000000', '#FFFFFF', '#808080', '#C0C0C0',
    '#000080', '#0000FF', '#4169E1', '#87CEEB',
    '#8B0000', '#FF0000', '#DC143C', '#FF69B4',
    '#006400', '#008000', '#32CD32', '#90EE90',
    '#FFD700', '#FFFF00', '#FFA500', '#FF8C00',
    '#4B0082', '#800080', '#9932CC', '#BA55D3',
    '#8B4513', '#A0522D', '#D2691E', '#F4A460',
    '#2F4F4F', '#708090', '#BC8F8F', '#F0E68C'
  ];

  // Design templates mapping
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

  const garmentTypes: GarmentType[] = [
    {
      name: 'Full Shirts',
      description: 'Formal long-sleeve shirts',
      imagePath: '/assets/img/Design gallery/FullShirt.png',
      icon: (
        <div className="w-16 h-16 relative">
          <Image
            src="/assets/img/Design gallery/FullShirt.png"
            alt="Full Shirt"
            fill
            className="object-contain"
          />
        </div>
      ),
      template: (
        <div className="w-full h-full relative">
          <Image
            src="/assets/img/Design gallery/FullShirt.png"
            alt="Full Shirt Template"
            fill
            className="object-contain"
          />
        </div>
      )
    },
    {
      name: 'Half Shirts', 
      description: 'Short-sleeve casual shirts',
      imagePath: '/assets/img/Design gallery/Half Shirt.png',
      icon: (
        <div className="w-16 h-16 relative">
          <Image
            src="/assets/img/Design gallery/Half Shirt.png"
            alt="Half Shirt"
            fill
            className="object-contain"
          />
        </div>
      ),
      template: (
        <div className="w-full h-full relative">
          <Image
            src="/assets/img/Design gallery/Half Shirt.png"
            alt="Half Shirt Template"
            fill
            className="object-contain"
          />
        </div>
      )
    },
    {
      name: 'Shorts',
      description: 'Comfortable shorts',
      imagePath: '/assets/img/Design gallery/Shorts.png',
      icon: (
        <div className="w-16 h-16 relative">
          <Image
            src="/assets/img/Design gallery/Shorts.png"
            alt="Shorts"
            fill
            className="object-contain"
          />
        </div>
      ),
      template: (
        <div className="w-full h-full relative">
          <Image
            src="/assets/img/Design gallery/Shorts.png"
            alt="Shorts Template"
            fill
            className="object-contain"
          />
        </div>
      )
    },
    {
      name: 'Blazers',
      description: 'Professional blazers',
      imagePath: '/assets/img/Design gallery/Blazer.png',
      icon: (
        <div className="w-16 h-16 relative">
          <Image
            src="/assets/img/Design gallery/Blazer.png"
            alt="Blazer"
            fill
            className="object-contain"
          />
        </div>
      ),
      template: (
        <div className="w-full h-full relative">
          <Image
            src="/assets/img/Design gallery/Blazer.png"
            alt="Blazer Template"
            fill
            className="object-contain"
          />
        </div>
      )
    },
    {
      name: 'Pants',
      description: 'Formal trousers',
      imagePath: '/assets/img/Design gallery/Pants.png',
      icon: (
        <div className="w-16 h-16 relative">
          <Image
            src="/assets/img/Design gallery/Pants.png"
            alt="Pants"
            fill
            className="object-contain"
          />
        </div>
      ),
      template: (
        <div className="w-full h-full relative">
          <Image
            src="/assets/img/Design gallery/Pants.png"
            alt="Pants Template"
            fill
            className="object-contain"
          />
        </div>
      )
    },
    {
      name: 'Dresses',
      description: 'Elegant dresses',
      imagePath: '/assets/img/Design gallery/Dress.png',
      icon: (
        <div className="w-16 h-16 relative">
          <Image
            src="/assets/img/Design gallery/Dress.png"
            alt="Dress"
            fill
            className="object-contain"
          />
        </div>
      ),
      template: (
        <div className="w-full h-full relative">
          <Image
            src="/assets/img/Design gallery/Dress.png"
            alt="Dress Template"
            fill
            className="object-contain"
          />
        </div>
      )
    },
    {
      name: 'T-Shirts',
      description: 'Comfortable cotton t-shirts',
      imagePath: '/assets/img/Design gallery/T-Shirt (2).png',
      icon: (
        <div className="w-16 h-16 relative">
          <Image
            src="/assets/img/Design gallery/T-Shirt (2).png"
            alt="T-Shirt"
            fill
            className="object-contain"
          />
        </div>
      ),
      template: (
        <div className="w-full h-full relative">
          <Image
            src="/assets/img/Design gallery/T-Shirt (2).png"
            alt="T-Shirt Template"
            fill
            className="object-contain"
          />
        </div>
      )
    },
    {
      name: 'Kurtas',
      description: 'Traditional Indian wear',
      imagePath: '/assets/img/Design gallery/Kurta.png',
      icon: (
        <div className="w-16 h-16 relative">
          <Image
            src="/assets/img/Design gallery/Kurta.png"
            alt="Kurta"
            fill
            className="object-contain"
          />
        </div>
      ),
      template: (
        <div className="w-full h-full relative">
          <Image
            src="/assets/img/Design gallery/Kurta.png"
            alt="Kurta Template"
            fill
            className="object-contain"
          />
        </div>
      )
    },
    {
      name: 'Pajamas',
      description: 'Comfortable sleepwear',
      imagePath: '/assets/img/Design gallery/Pajamas.png',
      icon: (
        <div className="w-16 h-16 relative">
          <Image
            src="/assets/img/Design gallery/Pajamas.png"
            alt="Pajamas"
            fill
            className="object-contain"
          />
        </div>
      ),
      template: (
        <div className="w-full h-full relative">
          <Image
            src="/assets/img/Design gallery/Pajamas.png"
            alt="Pajamas Template"
            fill
            className="object-contain"
          />
        </div>
      )
    }
  ];

  const handleColorSelect = (color: string) => {
    const newColors = [...previewColors];
    newColors[activeColorIndex] = color;
    setPreviewColors(newColors);
  };

  const addColorSlot = () => {
    if (previewColors.length < 3) {
      setPreviewColors([...previewColors, '#E5E7EB']);
      setActiveColorIndex(previewColors.length);
    }
  };

  const removeColorSlot = (index: number) => {
    if (previewColors.length > 1) {
      const newColors = previewColors.filter((_, i) => i !== index);
      setPreviewColors(newColors);
      setActiveColorIndex(Math.max(0, activeColorIndex - 1));
    }
  };

  const handleGarmentClick = (garment: GarmentType) => {
    // Convert garment name to design ID format that matches your existing system
    const designId = garment.name.toLowerCase().replace(/\s+/g, '-');
    onDesignSelect(designId);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Design Gallery */}
      <div>
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-5 h-5 text-orange-500" />
            <h1 className="text-lg font-semibold text-gray-800">Design Gallery</h1>
          </div>
          <p className="text-gray-600 text-sm">Choose your garment type to start designing</p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Garment Grid */}
        <div className="grid grid-cols-3 gap-4">
          {garmentTypes.map((item, index) => {
            const designId = item.name.toLowerCase().replace(/\s+/g, '-');
            const isSelected = selectedDesign === designId;
            
            return (
              <div
                key={index}
                onClick={() => handleGarmentClick(item)}
                className={`bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 cursor-pointer transition-all group border-2 ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-transparent'
                }`}
              >
                <div className="mb-3 flex justify-center">
                  {item.icon}
                </div>
                <h3 className="font-medium text-gray-800 mb-1">{item.name}</h3>
                <p className="text-xs text-gray-600">{item.description}</p>
              </div>
            );
          })}
        </div>

        {/* Selected Design Info */}
        {selectedDesign && (
          <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 relative">
                {garmentTypes.find(g => g.name.toLowerCase().replace(/\s+/g, '-') === selectedDesign)?.icon}
              </div>
              <div>
                <h3 className="font-medium">
                  {garmentTypes.find(g => g.name.toLowerCase().replace(/\s+/g, '-') === selectedDesign)?.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {garmentTypes.find(g => g.name.toLowerCase().replace(/\s+/g, '-') === selectedDesign)?.description}
                </p>
                {selectedColors.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-xs text-orange-600">Selected colors:</p>
                    <div className="flex gap-1">
                      {selectedColors.slice(0, 3).map((color, idx) => (
                        <div
                          key={idx}
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      {selectedColors.length > 3 && (
                        <span className="text-xs text-gray-500">+{selectedColors.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right: Runway Preview */}
      <div>
        <Card className="overflow-hidden bg-white border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                <span className="text-gray-900">Runway Preview</span>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-600 hover:bg-gray-100"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  disabled={!selectedDesign}
                >
                  <Palette className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            {/* Color Picker Panel */}
            {showColorPicker && selectedDesign && (
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">Try Different Colors</h3>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setPreviewColors([...selectedColors])}>
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Color Slots */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {previewColors.map((color, index) => (
                      <div key={index} className="relative group">
                        <button
                          className={`w-10 h-10 rounded-lg border-2 transition-all ${
                            activeColorIndex === index 
                              ? 'border-blue-500 scale-110 shadow-lg' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setActiveColorIndex(index)}
                        />
                        <div className="absolute -top-2 -right-2">
                          <Badge variant="secondary" className="text-xs px-1 h-5">
                            {index + 1}
                          </Badge>
                        </div>
                        {previewColors.length > 1 && (
                          <button
                            className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            onClick={() => removeColorSlot(index)}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    
                    {previewColors.length < 3 && (
                      <button
                        className="w-10 h-10 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all"
                        onClick={addColorSlot}
                      >
                        +
                      </button>
                    )}
                  </div>
                  
                  {/* Color Palette */}
                  <div className="grid grid-cols-8 gap-2">
                    {colorPalette.map((color, index) => (
                      <button
                        key={index}
                        className="w-6 h-6 rounded border border-gray-200 hover:border-gray-400 transition-all hover:scale-110"
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorSelect(color)}
                      />
                    ))}
                  </div>
                  
                  {/* Custom Color */}
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={previewColors[activeColorIndex] || '#E5E7EB'}
                      onChange={(e) => handleColorSelect(e.target.value)}
                      className="w-10 h-8 rounded border border-gray-300"
                    />
                    <span className="text-sm text-gray-600">Custom Color</span>
                  </div>
                </div>
              </div>
            )}

            {/* Main Preview Display */}
            <div className="relative h-80 bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center">
              {selectedDesign && designTemplates[selectedDesign as keyof typeof designTemplates] ? (
                <div className="w-48 h-64 flex items-center justify-center relative">
                  <div className="relative w-full h-full">
                    <Image
                      src={designTemplates[selectedDesign as keyof typeof designTemplates].imagePath}
                      alt={designTemplates[selectedDesign as keyof typeof designTemplates].name}
                      fill
                      className="object-contain"
                    />
                    {/* Color overlay */}
                    <div 
                      className="absolute inset-0 mix-blend-multiply opacity-60"
                      style={{ backgroundColor: previewColors[0] || '#E5E7EB' }}
                    />
                  </div>
                  
                  {/* Design Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 rounded-b">
                    <p className="text-sm font-medium text-center">
                      {designTemplates[selectedDesign as keyof typeof designTemplates].name}
                    </p>
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
                    <span className="text-sm text-gray-900">
                      {designTemplates[selectedDesign as keyof typeof designTemplates]?.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Colors:</span>
                    <div className="flex gap-1">
                      {previewColors.map((color, idx) => (
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
    </div>
  );
};

export default ModernDesignGallery;