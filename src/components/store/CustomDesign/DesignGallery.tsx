// src/components/store/CustomDesign/DesignGallery.tsx
'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface DesignGalleryProps {
  selectedDesign: string;
  onDesignSelect: (designId: string) => void;
  selectedColors?: string[];
}

const designCategories = {
  shirts: {
    name: 'Shirts',
    designs: [
      { id: 'full-shirt', name: 'Full Shirts', icon: '👔', description: 'Formal long-sleeve shirts' },
      { id: 'half-shirt', name: 'Half Shirts', icon: '👕', description: 'Short-sleeve casual shirts' },
    ]
  },
  casual: {
    name: 'Casual Wear',
    designs: [
      { id: 't-shirts', name: 'T-Shirts', icon: '👕', description: 'Comfortable cotton t-shirts' },
      { id: 'pajamas', name: 'Pajamas', icon: '🩲', description: 'Comfortable sleepwear' },
      { id: 'shorts', name: 'Shorts', icon: '🩳', description: 'Casual summer shorts' },
    ]
  },
  traditional: {
    name: 'Traditional',
    designs: [
      { id: 'kurtas', name: 'Kurtas', icon: '🥻', description: 'Traditional Indian wear' },
    ]
  },
  formal: {
    name: 'Formal Wear',
    designs: [
      { id: 'blazers', name: 'Blazers', icon: '🧥', description: 'Professional blazers' },
      { id: 'pants', name: 'Pants', icon: '👖', description: 'Formal trousers' },
    ]
  },
  women: {
    name: 'Women\'s Wear',
    designs: [
      { id: 'dresses', name: 'Dresses', icon: '👗', description: 'Elegant dresses' },
    ]
  }
};

