// src/components/store/CustomDesign/ModernDesignGallery.tsx
'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Star, TrendingUp } from 'lucide-react';

interface ModernDesignGalleryProps {
  selectedDesign: string;
  onDesignSelect: (designId: string) => void;
  selectedColors?: string[];
}

const designCategories = {
  trending: {
    name: 'Trending Now',
    icon: '🔥',
    designs: [
      { id: 'oversized-tee', name: 'Oversized Tee', icon: '👕', price: '₹1,299', popularity: 95, category: 'casual' },
      { id: 'blazer-modern', name: 'Modern Blazer', icon: '🧥', price: '₹3,499', popularity: 88, category: 'formal' },
      { id: 'crop-hoodie', name: 'Crop Hoodie', icon: '🧥', price: '₹1,899', popularity: 92, category: 'streetwear' },
    ]
  },
  formal: {
    name: 'Formal Collection',
    icon: '💼',
    designs: [
      { id: 'full-shirt', name: 'Executive Shirt', icon: '👔', price: '₹1,799', popularity: 85, category: 'formal' },
      { id: 'blazers', name: 'Business Blazer', icon: '🧥', price: '₹4,299', popularity: 80, category: 'formal' },
      { id: 'formal-pants', name: 'Tailored Pants', icon: '👖', price: '₹2,199', popularity: 78, category: 'formal' },
      { id: 'waistcoat', name: 'Classic Waistcoat', icon: '🦺', price: '₹2,799', popularity: 70, category: 'formal' },
    ]
  },
  casual: {
    name: 'Casual Wear',
    icon: '👕',
    designs: [
      { id: 't-shirts', name: 'Premium Tee', icon: '👕', price: '₹899', popularity: 90, category: 'casual' },
      { id: 'half-shirt', name: 'Casual Shirt', icon: '👕', price: '₹1,299', popularity: 82, category: 'casual' },
      { id: 'polo-shirt', name: 'Polo Shirt', icon: '👕', price: '₹1,199', popularity: 88, category: 'casual' },
      { id: 'shorts', name: 'Comfort Shorts', icon: '🩳', price: '₹799', popularity: 85, category: 'casual' },
    ]
  },
  traditional: {
    name: 'Traditional',
    icon: '🏺',
    designs: [
      { id: 'kurtas', name: 'Designer Kurta', icon: '🥻', price: '₹1,699', popularity: 75, category: 'traditional' },
      { id: 'nehru-jacket', name: 'Nehru Jacket', icon: '🧥', price: '₹2,299', popularity: 68, category: 'traditional' },
      { id: 'dhoti-pants', name: 'Dhoti Pants', icon: '👖', price: '₹1,399', popularity: 65, category: 'traditional' },
    ]
  },
  women: {
    name: 'Women\'s Collection',
    icon: '👗',
    designs: [
      { id: 'dresses', name: 'Elegant Dress', icon: '👗', price: '₹2,499', popularity: 87, category: 'women' },
      { id: 'blouse', name: 'Designer Blouse', icon: '👚', price: '₹1,599', popularity: 84, category: 'women' },
      { id: 'saree-blouse', name: 'Saree Blouse', icon: '👚', price: '₹1,899', popularity: 80, category: 'women' },
      { id: 'palazzo', name: 'Palazzo Pants', icon: '👖', price: '₹1,299', popularity: 78, category: 'women' },
    ]
  }
};

