// src/components/store/CustomDesign/Enhanced3DRunwayPreview.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shirt, 
  Palette, 
  Scissors, 
  RotateCcw, 
  Save,
  Undo,
  Sparkles
} from 'lucide-react';

interface Enhanced3DRunwayPreviewProps {
  selectedDesign?: string;
  selectedColors: string[];
  selectedFabric?: string;
  uploadedImage?: string | null;
  measurements?: Record<string, string>;
  onColorsChange?: (colors: string[]) => void;
}

const designTemplates = {
  'full-shirt': { name: 'Executive Shirt', basePrice: 1799 },
  'half-shirt': { name: 'Casual Shirt', basePrice: 1299 },
  't-shirts': { name: 'Premium Tee', basePrice: 899 },
  'kurtas': { name: 'Designer Kurta', basePrice: 1699 },
  'formal-pants': { name: 'Tailored Pants', basePrice: 2199 },
  'pajamas': { name: 'Comfort Pajamas', basePrice: 1199 },
  'blazers': { name: 'Business Blazer', basePrice: 4299 },
  'dresses': { name: 'Elegant Dress', basePrice: 2499 },
  'shorts': { name: 'Comfort Shorts', basePrice: 799 },
  'oversized-tee': { name: 'Oversized Tee', basePrice: 1299 },
  'blazer-modern': { name: 'Modern Blazer', basePrice: 3499 },
  'crop-hoodie': { name: 'Crop Hoodie', basePrice: 1899 },
  'polo-shirt': { name: 'Polo Shirt', basePrice: 1199 },
  'nehru-jacket': { name: 'Nehru Jacket', basePrice: 2299 },
  'dhoti-pants': { name: 'Dhoti Pants', basePrice: 1399 },
  'blouse': { name: 'Designer Blouse', basePrice: 1599 },
  'saree-blouse': { name: 'Saree Blouse', basePrice: 1899 },
  'palazzo': { name: 'Palazzo Pants', basePrice: 1299 },
  'waistcoat': { name: 'Classic Waistcoat', basePrice: 2799 },
};

const fabricPricing = {
  'cotton-100': 0,
  'linen': 200,
  'cotton-poly': 100,
  'polyester': 150,
  'giza-cotton': 500,
  'poplin': 300,
  'oxford-cotton': 250,
  'rayon': 200,
  'satin': 400,
  'silk': 800,
  'denim': 300,
  'nylon': 180,
  'dobby': 350,
  'georgette': 450,
};

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