// Design prototypes with customizable areas
const designPrototypes = {
  'full-shirt': {
    svg: (colors: string[]) => (
      <svg viewBox="0 0 200 250" className="w-full h-full">
        {/* Shirt Body */}
        <rect x="50" y="80" width="100" height="120" fill={colors[0] || '#E5E7EB'} stroke="#374151" strokeWidth="2"/>
        {/* Collar */}
        <polygon points="80,80 90,60 110,60 120,80" fill={colors[1] || colors[0] || '#E5E7EB'} stroke="#374151" strokeWidth="2"/>
        {/* Sleeves */}
        <rect x="20" y="80" width="30" height="80" fill={colors[0] || '#E5E7EB'} stroke="#374151" strokeWidth="2"/>
        <rect x="150" y="80" width="30" height="80" fill={colors[0] || '#E5E7EB'} stroke="#374151" strokeWidth="2"/>
        {/* Buttons */}
        <circle cx="100" cy="100" r="3" fill="#FFFFFF" stroke="#374151"/>
        <circle cx="100" cy="120" r="3" fill="#FFFFFF" stroke="#374151"/>
        <circle cx="100" cy="140" r="3" fill="#FFFFFF" stroke="#374151"/>
        {/* Pocket */}
        <rect x="70" y="110" width="20" height="15" fill="none" stroke="#374151" strokeWidth="1"/>
      </svg>
    )
  },
  'half-shirt': {
    svg: (colors: string[]) => (
      <svg viewBox="0 0 200 250" className="w-full h-full">
        {/* Shirt Body */}
        <rect x="50" y="80" width="100" height="120" fill={colors[0] || '#E5E7EB'} stroke="#374151" strokeWidth="2"/>
        {/* Collar */}
        <polygon points="80,80 90,60 110,60 120,80" fill={colors[1] || colors[0] || '#E5E7EB'} stroke="#374151" strokeWidth="2"/>
        {/* Short Sleeves */}
        <rect x="30" y="80" width="20" height="40" fill={colors[0] || '#E5E7EB'} stroke="#374151" strokeWidth="2"/>
        <rect x="150" y="80" width="20" height="40" fill={colors[0] || '#E5E7EB'} stroke="#374151" strokeWidth="2"/>
        {/* Buttons */}
        <circle cx="100" cy="100" r="3" fill="#FFFFFF" stroke="#374151"/>
        <circle cx="100" cy="120" r="3" fill="#FFFFFF" stroke="#374151"/>
        {/* Pocket */}
        <rect x="70" y="110" width="20" height="15" fill="none" stroke="#374151" strokeWidth="1"/>
      </svg>
    )
  },
  't-shirts': {
    svg: (colors: string[]) => (
      <svg viewBox="0 0 200 250" className="w-full h-full">
        {/* T-Shirt Body */}
        <rect x="50" y="80" width="100" height="120" fill={colors[0] || '#E5E7EB'} stroke="#374151" strokeWidth="2"/>
        {/* Neck */}
        <ellipse cx="100" cy="80" rx="15" ry="10" fill="none" stroke="#374151" strokeWidth="2"/>
        {/* Short Sleeves */}
        <rect x="30" y="80" width="20" height="50" fill={colors[0] || '#E5E7EB'} stroke="#374151" strokeWidth="2"/>
        <rect x="150" y="80" width="20" height="50" fill={colors[0] || '#E5E7EB'} stroke="#374151" strokeWidth="2"/>
        {/* Design Element */}
        {colors[1] && (
          <rect x="70" y="110" width="60" height="30" fill={colors[1]} opacity="0.7"/>
        )}
      </svg>
    )
  },
  'kurtas': {
    svg: (colors: string[]) => (
      <svg viewBox="0 0 200 280" className="w-full h-full">
        {/* Kurta Body */}
        <rect x="50" y="80" width="100" height="150" fill={colors[0] || '#E5E7EB'} stroke="#374151" strokeWidth="2"/>
        {/* Collar */}
        <polygon points="80,80 90,60 110,60 120,80" fill={colors[1] || colors[0] || '#E5E7EB'} stroke="#374151" strokeWidth="2"/>
        {/* Long Sleeves */}
        <rect x="20" y="80" width="30" height="100" fill={colors[0] || '#E5E7EB'} stroke="#374151" strokeWidth="2"/>
        <rect x="150" y="80" width="30" height="100" fill={colors[0] || '#E5E7EB'} stroke="#374151" strokeWidth="2"/>
        {/* Traditional Design */}
        <circle cx="100" cy="120" r="15" fill="none" stroke={colors[1] || '#374151'} strokeWidth="2"/>
        <line x1="100" y1="140" x2="100" y2="180" stroke={colors[1] || '#374151'} strokeWidth="2"/>
      </svg>
    )
  },
  'pants': {
    svg: (colors: string[]) => (
      <svg viewBox="0 0 200 300" className="w-full h-full">
        {/* Waistband */}
        <rect x="60" y="50" width="80" height="15" fill={colors[1] || '#374151'} stroke="#374151" strokeWidth="1"/>
        {/* Left Leg */}
        <rect x="60" y="65" width="35" height="180" fill={colors[0] || '#E5E7EB'} stroke="#374151" strokeWidth="2"/>
        {/* Right Leg */}
        <rect x="105" y="65" width="35" height="180" fill={colors[0] || '#E5E7EB'} stroke="#374151" strokeWidth="2"/>
        {/* Belt Loops */}
        <rect x="70" y="45" width="3" height="10" fill="#374151"/>
        <rect x="97" y="45" width="3" height="10" fill="#374151"/>
        <rect x="125" y="45" width="3" height="10" fill="#374151"/>
      </svg>
    )
  },
  'blazers': {
    svg: (colors: string[]) => (
      <svg viewBox="0 0 200 280" className="w-full h-full">
        {/* Blazer Body */}
        <rect x="45" y="80" width="110" height="140" fill={colors[0] || '#374151'} stroke="#000000" strokeWidth="2"/>
        {/* Lapels */}
        <polygon points="45,80 65,60 85,80" fill={colors[1] || colors[0] || '#374151'} stroke="#000000" strokeWidth="2"/>
        <polygon points="155,80 135,60 115,80" fill={colors[1] || colors[0] || '#374151'} stroke="#000000" strokeWidth="2"/>
        {/* Sleeves */}
        <rect x="15" y="80" width="30" height="100" fill={colors[0] || '#374151'} stroke="#000000" strokeWidth="2"/>
        <rect x="155" y="80" width="30" height="100" fill={colors[0] || '#374151'} stroke="#000000" strokeWidth="2"/>
        {/* Buttons */}
        <circle cx="85" cy="110" r="4" fill="#C0C0C0" stroke="#000000"/>
        <circle cx="85" cy="140" r="4" fill="#C0C0C0" stroke="#000000"/>
        {/* Pocket */}
        <rect x="115" y="110" width="25" height="20" fill="none" stroke="#000000" strokeWidth="1"/>
      </svg>
    )
  },
  'dresses': {
    svg: (colors: string[]) => (
      <svg viewBox="0 0 200 300" className="w-full h-full">
        {/* Dress Body */}
        <path d="M 60 80 L 140 80 L 150 250 L 50 250 Z" fill={colors[0] || '#E5E7EB'} stroke="#374151" strokeWidth="2"/>
        {/* Neckline */}
        <ellipse cx="100" cy="80" rx="20" ry="10" fill="none" stroke="#374151" strokeWidth="2"/>
        {/* Sleeves (optional) */}
        <ellipse cx="60" cy="90" rx="15" ry="25" fill={colors[0] || '#E5E7EB'} stroke="#374151" strokeWidth="2"/>
        <ellipse cx="140" cy="90" rx="15" ry="25" fill={colors[0] || '#E5E7EB'} stroke="#374151" strokeWidth="2"/>
        {/* Waist Detail */}
        {colors[1] && (
          <rect x="70" y="140" width="60" height="8" fill={colors[1]}/>
        )}
      </svg>
    )
  },
  'pajamas': {
    svg: (colors: string[]) => (
      <svg viewBox="0 0 200 280" className="w-full h-full">
        {/* Top */}
        <rect x="50" y="60" width="100" height="80" fill={colors[0] || '#E5E7EB'} stroke="#374151" strokeWidth="2"/>
        <rect x="30" y="60" width="20" height="60" fill={colors[0] || '#E5E7EB'} stroke="#374151" strokeWidth="2"/>
        <rect x="150" y="60" width="20" height="60" fill={colors[0] || '#E5E7EB'} stroke="#374151" strokeWidth="2"/>
        {/* Bottom */}
        <rect x="60" y="150" width="35" height="100" fill={colors[1] || colors[0] || '#E5E7EB'} stroke="#374151" strokeWidth="2"/>
        <rect x="105" y="150" width="35" height="100" fill={colors[1] || colors[0] || '#E5E7EB'} stroke="#374151" strokeWidth="2"/>
        {/* Comfort details */}
        <circle cx="100" cy="100" r="3" fill="#374151"/>
        <circle cx="100" cy="110" r="3" fill="#374151"/>
      </svg>
    )
  },
  'shorts': {
    svg: (colors: string[]) => (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Waistband */}
        <rect x="60" y="50" width="80" height="15" fill={colors[1] || '#374151'} stroke="#374151" strokeWidth="1"/>
        {/* Left Leg */}
        <rect x="60" y="65" width="35" height="80" fill={colors[0] || '#E5E7EB'} stroke="#374151" strokeWidth="2"/>
        {/* Right Leg */}
        <rect x="105" y="65" width="35" height="80" fill={colors[0] || '#E5E7EB'} stroke="#374151" strokeWidth="2"/>
        {/* Side Seams */}
        <line x1="60" y1="65" x2="60" y2="145" stroke="#374151" strokeWidth="1"/>
        <line x1="140" y1="65" x2="140" y2="145" stroke="#374151" strokeWidth="1"/>
      </svg>
    )
  }
};