// Enhanced 3D SVG designs with better visual appeal
const enhanced3DDesigns = {
  'full-shirt': (colors: string[]) => (
    <div className="relative w-full h-full overflow-hidden">
      <svg viewBox="0 0 300 350" className="w-full h-full">
        <defs>
          <linearGradient id="shirtGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors[0] || '#3B82F6'} stopOpacity="1" />
            <stop offset="100%" stopColor={colors[0] ? `${colors[0]}80` : '#1D4ED8'} stopOpacity="0.8" />
          </linearGradient>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="4" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.3"/>
          </filter>
        </defs>
        
        {/* Shirt Shadow */}
        <ellipse cx="150" cy="320" rx="80" ry="15" fill="#000000" opacity="0.2"/>
        
        {/* Shirt Body */}
        <path d="M 80 120 L 220 120 L 215 280 L 85 280 Z" 
              fill="url(#shirtGradient)" 
              stroke="#1F2937" 
              strokeWidth="2" 
              filter="url(#shadow)"/>
        
        {/* Collar with 3D effect */}
        <path d="M 120 120 L 130 90 L 170 90 L 180 120" 
              fill={colors[1] || colors[0] || '#1F2937'} 
              stroke="#374151" 
              strokeWidth="2"/>
        
        {/* 3D Sleeves */}
        <ellipse cx="70" cy="140" rx="25" ry="60" 
                 fill="url(#shirtGradient)" 
                 stroke="#1F2937" 
                 strokeWidth="2" 
                 transform="rotate(-15 70 140)"/>
        <ellipse cx="230" cy="140" rx="25" ry="60" 
                 fill="url(#shirtGradient)" 
                 stroke="#1F2937" 
                 strokeWidth="2" 
                 transform="rotate(15 230 140)"/>
        
        {/* Buttons with shine effect */}
        <circle cx="150" cy="150" r="4" fill="#FFFFFF" stroke="#374151"/>
        <circle cx="150" cy="175" r="4" fill="#FFFFFF" stroke="#374151"/>
        <circle cx="150" cy="200" r="4" fill="#FFFFFF" stroke="#374151"/>
        <circle cx="150" cy="225" r="4" fill="#FFFFFF" stroke="#374151"/>
        
        {/* Pocket with depth */}
        <rect x="110" y="170" width="30" height="25" 
              fill="none" 
              stroke="#374151" 
              strokeWidth="1.5"/>
        <path d="M 110 172 L 140 172" stroke="#374151" strokeWidth="1"/>
        
        {/* Fabric texture overlay */}
        <pattern id="fabricTexture" patternUnits="userSpaceOnUse" width="4" height="4">
          <circle cx="2" cy="2" r="0.5" fill="#FFFFFF" opacity="0.1"/>
        </pattern>
        <rect x="80" y="120" width="140" height="160" fill="url(#fabricTexture)"/>
      </svg>
    </div>
  ),
  
  'blazers': (colors: string[]) => (
    <div className="relative w-full h-full overflow-hidden">
      <svg viewBox="0 0 300 400" className="w-full h-full">
        <defs>
          <linearGradient id="blazerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors[0] || '#1F2937'} stopOpacity="1" />
            <stop offset="100%" stopColor={colors[0] ? `${colors[0]}60` : '#111827'} stopOpacity="0.9" />
          </linearGradient>
          <filter id="blazerShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="6" dy="10" stdDeviation="8" floodColor="#000000" floodOpacity="0.4"/>
          </filter>
        </defs>
        
        {/* Shadow */}
        <ellipse cx="150" cy="380" rx="90" ry="18" fill="#000000" opacity="0.2"/>
        
        {/* Blazer Body */}
        <path d="M 70 140 L 230 140 L 225 320 L 75 320 Z" 
              fill="url(#blazerGradient)" 
              stroke="#000000" 
              strokeWidth="2.5" 
              filter="url(#blazerShadow)"/>
        
        {/* Lapels with 3D depth */}
        <path d="M 70 140 L 100 100 L 130 140" 
              fill={colors[1] || colors[0] || '#374151'} 
              stroke="#000000" 
              strokeWidth="2"/>
        <path d="M 230 140 L 200 100 L 170 140" 
              fill={colors[1] || colors[0] || '#374151'} 
              stroke="#000000" 
              strokeWidth="2"/>
        
        {/* Sleeves with dimension */}
        <ellipse cx="50" cy="160" rx="30" ry="80" 
                 fill="url(#blazerGradient)" 
                 stroke="#000000" 
                 strokeWidth="2" 
                 transform="rotate(-10 50 160)"/>
        <ellipse cx="250" cy="160" rx="30" ry="80" 
                 fill="url(#blazerGradient)" 
                 stroke="#000000" 
                 strokeWidth="2" 
                 transform="rotate(10 250 160)"/>
        
        {/* Premium buttons */}
        <circle cx="130" cy="180" r="5" fill="#C0C0C0" stroke="#000000" strokeWidth="1"/>
        <circle cx="130" cy="210" r="5" fill="#C0C0C0" stroke="#000000" strokeWidth="1"/>
        <circle cx="130" cy="240" r="5" fill="#C0C0C0" stroke="#000000" strokeWidth="1"/>
        
        {/* Chest pocket */}
        <rect x="170" y="170" width="35" height="30" 
              fill="none" 
              stroke="#000000" 
              strokeWidth="1.5"/>
        <path d="M 175 175 L 200 175" stroke="#000000" strokeWidth="1"/>
        
        {/* Luxury details */}
        <path d="M 120 300 L 180 300" stroke="#000000" strokeWidth="2"/>
      </svg>
    </div>
  ),
  
  'dresses': (colors: string[]) => (
    <div className="relative w-full h-full overflow-hidden">
      <svg viewBox="0 0 300 420" className="w-full h-full">
        <defs>
          <linearGradient id="dressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors[0] || '#EC4899'} stopOpacity="1" />
            <stop offset="50%" stopColor={colors[0] ? `${colors[0]}90` : '#DB2777'} stopOpacity="0.9" />
            <stop offset="100%" stopColor={colors[0] ? `${colors[0]}70` : '#BE185D'} stopOpacity="0.8" />
          </linearGradient>
          <filter id="dressShadow">
            <feDropShadow dx="4" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.3"/>
          </filter>
        </defs>
        
        {/* Shadow */}
        <ellipse cx="150" cy="400" rx="85" ry="16" fill="#000000" opacity="0.2"/>
        
        {/* Dress silhouette with flowing design */}
        <path d="M 90 120 L 210 120 Q 220 180 225 240 Q 230 300 240 360 L 60 360 Q 70 300 75 240 Q 80 180 90 120" 
              fill="url(#dressGradient)" 
              stroke="#374151" 
              strokeWidth="2" 
              filter="url(#dressShadow)"/>
        
        {/* Elegant neckline */}
        <path d="M 130 120 Q 150 105 170 120" 
              fill="none" 
              stroke="#374151" 
              strokeWidth="2"/>
        
        {/* Sleeves (optional cap sleeves) */}
        <ellipse cx="90" cy="130" rx="20" ry="35" 
                 fill="url(#dressGradient)" 
                 stroke="#374151" 
                 strokeWidth="2" 
                 transform="rotate(-20 90 130)"/>
        <ellipse cx="210" cy="130" rx="20" ry="35" 
                 fill="url(#dressGradient)" 
                 stroke="#374151" 
                 strokeWidth="2" 
                 transform="rotate(20 210 130)"/>
        
        {/* Waist detail */}
        {colors[1] && (
          <ellipse cx="150" cy="200" rx="70" ry="8" fill={colors[1]} opacity="0.8"/>
        )}
        
        {/* Flowing fabric details */}
        <path d="M 80 280 Q 100 275 120 280 Q 140 285 160 280 Q 180 275 200 280 Q 220 285 220 280" 
              fill="none" 
              stroke="#FFFFFF" 
              strokeWidth="1" 
              opacity="0.3"/>
        
        {/* Dress pattern */}
        <circle cx="130" cy="250" r="3" fill="#FFFFFF" opacity="0.4"/>
        <circle cx="170" cy="270" r="3" fill="#FFFFFF" opacity="0.4"/>
        <circle cx="110" cy="300" r="3" fill="#FFFFFF" opacity="0.4"/>
      </svg>
    </div>
  ),
  
  't-shirts': (colors: string[]) => (
    <div className="relative w-full h-full overflow-hidden">
      <svg viewBox="0 0 300 340" className="w-full h-full">
        <defs>
          <radialGradient id="tshirtGradient" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor={colors[0] || '#10B981'} stopOpacity="1" />
            <stop offset="100%" stopColor={colors[0] ? `${colors[0]}80` : '#059669'} stopOpacity="0.9" />
          </radialGradient>
          <filter id="tshirtShadow">
            <feDropShadow dx="3" dy="6" stdDeviation="4" floodColor="#000000" floodOpacity="0.25"/>
          </filter>
        </defs>
        
        {/* Shadow */}
        <ellipse cx="150" cy="320" rx="75" ry="12" fill="#000000" opacity="0.15"/>
        
        {/* T-shirt body */}
        <rect x="85" y="140" width="130" height="140" 
              rx="5" ry="5"
              fill="url(#tshirtGradient)" 
              stroke="#374151" 
              strokeWidth="2" 
              filter="url(#tshirtShadow)"/>
        
        {/* Crew neck */}
        <ellipse cx="150" cy="140" rx="25" ry="15" 
                 fill="none" 
                 stroke="#374151" 
                 strokeWidth="2"/>
        
        {/* Short sleeves */}
        <ellipse cx="70" cy="155" rx="18" ry="40" 
                 fill="url(#tshirtGradient)" 
                 stroke="#374151" 
                 strokeWidth="2"/>
        <ellipse cx="230" cy="155" rx="18" ry="40" 
                 fill="url(#tshirtGradient)" 
                 stroke="#374151" 
                 strokeWidth="2"/>
        
        {/* Design element area */}
        {colors[1] && (
          <rect x="110" y="180" width="80" height="40" 
                rx="8" ry="8"
                fill={colors[1]} 
                opacity="0.7"/>
        )}
        
        {/* Fabric seams */}
        <line x1="85" y1="140" x2="85" y2="280" 
              stroke="#FFFFFF" 
              strokeWidth="1" 
              opacity="0.3"/>
        <line x1="215" y1="140" x2="215" y2="280" 
              stroke="#FFFFFF" 
              strokeWidth="1" 
              opacity="0.3"/>
      </svg>
    </div>
  )
};