// Simple, clean garment cutouts
const SimpleGarmentCutouts = {
  'full-shirt': ({ colors }: { colors: string[] }) => {
    const mainColor = colors[0] || '#E5E7EB';
    const collarColor = colors[1] || mainColor;
    const buttonColor = colors[2] || '#FFFFFF';
    
    return (
      <svg viewBox="0 0 200 250" className="w-full h-full">
        {/* Main shirt body */}
        <rect x="50" y="80" width="100" height="120" 
              fill={mainColor} 
              stroke="#374151" 
              strokeWidth="1.5"/>
        
        {/* Collar */}
        <path d="M 80 80 L 90 60 L 110 60 L 120 80" 
              fill={collarColor} 
              stroke="#374151" 
              strokeWidth="1"/>
        
        {/* Long sleeves */}
        <rect x="30" y="80" width="20" height="80" 
              fill={mainColor} 
              stroke="#374151" 
              strokeWidth="1"/>
        <rect x="150" y="80" width="20" height="80" 
              fill={mainColor} 
              stroke="#374151" 
              strokeWidth="1"/>
        
        {/* Buttons */}
        {[90, 110, 130, 150, 170].map(y => (
          <circle key={y} cx="100" cy={y} r="2" 
                  fill={buttonColor} 
                  stroke="#374151" 
                  strokeWidth="0.5"/>
        ))}
        
        {/* Pocket */}
        <rect x="85" y="110" width="15" height="12" 
              fill="none" 
              stroke="#374151" 
              strokeWidth="0.5"/>
      </svg>
    );
  },

  'half-shirt': ({ colors }: { colors: string[] }) => {
    const mainColor = colors[0] || '#E5E7EB';
    const collarColor = colors[1] || mainColor;
    
    return (
      <svg viewBox="0 0 200 220" className="w-full h-full">
        {/* Main shirt body */}
        <rect x="55" y="80" width="90" height="100" 
              fill={mainColor} 
              stroke="#374151" 
              strokeWidth="1.5"/>
        
        {/* Collar */}
        <path d="M 80 80 L 85 65 Q 100 60 115 65 L 120 80" 
              fill={collarColor} 
              stroke="#374151" 
              strokeWidth="1"/>
        
        {/* Short sleeves */}
        <ellipse cx="45" cy="90" rx="12" ry="25" 
                 fill={mainColor} 
                 stroke="#374151" 
                 strokeWidth="1"/>
        <ellipse cx="155" cy="90" rx="12" ry="25" 
                 fill={mainColor} 
                 stroke="#374151" 
                 strokeWidth="1"/>
        
        {/* Buttons */}
        {[95, 115, 135, 155].map(y => (
          <circle key={y} cx="100" cy={y} r="2" 
                  fill="#FFFFFF" 
                  stroke="#374151" 
                  strokeWidth="0.5"/>
        ))}
      </svg>
    );
  },

  't-shirts': ({ colors }: { colors: string[] }) => {
    const mainColor = colors[0] || '#E5E7EB';
    const designColor = colors[1] || mainColor;
    
    return (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* T-shirt body */}
        <rect x="60" y="80" width="80" height="90" 
              fill={mainColor} 
              stroke="#374151" 
              strokeWidth="1.5" 
              rx="3"/>
        
        {/* Crew neck */}
        <ellipse cx="100" cy="80" rx="15" ry="8" 
                 fill="none" 
                 stroke="#374151" 
                 strokeWidth="1"/>
        
        {/* Short sleeves */}
        <ellipse cx="50" cy="90" rx="12" ry="20" 
                 fill={mainColor} 
                 stroke="#374151" 
                 strokeWidth="1"/>
        <ellipse cx="150" cy="90" rx="12" ry="20" 
                 fill={mainColor} 
                 stroke="#374151" 
                 strokeWidth="1"/>
        
        {/* Design area */}
        {colors[1] && (
          <rect x="75" y="110" width="50" height="25" 
                rx="5" 
                fill={designColor} 
                opacity="0.7"/>
        )}
      </svg>
    );
  },

  'oversized-tee': ({ colors }: { colors: string[] }) => {
    const mainColor = colors[0] || '#E5E7EB';
    
    return (
      <svg viewBox="0 0 220 200" className="w-full h-full">
        {/* Oversized body */}
        <rect x="40" y="80" width="140" height="100" 
              fill={mainColor} 
              stroke="#374151" 
              strokeWidth="1.5" 
              rx="5"/>
        
        {/* Crew neck */}
        <ellipse cx="110" cy="80" rx="18" ry="10" 
                 fill="none" 
                 stroke="#374151" 
                 strokeWidth="1"/>
        
        {/* Dropped shoulders */}
        <ellipse cx="30" cy="90" rx="15" ry="25" 
                 fill={mainColor} 
                 stroke="#374151" 
                 strokeWidth="1"/>
        <ellipse cx="190" cy="90" rx="15" ry="25" 
                 fill={mainColor} 
                 stroke="#374151" 
                 strokeWidth="1"/>
      </svg>
    );
  },

  'kurtas': ({ colors }: { colors: string[] }) => {
    const mainColor = colors[0] || '#E5E7EB';
    const embroideryColor = colors[1] || '#FCD34D';
    
    return (
      <svg viewBox="0 0 200 280" className="w-full h-full">
        {/* Main kurta body */}
        <rect x="50" y="80" width="100" height="160" 
              fill={mainColor} 
              stroke="#374151" 
              strokeWidth="1.5"/>
        
        {/* Traditional collar */}
        <rect x="85" y="75" width="30" height="10" 
              fill={embroideryColor} 
              stroke="#374151" 
              strokeWidth="1"/>
        
        {/* Sleeves */}
        <ellipse cx="40" cy="95" rx="12" ry="30" 
                 fill={mainColor} 
                 stroke="#374151" 
                 strokeWidth="1"/>
        <ellipse cx="160" cy="95" rx="12" ry="30" 
                 fill={mainColor} 
                 stroke="#374151" 
                 strokeWidth="1"/>
        
        {/* Embroidery panel */}
        <rect x="80" y="90" width="40" height="120" 
              fill={embroideryColor} 
              opacity="0.3"/>
        
        {/* Side slits */}
        <line x1="50" y1="220" x2="50" y2="240" stroke="#374151" strokeWidth="2"/>
        <line x1="150" y1="220" x2="150" y2="240" stroke="#374151" strokeWidth="2"/>
      </svg>
    );
  },

  'formal-pants': ({ colors }: { colors: string[] }) => {
    const mainColor = colors[0] || '#E5E7EB';
    const waistbandColor = colors[1] || '#374151';
    
    return (
      <svg viewBox="0 0 200 250" className="w-full h-full">
        {/* Waistband */}
        <rect x="70" y="60" width="60" height="8" 
              fill={waistbandColor} 
              stroke="#374151" 
              strokeWidth="1"/>
        
        {/* Left leg */}
        <rect x="75" y="68" width="20" height="160" 
              fill={mainColor} 
              stroke="#374151" 
              strokeWidth="1"/>
        
        {/* Right leg */}
        <rect x="105" y="68" width="20" height="160" 
              fill={mainColor} 
              stroke="#374151" 
              strokeWidth="1"/>
        
        {/* Crease lines */}
        <line x1="85" y1="68" x2="85" y2="228" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.5"/>
        <line x1="115" y1="68" x2="115" y2="228" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.5"/>
        
        {/* Belt loops */}
        {[75, 90, 100, 110, 125].map(x => (
          <rect key={x} x={x} y="57" width="2" height="6" fill="#374151"/>
        ))}
      </svg>
    );
  },

  'blazers': ({ colors }: { colors: string[] }) => {
    const mainColor = colors[0] || '#E5E7EB';
    const lapelColor = colors[1] || mainColor;
    
    return (
      <svg viewBox="0 0 200 260" className="w-full h-full">
        {/* Main blazer body */}
        <rect x="50" y="80" width="100" height="140" 
              fill={mainColor} 
              stroke="#374151" 
              strokeWidth="1.5"/>
        
        {/* Sleeves */}
        <ellipse cx="40" cy="95" rx="15" ry="40" 
                 fill={mainColor} 
                 stroke="#374151" 
                 strokeWidth="1"/>
        <ellipse cx="160" cy="95" rx="15" ry="40" 
                 fill={mainColor} 
                 stroke="#374151" 
                 strokeWidth="1"/>
        
        {/* Lapels */}
        <path d="M 85 80 L 75 95 L 85 110 L 100 80" 
              fill={lapelColor} 
              stroke="#374151" 
              strokeWidth="1"/>
        <path d="M 115 80 L 100 80 L 115 110 L 125 95 Z" 
              fill={lapelColor} 
              stroke="#374151" 
              strokeWidth="1"/>
        
        {/* Buttons */}
        {[120, 140, 160].map(y => (
          <circle key={y} cx="90" cy={y} r="3" 
                  fill="#374151" 
                  stroke="#FFFFFF" 
                  strokeWidth="0.5"/>
        ))}
        
        {/* Pocket */}
        <rect x="110" y="110" width="20" height="15" 
              fill="none" 
              stroke="#374151" 
              strokeWidth="0.5"/>
      </svg>
    );
  },

  'dresses': ({ colors }: { colors: string[] }) => {
    const mainColor = colors[0] || '#E5E7EB';
    const accentColor = colors[1] || mainColor;
    
    return (
      <svg viewBox="0 0 200 280" className="w-full h-full">
        {/* Dress silhouette */}
        <path d="M 70 80 L 130 80 L 140 120 L 170 260 L 30 260 L 60 120 Z" 
              fill={mainColor} 
              stroke="#374151" 
              strokeWidth="1.5"/>
        
        {/* Bodice */}
        <rect x="70" y="80" width="60" height="40" 
              fill={accentColor} 
              opacity="0.6" 
              stroke="#374151" 
              strokeWidth="0.5"/>
        
        {/* Straps */}
        <rect x="75" y="70" width="5" height="15" 
              fill={accentColor} 
              stroke="#374151" 
              strokeWidth="0.5"/>
        <rect x="120" y="70" width="5" height="15" 
              fill={accentColor} 
              stroke="#374151" 
              strokeWidth="0.5"/>
        
        {/* Waist belt */}
        <ellipse cx="100" cy="120" rx="35" ry="4" 
                 fill={accentColor} 
                 opacity="0.8"/>
      </svg>
    );
  },

  'shorts': ({ colors }: { colors: string[] }) => {
    const mainColor = colors[0] || '#E5E7EB';
    const waistbandColor = colors[1] || '#374151';
    
    return (
      <svg viewBox="0 0 200 150" className="w-full h-full">
        {/* Waistband */}
        <rect x="70" y="60" width="60" height="8" 
              fill={waistbandColor} 
              stroke="#374151" 
              strokeWidth="1"/>
        
        {/* Left leg */}
        <rect x="75" y="68" width="20" height="60" 
              fill={mainColor} 
              stroke="#374151" 
              strokeWidth="1"/>
        
        {/* Right leg */}
        <rect x="105" y="68" width="20" height="60" 
              fill={mainColor} 
              stroke="#374151" 
              strokeWidth="1"/>
        
        {/* Pockets */}
        <path d="M 80 75 Q 75 80 80 85" 
              fill="none" 
              stroke="#374151" 
              strokeWidth="0.5"/>
        <path d="M 120 75 Q 125 80 120 85" 
              fill="none" 
              stroke="#374151" 
              strokeWidth="0.5"/>
      </svg>
    );
  },

  'polo-shirt': ({ colors }: { colors: string[] }) => {
    const mainColor = colors[0] || '#E5E7EB';
    const collarColor = colors[1] || mainColor;
    
    return (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Polo body */}
        <rect x="60" y="80" width="80" height="100" 
              fill={mainColor} 
              stroke="#374151" 
              strokeWidth="1.5" 
              rx="3"/>
        
        {/* Short sleeves */}
        <ellipse cx="50" cy="90" rx="12" ry="18" 
                 fill={mainColor} 
                 stroke="#374151" 
                 strokeWidth="1"/>
        <ellipse cx="150" cy="90" rx="12" ry="18" 
                 fill={mainColor} 
                 stroke="#374151" 
                 strokeWidth="1"/>
        
        {/* Polo collar */}
        <path d="M 85 80 L 90 70 Q 100 65 110 70 L 115 80" 
              fill={collarColor} 
              stroke="#374151" 
              strokeWidth="1"/>
        
        {/* Button placket */}
        <rect x="98" y="80" width="4" height="30" 
              fill={collarColor} 
              opacity="0.8"/>
        
        {/* Buttons */}
        <circle cx="100" cy="90" r="1.5" fill="#FFFFFF" stroke="#374151" strokeWidth="0.5"/>
        <circle cx="100" cy="105" r="1.5" fill="#FFFFFF" stroke="#374151" strokeWidth="0.5"/>
      </svg>
    );
  },

  'blazer-modern': ({ colors }: { colors: string[] }) => {
    const mainColor = colors[0] || '#E5E7EB';
    const lapelColor = colors[1] || mainColor;
    
    return (
      <svg viewBox="0 0 200 250" className="w-full h-full">
        {/* Slim blazer body */}
        <rect x="55" y="80" width="90" height="130" 
              fill={mainColor} 
              stroke="#374151" 
              strokeWidth="1.5"/>
        
        {/* Fitted sleeves */}
        <ellipse cx="45" cy="95" rx="12" ry="35" 
                 fill={mainColor} 
                 stroke="#374151" 
                 strokeWidth="1"/>
        <ellipse cx="155" cy="95" rx="12" ry="35" 
                 fill={mainColor} 
                 stroke="#374151" 
                 strokeWidth="1"/>
        
        {/* Modern lapels */}
        <path d="M 85 80 L 80 90 L 85 105 L 100 80" 
              fill={lapelColor} 
              stroke="#374151" 
              strokeWidth="1"/>
        <path d="M 115 80 L 100 80 L 115 105 L 120 90 Z" 
              fill={lapelColor} 
              stroke="#374151" 
              strokeWidth="1"/>
        
        {/* Single button */}
        <circle cx="90" cy="130" r="3" 
                fill="#374151" 
                stroke="#FFFFFF" 
                strokeWidth="0.5"/>
      </svg>
    );
  },

  'crop-hoodie': ({ colors }: { colors: string[] }) => {
    const mainColor = colors[0] || '#E5E7EB';
    
    return (
      <svg viewBox="0 0 200 180" className="w-full h-full">
        {/* Cropped hoodie body */}
        <rect x="60" y="90" width="80" height="70" 
              fill={mainColor} 
              stroke="#374151" 
              strokeWidth="1.5" 
              rx="5"/>
        
        {/* Hood */}
        <path d="M 80 90 Q 75 75 80 70 Q 100 65 120 70 Q 125 75 120 90" 
              fill={mainColor} 
              stroke="#374151" 
              strokeWidth="1"/>
        
        {/* Long sleeves */}
        <ellipse cx="50" cy="105" rx="15" ry="30" 
                 fill={mainColor} 
                 stroke="#374151" 
                 strokeWidth="1"/>
        <ellipse cx="150" cy="105" rx="15" ry="30" 
                 fill={mainColor} 
                 stroke="#374151" 
                 strokeWidth="1"/>
        
        {/* Kangaroo pocket */}
        <rect x="75" y="115" width="50" height="20" 
              rx="3" 
              fill="none" 
              stroke="#374151" 
              strokeWidth="1"/>
        
        {/* Drawstring */}
        <circle cx="95" cy="95" r="1" fill="#374151"/>
        <circle cx="105" cy="95" r="1" fill="#374151"/>
      </svg>
    );
  },

  'nehru-jacket': ({ colors }: { colors: string[] }) => {
    const mainColor = colors[0] || '#E5E7EB';
    const collarColor = colors[1] || mainColor;
    
    return (
      <svg viewBox="0 0 200 240" className="w-full h-full">
        {/* Nehru jacket body */}
        <rect x="55" y="80" width="90" height="120" 
              fill={mainColor} 
              stroke="#374151" 
              strokeWidth="1.5"/>
        
        {/* Mandarin collar */}
        <rect x="85" y="75" width="30" height="6" 
              fill={collarColor} 
              stroke="#374151" 
              strokeWidth="1" 
              rx="3"/>
        
        {/* Traditional buttons */}
        {[95, 115, 135, 155, 175].map(y => (
          <circle key={y} cx="100" cy={y} r="2.5" 
                  fill={collarColor} 
                  stroke="#374151" 
                  strokeWidth="0.5"/>
        ))}
      </svg>
    );
  },

  'palazzo': ({ colors }: { colors: string[] }) => {
    const mainColor = colors[0] || '#E5E7EB';
    const waistColor = colors[1] || mainColor;
    
    return (
      <svg viewBox="0 0 200 250" className="w-full h-full">
        {/* High waist */}
        <rect x="75" y="60" width="50" height="8" 
              fill={waistColor} 
              stroke="#374151" 
              strokeWidth="1"/>
        
        {/* Wide flowing legs */}
        <path d="M 80 68 L 120 68 L 160 230 L 40 230 Z" 
              fill={mainColor} 
              stroke="#374151" 
              strokeWidth="1.5"/>
        
        {/* Flow lines */}
        <line x1="100" y1="68" x2="100" y2="230" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.3"/>
      </svg>
    );
  },

  'blouse': ({ colors }: { colors: string[] }) => {
    const mainColor = colors[0] || '#E5E7EB';
    
    return (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <rect x="65" y="80" width="70" height="80" 
              fill={mainColor} 
              stroke="#374151" 
              strokeWidth="1.5" 
              rx="3"/>
        <ellipse cx="55" cy="90" rx="8" ry="15" fill={mainColor} stroke="#374151" strokeWidth="1"/>
        <ellipse cx="145" cy="90" rx="8" ry="15" fill={mainColor} stroke="#374151" strokeWidth="1"/>
        <ellipse cx="100" cy="80" rx="20" ry="8" fill="none" stroke="#374151" strokeWidth="1"/>
      </svg>
    );
  },

  'saree-blouse': ({ colors }: { colors: string[] }) => {
    const mainColor = colors[0] || '#E5E7EB';
    const embroideryColor = colors[1] || '#FFD700';
    
    return (
      <svg viewBox="0 0 200 180" className="w-full h-full">
        <rect x="70" y="90" width="60" height="70" 
              fill={mainColor} 
              stroke="#374151" 
              strokeWidth="1.5" 
              rx="5"/>
        <rect x="70" y="90" width="60" height="50" 
              fill={embroideryColor} 
              opacity="0.4"/>
        <ellipse cx="65" cy="100" rx="6" ry="12" fill={mainColor} stroke="#374151" strokeWidth="1"/>
        <ellipse cx="135" cy="100" rx="6" ry="12" fill={mainColor} stroke="#374151" strokeWidth="1"/>
      </svg>
    );
  },

  'dhoti-pants': ({ colors }: { colors: string[] }) => {
    const mainColor = colors[0] || '#E5E7EB';
    
    return (
      <svg viewBox="0 0 200 250" className="w-full h-full">
        <path d="M 70 60 L 130 60 L 125 120 L 85 220 L 65 220 L 75 120 Z" 
              fill={mainColor} 
              stroke="#374151" 
              strokeWidth="1.5"/>
        <path d="M 125 120 L 145 220 L 125 220 L 115 120 Z" 
              fill={mainColor} 
              stroke="#374151" 
              strokeWidth="1.5"/>
        <rect x="70" y="55" width="60" height="8" fill={colors[1] || '#374151'} stroke="#374151" strokeWidth="1"/>
      </svg>
    );
  },

  'pajamas': ({ colors }: { colors: string[] }) => {
    const mainColor = colors[0] || '#E5E7EB';
    
    return (
      <svg viewBox="0 0 200 240" className="w-full h-full">
        {/* Top */}
        <rect x="60" y="60" width="80" height="60" 
              fill={mainColor} 
              stroke="#374151" 
              strokeWidth="1" 
              rx="3"/>
        <ellipse cx="50" cy="75" rx="10" ry="15" fill={mainColor} stroke="#374151" strokeWidth="1"/>
        <ellipse cx="150" cy="75" rx="10" ry="15" fill={mainColor} stroke="#374151" strokeWidth="1"/>
        
        {/* Bottom */}
        <rect x="75" y="130" width="22" height="80" fill={mainColor} stroke="#374151" strokeWidth="1"/>
        <rect x="103" y="130" width="22" height="80" fill={mainColor} stroke="#374151" strokeWidth="1"/>
        
        {/* Elastic waistband */}
        <rect x="75" y="125" width="50" height="5" 
              fill={colors[1] || '#374151'} 
              opacity="0.7"/>
      </svg>
    );
  },

  'waistcoat': ({ colors }: { colors: string[] }) => {
    const mainColor = colors[0] || '#E5E7EB';
    const buttonColor = colors[1] || '#374151';
    
    return (
      <svg viewBox="0 0 200 220" className="w-full h-full">
        <path d="M 60 80 L 140 80 L 135 180 L 65 180 Z" 
              fill={mainColor} 
              stroke="#374151" 
              strokeWidth="1.5"/>
        
        {/* V-neck */}
        <path d="M 85 80 L 80 95 L 85 110 L 100 80" 
              fill={colors[1] || colors[0]} 
              stroke="#374151" 
              strokeWidth="1"/>
        <path d="M 115 80 L 100 80 L 115 110 L 120 95 Z" 
              fill={colors[1] || colors[0]} 
              stroke="#374151" 
              strokeWidth="1"/>
        
        {/* Buttons */}
        {[120, 140, 160].map(y => (
          <circle key={y} cx="95" cy={y} r="2" 
                  fill={buttonColor} 
                  stroke="#FFFFFF" 
                  strokeWidth="0.5"/>
        ))}
      </svg>
    );
  }
};