export default function DesignGallery({ selectedDesign, onDesignSelect, selectedColors = [] }: DesignGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const allDesigns = Object.values(designCategories).flatMap(category => category.designs);
  const filteredDesigns = activeCategory === 'all' 
    ? allDesigns 
    : designCategories[activeCategory as keyof typeof designCategories]?.designs || [];

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={activeCategory === 'all' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setActiveCategory('all')}
        >
          All Designs
        </Badge>
        {Object.entries(designCategories).map(([key, category]) => (
          <Badge
            key={key}
            variant={activeCategory === key ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setActiveCategory(key)}
          >
            {category.name}
          </Badge>
        ))}
      </div>

      {/* Design Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredDesigns.map((design) => {
          const isSelected = selectedDesign === design.id;
          const prototype = designPrototypes[design.id as keyof typeof designPrototypes];
          
          return (
            <Card
              key={design.id}
              className={`cursor-pointer transition-all hover:scale-105 ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'
              }`}
              onClick={() => onDesignSelect(design.id)}
            >
              <CardContent className="p-4">
                {/* Design Preview */}
                <div className="aspect-square mb-3 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                  {prototype ? (
                    <div className="w-full h-full p-2">
                      {prototype.svg(selectedColors)}
                    </div>
                  ) : (
                    <div className="text-4xl">{design.icon}</div>
                  )}
                </div>
                
                {/* Design Info */}
                <div className="text-center">
                  <h3 className="font-medium text-sm mb-1">{design.name}</h3>
                  <p className="text-xs text-gray-500">{design.description}</p>
                </div>
                
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="mt-2 text-center">
                    <Badge variant="default" className="text-xs">Selected</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Design Info */}
      {selectedDesign && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {allDesigns.find(d => d.id === selectedDesign)?.icon}
            </div>
            <div>
              <h3 className="font-medium">{allDesigns.find(d => d.id === selectedDesign)?.name}</h3>
              <p className="text-sm text-gray-600">{allDesigns.find(d => d.id === selectedDesign)?.description}</p>
              {selectedColors.length > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  Colors will be applied to this design
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}