export default function ModernDesignGallery({ selectedDesign, onDesignSelect, selectedColors = [] }: ModernDesignGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<string>('trending');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleDesignSelect = (designId: string) => {
    onDesignSelect(designId);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            Design Gallery
          </h2>
          <p className="text-gray-600 text-sm mt-1">Choose from our premium collection</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grid View
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(designCategories).map(([key, category]) => (
          <Button
            key={key}
            variant={activeCategory === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(key)}
            className="flex items-center gap-2"
          >
            <span>{category.icon}</span>
            {category.name}
          </Button>
        ))}
      </div>

      {/* Design Grid */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
      }`}>
        {designCategories[activeCategory as keyof typeof designCategories]?.designs.map((design) => {
          const isSelected = selectedDesign === design.id;
          const enhancedDesign = enhanced3DDesigns[design.id as keyof typeof enhanced3DDesigns];
          
          return (
            <Card
              key={design.id}
              className={`group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                isSelected 
                  ? 'ring-4 ring-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl' 
                  : 'hover:shadow-lg'
              } ${viewMode === 'list' ? 'flex-row' : ''}`}
              onClick={() => handleDesignSelect(design.id)}
            >
              <CardContent className={`p-0 ${viewMode === 'list' ? 'flex' : ''}`}>
                {/* Design Preview */}
                <div className={`relative overflow-hidden ${
                  viewMode === 'list' ? 'w-32 h-32' : 'aspect-square'
                } bg-gradient-to-br from-gray-50 to-gray-100 ${
                  viewMode === 'list' ? '' : 'rounded-t-lg'
                }`}>
                  {enhancedDesign ? (
                    <div className="w-full h-full p-4 flex items-center justify-center">
                      {enhancedDesign(selectedColors)}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-6xl transform group-hover:scale-110 transition-transform duration-300">
                        {design.icon}
                      </div>
                    </div>
                  )}
                  
                  {/* Popularity Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {design.popularity}%
                    </Badge>
                  </div>
                  
                  {/* Trending Indicator */}
                  {design.popularity > 90 && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-red-500 text-white text-xs flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Hot
                      </Badge>
                    </div>
                  )}
                </div>
                
                {/* Design Info */}
                <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">
                      {design.name}
                    </h3>
                    <span className="text-lg font-bold text-green-600">
                      {design.price}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {design.category}
                    </Badge>
                    
                    {isSelected && (
                      <Badge className="bg-blue-500 text-white text-xs">
                        ✓ Selected
                      </Badge>
                    )}
                  </div>
                  
                  {/* Color Preview */}
                  {selectedColors.length > 0 && isSelected && (
                    <div className="mt-3 flex gap-1">
                      {selectedColors.slice(0, 4).map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      {selectedColors.length > 4 && (
                        <div className="w-4 h-4 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center">
                          +{selectedColors.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Design Summary */}
      {selectedDesign && (
        <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-md">
                <span className="text-2xl">
                  {Object.values(designCategories)
                    .flatMap(cat => cat.designs)
                    .find(d => d.id === selectedDesign)?.icon}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl text-gray-900">
                  {Object.values(designCategories)
                    .flatMap(cat => cat.designs)
                    .find(d => d.id === selectedDesign)?.name} Selected
                </h3>
                <p className="text-gray-600">
                  Ready for customization • {selectedColors.length} colors applied
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-green-500 text-white">
                    ✓ Design Locked
                  </Badge>
                  <span className="text-green-600 font-semibold">
                    {Object.values(designCategories)
                      .flatMap(cat => cat.designs)
                      .find(d => d.id === selectedDesign)?.price}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}