export default function Enhanced3DRunwayPreview({ 
  selectedDesign, 
  selectedColors, 
  selectedFabric, 
  uploadedImage,
  measurements = {},
  onColorsChange
}: Enhanced3DRunwayPreviewProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [previewColors, setPreviewColors] = useState<string[]>(selectedColors);
  const [colorHistory, setColorHistory] = useState<string[][]>([selectedColors]);
  const [activeColorIndex, setActiveColorIndex] = useState(0);

  // Sync preview colors with selected colors
  useEffect(() => {
    setPreviewColors(selectedColors);
  }, [selectedColors]);

  const designInfo = selectedDesign ? designTemplates[selectedDesign as keyof typeof designTemplates] : null;
  const basePrice = designInfo?.basePrice || 0;
  const fabricPrice = selectedFabric ? (fabricPricing[selectedFabric as keyof typeof fabricPricing] || 0) : 0;
  const colorPrice = previewColors.length * 50;
  const totalPrice = basePrice + fabricPrice + colorPrice;

  const handleColorSelect = (color: string) => {
    const newColors = [...previewColors];
    newColors[activeColorIndex] = color;
    setPreviewColors(newColors);
  };

  const addColorSlot = () => {
    if (previewColors.length < 3) { // Limit to 3 colors for simplicity
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

  const applyColors = () => {
    setColorHistory([...colorHistory, previewColors]);
    onColorsChange?.(previewColors);
    setShowColorPicker(false);
  };

  const undoColors = () => {
    if (colorHistory.length > 1) {
      const newHistory = [...colorHistory];
      newHistory.pop();
      const previousColors = newHistory[newHistory.length - 1];
      setColorHistory(newHistory);
      setPreviewColors(previousColors);
      onColorsChange?.(previousColors);
    }
  };

  const resetColors = () => {
    const defaultColors = ['#E5E7EB'];
    setPreviewColors(defaultColors);
    setActiveColorIndex(0);
  };

  // Get the garment cutout component
  const GarmentComponent = selectedDesign ? SimpleGarmentCutouts[selectedDesign as keyof typeof SimpleGarmentCutouts] : null;

  return (
    <div className="space-y-4">
      {/* Main Preview Card */}
      <Card className="overflow-hidden bg-white border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <span className="text-gray-900">Garment Preview</span>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-600 hover:bg-gray-100"
                onClick={() => setShowColorPicker(!showColorPicker)}
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
                    <Button size="sm" variant="ghost" onClick={undoColors} disabled={colorHistory.length <= 1}>
                      <Undo className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={resetColors}>
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
                
                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-gray-200">
                  <Button size="sm" onClick={applyColors} className="flex-1">
                    <Save className="h-3 w-3 mr-1" />
                    Apply Colors
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowColorPicker(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Simple Preview Display */}
          <div className="relative h-80 bg-gray-50 flex items-center justify-center">
            {selectedDesign && GarmentComponent ? (
              <div className="w-48 h-64 flex items-center justify-center">
                <GarmentComponent colors={previewColors} />
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <Shirt className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Select a design to preview</p>
                <p className="text-sm">Choose from the gallery above</p>
              </div>
            )}
          </div>
          
          {/* Control Panel */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            {selectedDesign && (
              <div className="flex justify-center gap-2 mb-4">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-600 hover:bg-gray-200"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                >
                  <Palette className="h-4 w-4 mr-1" />
                  {showColorPicker ? 'Hide Colors' : 'Try Colors'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-600 hover:bg-gray-200"
                  onClick={applyColors}
                  disabled={JSON.stringify(previewColors) === JSON.stringify(selectedColors)}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </Button>
              </div>
            )}
            
            {/* Design Info */}
            {designInfo && (
              <div className="text-center text-sm text-gray-600">
                <p className="font-medium text-gray-900">{designInfo.name}</p>
                <p>Base Price: ₹{basePrice.toLocaleString()}</p>
                {previewColors.length > 0 && (
                  <p>Colors: +₹{colorPrice.toLocaleString()}</p>
                )}
                {selectedFabric && fabricPrice > 0 && (
                  <p>Premium Fabric: +₹{fabricPrice.toLocaleString()}</p>
                )}
                <p className="font-bold text-blue-600 mt-1">
                  Total: ₹{totalPrice.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Color Info Card */}
      {selectedDesign && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                  <Palette className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Color Customization</h3>
                  <p className="text-sm text-gray-600">
                    {previewColors.length} color{previewColors.length !== 1 ? 's' : ''} applied
                  </p>
                  {JSON.stringify(previewColors) !== JSON.stringify(selectedColors) && (
                    <p className="text-xs text-orange-600 font-medium">
                      ⚠️ Unsaved changes
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                {previewColors.map((color, index) => (
                  <div
                    key={index}
                    className="w-5 h-5 rounded border-2 border-white shadow-sm"
                    style={{ backgroundColor: color }}
                    title={`Color ${index + 1}: ${color}`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {selectedDesign && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white">
                  <Scissors className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{designInfo?.name}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedFabric ? selectedFabric.replace('-', ' ') : 'Default fabric'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">
                  ₹{totalPrice.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  Est. 7-14 days
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}