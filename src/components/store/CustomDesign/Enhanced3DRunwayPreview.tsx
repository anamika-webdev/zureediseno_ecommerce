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
  ZoomIn, 
  ZoomOut, 
  Eye,
  Sparkles,
  Play,
  Pause
} from 'lucide-react';

interface Enhanced3DRunwayPreviewProps {
  selectedDesign?: string;
  selectedColors: string[];
  selectedFabric?: string;
  uploadedImage?: string | null;
  measurements?: Record<string, string>;
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

// Realistic garment cutouts with proper layering
const GarmentCutouts = {
  'full-shirt': ({ colors, fabric }: { colors: string[], fabric?: string }) => {
    const primaryColor = colors[0] || '#E5E7EB';
    const accentColor = colors[1] || primaryColor;
    const fabricPattern = fabric === 'dobby' ? 'url(#dobbyPattern)' : fabric === 'oxford-cotton' ? 'url(#oxfordPattern)' : primaryColor;
    
    return (
      <svg viewBox="0 0 300 380" className="w-full h-full">
        <defs>
          {/* Fabric Patterns */}
          <pattern id="dobbyPattern" patternUnits="userSpaceOnUse" width="8" height="8">
            <rect width="8" height="8" fill={primaryColor}/>
            <rect x="0" y="0" width="4" height="4" fill={colors[1] || '#FFFFFF'} opacity="0.3"/>
            <rect x="4" y="4" width="4" height="4" fill={colors[1] || '#FFFFFF'} opacity="0.3"/>
          </pattern>
          
          <pattern id="oxfordPattern" patternUnits="userSpaceOnUse" width="6" height="6">
            <rect width="6" height="6" fill={primaryColor}/>
            <circle cx="3" cy="3" r="1" fill="#FFFFFF" opacity="0.2"/>
          </pattern>
          
          {/* Gradients for realistic lighting */}
          <linearGradient id="shirtBodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="30%" stopColor={primaryColor} />
            <stop offset="70%" stopColor={primaryColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0.6" />
          </linearGradient>
          
          <linearGradient id="collarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accentColor} />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.8" />
          </linearGradient>
          
          {/* 3D Shadow filters */}
          <filter id="bodyShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="4" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.3"/>
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor={primaryColor} floodOpacity="0.2"/>
          </filter>
          
          <filter id="sleeveShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="3" dy="6" stdDeviation="4" floodColor="#000000" floodOpacity="0.25"/>
          </filter>
        </defs>
        
        {/* Garment Shadow on Ground */}
        <ellipse cx="150" cy="360" rx="80" ry="15" fill="#000000" opacity="0.2"/>
        
        {/* Main Shirt Body */}
        <path 
          d="M 80 120 L 220 120 L 218 300 L 82 300 Z" 
          fill="url(#shirtBodyGradient)" 
          stroke="#1F2937" 
          strokeWidth="1.5" 
          filter="url(#bodyShadow)"
        />
        
        {/* Left Sleeve with 3D effect */}
        <ellipse 
          cx="65" 
          cy="140" 
          rx="25" 
          ry="65" 
          fill={fabricPattern} 
          stroke="#1F2937" 
          strokeWidth="1.5" 
          filter="url(#sleeveShadow)"
          transform="rotate(-15 65 140)"
        />
        
        {/* Right Sleeve with 3D effect */}
        <ellipse 
          cx="235" 
          cy="140" 
          rx="25" 
          ry="65" 
          fill={fabricPattern} 
          stroke="#1F2937" 
          strokeWidth="1.5" 
          filter="url(#sleeveShadow)"
          transform="rotate(15 235 140)"
        />
        
        {/* Collar with realistic fold */}
        <path 
          d="M 120 120 L 130 95 Q 150 85 170 95 L 180 120 Q 150 125 120 120" 
          fill="url(#collarGradient)" 
          stroke="#1F2937" 
          strokeWidth="1.5"
        />
        
        {/* Collar fold detail */}
        <path 
          d="M 130 95 Q 150 90 170 95" 
          fill="none" 
          stroke="#1F2937" 
          strokeWidth="1"
        />
        
        {/* Button placket */}
        <rect 
          x="145" 
          y="120" 
          width="10" 
          height="150" 
          fill={primaryColor} 
          opacity="0.9"
        />
        
        {/* Buttons with realistic shine */}
        <g>
          <circle cx="150" cy="140" r="4" fill="#FFFFFF" stroke="#374151" strokeWidth="1"/>
          <circle cx="150" cy="140" r="2" fill="#F8F9FA" opacity="0.8"/>
          
          <circle cx="150" cy="165" r="4" fill="#FFFFFF" stroke="#374151" strokeWidth="1"/>
          <circle cx="150" cy="165" r="2" fill="#F8F9FA" opacity="0.8"/>
          
          <circle cx="150" cy="190" r="4" fill="#FFFFFF" stroke="#374151" strokeWidth="1"/>
          <circle cx="150" cy="190" r="2" fill="#F8F9FA" opacity="0.8"/>
          
          <circle cx="150" cy="215" r="4" fill="#FFFFFF" stroke="#374151" strokeWidth="1"/>
          <circle cx="150" cy="215" r="2" fill="#F8F9FA" opacity="0.8"/>
          
          <circle cx="150" cy="240" r="4" fill="#FFFFFF" stroke="#374151" strokeWidth="1"/>
          <circle cx="150" cy="240" r="2" fill="#F8F9FA" opacity="0.8"/>
        </g>
        
        {/* Chest Pocket with depth */}
        <rect 
          x="110" 
          y="160" 
          width="25" 
          height="20" 
          fill="none" 
          stroke="#1F2937" 
          strokeWidth="1"
        />
        <path d="M 110 162 L 135 162" stroke="#1F2937" strokeWidth="0.5"/>
        
        {/* Cuff details */}
        <rect x="55" y="195" width="20" height="8" fill={accentColor} opacity="0.7" rx="2"/>
        <rect x="225" y="195" width="20" height="8" fill={accentColor} opacity="0.7" rx="2"/>
        
        {/* Seam lines for realism */}
        <path d="M 80 120 L 82 300" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.3"/>
        <path d="M 218 120 L 220 300" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.3"/>
        
        {/* Fabric texture overlay */}
        {fabric === 'satin' && (
          <rect x="80" y="120" width="140" height="180" fill="url(#satinShine)" opacity="0.3"/>
        )}
      </svg>
    );
  },

  'blazers': ({ colors, fabric }: { colors: string[], fabric?: string }) => {
    const primaryColor = colors[0] || '#1F2937';
    const accentColor = colors[1] || '#374151';
    
    return (
      <svg viewBox="0 0 320 400" className="w-full h-full">
        <defs>
          <linearGradient id="blazerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="50%" stopColor={primaryColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0.7" />
          </linearGradient>
          
          <linearGradient id="lapelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accentColor} />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.8" />
          </linearGradient>
          
          <filter id="blazerShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="6" dy="10" stdDeviation="8" floodColor="#000000" floodOpacity="0.4"/>
          </filter>
        </defs>
        
        {/* Shadow */}
        <ellipse cx="160" cy="380" rx="90" ry="18" fill="#000000" opacity="0.2"/>
        
        {/* Main Blazer Body */}
        <path 
          d="M 75 140 L 245 140 L 240 330 L 80 330 Z" 
          fill="url(#blazerGradient)" 
          stroke="#000000" 
          strokeWidth="2" 
          filter="url(#blazerShadow)"
        />
        
        {/* Left Lapel */}
        <path 
          d="M 75 140 L 105 100 L 135 140 L 110 180 Z" 
          fill="url(#lapelGradient)" 
          stroke="#000000" 
          strokeWidth="1.5"
        />
        
        {/* Right Lapel */}
        <path 
          d="M 245 140 L 215 100 L 185 140 L 210 180 Z" 
          fill="url(#lapelGradient)" 
          stroke="#000000" 
          strokeWidth="1.5"
        />
        
        {/* Left Sleeve */}
        <ellipse 
          cx="55" 
          cy="170" 
          rx="30" 
          ry="85" 
          fill="url(#blazerGradient)" 
          stroke="#000000" 
          strokeWidth="1.5" 
          transform="rotate(-10 55 170)"
        />
        
        {/* Right Sleeve */}
        <ellipse 
          cx="265" 
          cy="170" 
          rx="30" 
          ry="85" 
          fill="url(#blazerGradient)" 
          stroke="#000000" 
          strokeWidth="1.5" 
          transform="rotate(10 265 170)"
        />
        
        {/* Premium Buttons */}
        <g>
          <circle cx="140" cy="190" r="6" fill="#C0C0C0" stroke="#000000" strokeWidth="1"/>
          <circle cx="140" cy="190" r="3" fill="#E5E7EB"/>
          
          <circle cx="140" cy="220" r="6" fill="#C0C0C0" stroke="#000000" strokeWidth="1"/>
          <circle cx="140" cy="220" r="3" fill="#E5E7EB"/>
          
          <circle cx="140" cy="250" r="6" fill="#C0C0C0" stroke="#000000" strokeWidth="1"/>
          <circle cx="140" cy="250" r="3" fill="#E5E7EB"/>
        </g>
        
        {/* Breast Pocket */}
        <rect 
          x="180" 
          y="170" 
          width="35" 
          height="25" 
          fill="none" 
          stroke="#000000" 
          strokeWidth="1.5"
        />
        <path d="M 185 175 L 210 175" stroke="#000000" strokeWidth="1"/>
        
        {/* Notch details */}
        <path d="M 105 100 L 115 110" stroke="#000000" strokeWidth="1"/>
        <path d="M 215 100 L 205 110" stroke="#000000" strokeWidth="1"/>
      </svg>
    );
  },

  't-shirts': ({ colors, fabric }: { colors: string[], fabric?: string }) => {
    const primaryColor = colors[0] || '#10B981';
    const designColor = colors[1] || primaryColor;
    
    return (
      <svg viewBox="0 0 300 360" className="w-full h-full">
        <defs>
          <radialGradient id="tshirtGradient" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0.8" />
          </radialGradient>
          
          <filter id="tshirtShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="3" dy="6" stdDeviation="4" floodColor="#000000" floodOpacity="0.25"/>
          </filter>
        </defs>
        
        {/* Shadow */}
        <ellipse cx="150" cy="340" rx="75" ry="12" fill="#000000" opacity="0.15"/>
        
        {/* T-shirt Body */}
        <rect 
          x="85" 
          y="140" 
          width="130" 
          height="160" 
          rx="8" 
          ry="8"
          fill="url(#tshirtGradient)" 
          stroke="#374151" 
          strokeWidth="1.5" 
          filter="url(#tshirtShadow)"
        />
        
        {/* Neckline */}
        <ellipse 
          cx="150" 
          cy="140" 
          rx="30" 
          ry="18" 
          fill="none" 
          stroke="#374151" 
          strokeWidth="2"
        />
        
        {/* Left Sleeve */}
        <ellipse 
          cx="70" 
          cy="160" 
          rx="20" 
          ry="45" 
          fill="url(#tshirtGradient)" 
          stroke="#374151" 
          strokeWidth="1.5"
        />
        
        {/* Right Sleeve */}
        <ellipse 
          cx="230" 
          cy="160" 
          rx="20" 
          ry="45" 
          fill="url(#tshirtGradient)" 
          stroke="#374151" 
          strokeWidth="1.5"
        />
        
        {/* Design Area (if second color selected) */}
        {colors[1] && (
          <>
            <rect 
              x="110" 
              y="180" 
              width="80" 
              height="50" 
              rx="8" 
              ry="8"
              fill={designColor} 
              opacity="0.8"
            />
            <text x="150" y="210" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">
              CUSTOM
            </text>
          </>
        )}
        
        {/* Hem details */}
        <path d="M 85 290 Q 150 295 215 290" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.3"/>
      </svg>
    );
  },

  'dresses': ({ colors, fabric }: { colors: string[], fabric?: string }) => {
    const primaryColor = colors[0] || '#EC4899';
    const accentColor = colors[1] || primaryColor;
    
    return (
      <svg viewBox="0 0 300 420" className="w-full h-full">
        <defs>
          <linearGradient id="dressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="30%" stopColor={primaryColor} stopOpacity="0.95" />
            <stop offset="70%" stopColor={primaryColor} stopOpacity="0.85" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0.75" />
          </linearGradient>
          
          <filter id="dressShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="4" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.3"/>
          </filter>
        </defs>
        
        {/* Shadow */}
        <ellipse cx="150" cy="400" rx="85" ry="16" fill="#000000" opacity="0.2"/>
        
        {/* Dress Silhouette */}
        <path 
          d="M 90 120 L 210 120 Q 220 160 225 220 Q 230 280 235 340 Q 240 380 245 400 L 55 400 Q 60 380 65 340 Q 70 280 75 220 Q 80 160 90 120" 
          fill="url(#dressGradient)" 
          stroke="#374151" 
          strokeWidth="2" 
          filter="url(#dressShadow)"
        />
        
        {/* Neckline */}
        <path 
          d="M 125 120 Q 150 100 175 120" 
          fill="none" 
          stroke="#374151" 
          strokeWidth="2"
        />
        
        {/* Cap Sleeves */}
        <ellipse 
          cx="90" 
          cy="135" 
          rx="22" 
          ry="30" 
          fill="url(#dressGradient)" 
          stroke="#374151" 
          strokeWidth="1.5" 
          transform="rotate(-25 90 135)"
        />
        <ellipse 
          cx="210" 
          cy="135" 
          rx="22" 
          ry="30" 
          fill="url(#dressGradient)" 
          stroke="#374151" 
          strokeWidth="1.5" 
          transform="rotate(25 210 135)"
        />
        
        {/* Waist Belt/Accent */}
        {colors[1] && (
          <ellipse 
            cx="150" 
            cy="200" 
            rx="75" 
            ry="8" 
            fill={accentColor} 
            opacity="0.9"
          />
        )}
        
        {/* Flowing fabric details */}
        <path 
          d="M 80 300 Q 110 295 140 300 Q 170 305 200 300 Q 230 295 235 300" 
          fill="none" 
          stroke="#FFFFFF" 
          strokeWidth="1" 
          opacity="0.4"
        />
        
        {/* Decorative elements */}
        {colors[2] && (
          <g>
            <circle cx="120" cy="260" r="4" fill={colors[2]} opacity="0.6"/>
            <circle cx="180" cy="280" r="4" fill={colors[2]} opacity="0.6"/>
            <circle cx="150" cy="320" r="4" fill={colors[2]} opacity="0.6"/>
          </g>
        )}
      </svg>
    );
  },

  'kurtas': ({ colors, fabric }: { colors: string[], fabric?: string }) => {
    const primaryColor = colors[0] || '#D97706';
    const accentColor = colors[1] || '#92400E';
    
    return (
      <svg viewBox="0 0 300 400" className="w-full h-full">
        <defs>
          <linearGradient id="kurtaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0.8" />
          </linearGradient>
          
          <filter id="kurtaShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="4" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.3"/>
          </filter>
        </defs>
        
        {/* Shadow */}
        <ellipse cx="150" cy="380" rx="80" ry="15" fill="#000000" opacity="0.2"/>
        
        {/* Kurta Body */}
        <rect 
          x="80" 
          y="120" 
          width="140" 
          height="220" 
          rx="6" 
          ry="6"
          fill="url(#kurtaGradient)" 
          stroke="#374151" 
          strokeWidth="2" 
          filter="url(#kurtaShadow)"
        />
        
        {/* Collar */}
        <path 
          d="M 120 120 L 130 95 Q 150 85 170 95 L 180 120 Q 150 125 120 120" 
          fill={accentColor} 
          stroke="#374151" 
          strokeWidth="1.5"
        />
        
        {/* Long Sleeves */}
        <ellipse 
          cx="60" 
          cy="160" 
          rx="25" 
          ry="80" 
          fill="url(#kurtaGradient)" 
          stroke="#374151" 
          strokeWidth="1.5" 
          transform="rotate(-10 60 160)"
        />
        <ellipse 
          cx="240" 
          cy="160" 
          rx="25" 
          ry="80" 
          fill="url(#kurtaGradient)" 
          stroke="#374151" 
          strokeWidth="1.5" 
          transform="rotate(10 240 160)"
        />
        
        {/* Traditional Neckline Design */}
        <circle 
          cx="150" 
          cy="150" 
          r="20" 
          fill="none" 
          stroke={accentColor} 
          strokeWidth="2"
        />
        <path 
          d="M 150 130 L 150 170" 
          stroke={accentColor} 
          strokeWidth="2"
        />
        <path 
          d="M 130 150 L 170 150" 
          stroke={accentColor} 
          strokeWidth="2"
        />
        
        {/* Side slits */}
        <path d="M 80 300 L 80 340" stroke="#374151" strokeWidth="2"/>
        <path d="M 220 300 L 220 340" stroke="#374151" strokeWidth="2"/>
        
        {/* Traditional hem pattern */}
        <rect x="80" y="320" width="140" height="20" fill={accentColor} opacity="0.6"/>
        <path 
          d="M 90 325 L 100 330 L 110 325 L 120 330 L 130 325 L 140 330 L 150 325 L 160 330 L 170 325 L 180 330 L 190 325 L 200 330 L 210 325" 
          fill="none" 
          stroke="#374151" 
          strokeWidth="1"
        />
      </svg>
    );
  },

  'shorts': ({ colors, fabric }: { colors: string[], fabric?: string }) => {
    const primaryColor = colors[0] || '#0891B2';
    const accentColor = colors[1] || '#0E7490';
    
    return (
      <svg viewBox="0 0 280 220" className="w-full h-full">
        <defs>
          <linearGradient id="shortsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0.8" />
          </linearGradient>
          
          <filter id="shortsShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.25"/>
          </filter>
        </defs>
        
        {/* Shadow */}
        <ellipse cx="140" cy="200" rx="60" ry="10" fill="#000000" opacity="0.15"/>
        
        {/* Waistband */}
        <rect 
          x="80" 
          y="60" 
          width="120" 
          height="15" 
          fill={accentColor} 
          stroke="#374151" 
          strokeWidth="1"
        />
        
        {/* Left Leg */}
        <rect 
          x="85" 
          y="75" 
          width="50" 
          height="100" 
          rx="4" 
          ry="4"
          fill="url(#shortsGradient)" 
          stroke="#374151" 
          strokeWidth="1.5" 
          filter="url(#shortsShadow)"
        />
        
        {/* Right Leg */}
        <rect 
          x="145" 
          y="75" 
          width="50" 
          height="100" 
          rx="4" 
          ry="4"
          fill="url(#shortsGradient)" 
          stroke="#374151" 
          strokeWidth="1.5" 
          filter="url(#shortsShadow)"
        />
        
        {/* Belt loops */}
        <rect x="95" y="55" width="3" height="10" fill="#374151"/>
        <rect x="115" y="55" width="3" height="10" fill="#374151"/>
        <rect x="135" y="55" width="3" height="10" fill="#374151"/>
        <rect x="155" y="55" width="3" height="10" fill="#374151"/>
        <rect x="175" y="55" width="3" height="10" fill="#374151"/>
        
        {/* Pockets */}
        <path 
          d="M 95 85 Q 105 80 115 85 L 115 110 L 95 110 Z" 
          fill="none" 
          stroke="#374151" 
          strokeWidth="1"
        />
        <path 
          d="M 165 85 Q 175 80 185 85 L 185 110 L 165 110 Z" 
          fill="none" 
          stroke="#374151" 
          strokeWidth="1"
        />
        
        {/* Seam details */}
        <path d="M 135 75 L 135 175" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.3"/>
        <path d="M 145 75 L 145 175" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.3"/>
      </svg>
    );
  }
};

export default function Enhanced3DRunwayPreview({ 
  selectedDesign, 
  selectedColors, 
  selectedFabric, 
  uploadedImage,
  measurements = {}
}: Enhanced3DRunwayPreviewProps) {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [viewMode, setViewMode] = useState<'front' | 'back' | '3d'>('front');
  
  const designInfo = selectedDesign ? designTemplates[selectedDesign as keyof typeof designTemplates] : null;
  const basePrice = designInfo?.basePrice || 0;
  const fabricPrice = selectedFabric ? (fabricPricing[selectedFabric as keyof typeof fabricPricing] || 0) : 0;
  const colorPrice = selectedColors.length * 50;
  const totalPrice = basePrice + fabricPrice + colorPrice;

  // Auto-rotate animation
  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setRotation(prev => (prev + 2) % 360);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isAnimating]);

  const resetView = () => {
    setRotation(0);
    setZoom(1);
    setViewMode('front');
  };

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  // Get the appropriate garment cutout component
  const GarmentComponent = selectedDesign ? GarmentCutouts[selectedDesign as keyof typeof GarmentCutouts] : null;

  return (
    <div className="space-y-4">
      {/* Main Preview Card */}
      <Card className="overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                3D Runway Preview
              </span>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={toggleAnimation}
              >
                {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={resetView}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* 3D Preview Stage */}
          <div className="relative h-96 bg-gradient-to-b from-gray-800 to-gray-900 overflow-hidden">
            {/* Runway Floor with perspective */}
            <div className="absolute bottom-0 left-0 right-0 h-20">
              <div 
                className="w-full h-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 transform"
                style={{
                  transform: `perspective(1000px) rotateX(60deg) scale(${zoom})`,
                  backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 22px)'
                }}
              />
            </div>
            
            {/* Professional Lighting Effects */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-gradient-radial from-yellow-300/40 to-transparent rounded-full blur-2xl" />
            <div className="absolute top-10 left-1/4 w-28 h-28 bg-gradient-radial from-blue-300/25 to-transparent rounded-full blur-xl" />
            <div className="absolute top-10 right-1/4 w-28 h-28 bg-gradient-radial from-purple-300/25 to-transparent rounded-full blur-xl" />
            
            {/* Main Garment Display */}
            {selectedDesign && GarmentComponent ? (
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  transform: `scale(${zoom}) rotateY(${rotation}deg)`,
                  transition: isAnimating ? 'none' : 'transform 0.3s ease-out'
                }}
              >
                {/* 3D Model Container */}
                <div className="relative w-64 h-80 transform-gpu">
                  {/* Realistic Ground Shadow */}
                  <div 
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-40 h-12 bg-black/50 rounded-full blur-lg"
                    style={{ 
                      transform: `scale(${1 + Math.abs(Math.sin(rotation * Math.PI / 180)) * 0.3}) rotateX(90deg)`,
                      opacity: 0.3 + Math.abs(Math.sin(rotation * Math.PI / 180)) * 0.2
                    }}
                  />
                  
                  {/* Main Garment Cutout */}
                  <div 
                    className="relative w-full h-full"
                    style={{
                      transform: viewMode === '3d' 
                        ? `rotateX(${Math.sin(rotation * Math.PI / 180) * 10}deg) rotateZ(${Math.cos(rotation * Math.PI / 180) * 3}deg)`
                        : 'none',
                      filter: `drop-shadow(0 ${Math.abs(Math.sin(rotation * Math.PI / 180)) * 8 + 4}px ${Math.abs(Math.sin(rotation * Math.PI / 180)) * 15 + 8}px rgba(0,0,0,0.4))`
                    }}
                  >
                    <GarmentComponent colors={selectedColors} fabric={selectedFabric} />
                  </div>
                  
                  {/* Floating Color Indicators */}
                  {selectedColors.length > 0 && (
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex gap-3">
                      {selectedColors.slice(0, 5).map((color, index) => (
                        <div
                          key={index}
                          className="relative"
                          style={{
                            transform: `translateY(${Math.sin((rotation + index * 72) * Math.PI / 180) * 8}px) scale(${0.8 + Math.sin((rotation + index * 72) * Math.PI / 180) * 0.2})`,
                            transition: isAnimating ? 'none' : 'transform 0.3s ease-out'
                          }}
                        >
                          <div
                            className="w-8 h-8 rounded-full border-3 border-white/70 shadow-xl"
                            style={{ 
                              backgroundColor: color,
                              boxShadow: `0 0 20px ${color}40, 0 4px 8px rgba(0,0,0,0.3)`
                            }}
                          />
                          {/* Color glow effect */}
                          <div
                            className="absolute inset-0 rounded-full animate-pulse"
                            style={{
                              background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
                              scale: '1.5'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Fabric Quality Indicator */}
                  {selectedFabric && (
                    <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-white border border-white/20">
                        {selectedFabric.replace('-', ' ').toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Enhanced Empty State
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <div className="relative">
                  <div className="w-32 h-32 border-4 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
                    <Shirt className="h-16 w-16 opacity-30" />
                  </div>
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-gray-700/30 rounded-full blur-sm" />
                </div>
                <p className="mt-6 text-lg font-medium">Select a design to see 3D preview</p>
                <p className="text-sm opacity-70">Choose from our gallery above</p>
              </div>
            )}
          </div>
          
          {/* Enhanced Control Panel */}
          <div className="p-4 bg-gray-800/60 backdrop-blur-sm border-t border-gray-700">
            {/* View Mode Selector */}
            <div className="flex justify-center gap-2 mb-4">
              {([
                { mode: 'front' as const, icon: Eye, label: 'Front' },
                { mode: 'back' as const, icon: RotateCcw, label: 'Back' },
                { mode: '3d' as const, icon: Sparkles, label: '3D' }
              ]).map(({ mode, icon: Icon, label }) => (
                <Button
                  key={mode}
                  size="sm"
                  variant={viewMode === mode ? 'default' : 'ghost'}
                  className={`text-white ${viewMode === mode ? 'bg-blue-600' : ''}`}
                  onClick={() => setViewMode(mode)}
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {label}
                </Button>
              ))}
            </div>
            
            {/* Zoom and Rotation Controls */}
            <div className="flex justify-center items-center gap-6">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-xs text-gray-300 min-w-[60px] text-center font-mono">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                  disabled={zoom >= 2}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="w-px h-6 bg-gray-600" />
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-300">Rotate:</span>
                <div className="text-xs text-gray-300 min-w-[40px] text-center font-mono">
                  {Math.round(rotation)}°
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className={`text-white ${isAnimating ? 'bg-red-600/50' : 'hover:bg-white/20'}`}
                  onClick={toggleAnimation}
                >
                  {isAnimating ? 'Stop' : 'Auto'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Design Information Panel */}
      {selectedDesign && (
        <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-blue-900">
              <div className="flex items-center gap-2">
                <Scissors className="h-5 w-5" />
                Design Specifications
              </div>
              <Badge className="bg-green-500 text-white">
                ✓ Ready to Order
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pricing Breakdown */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-white/50 rounded-lg">
              <div>
                <span className="text-sm text-gray-600">Design:</span>
                <p className="font-bold text-lg text-gray-900">{designInfo?.name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Base Price:</span>
                <p className="font-bold text-lg text-green-600">₹{basePrice}</p>
              </div>
              {selectedFabric && (
                <>
                  <div>
                    <span className="text-sm text-gray-600">Fabric:</span>
                    <p className="font-medium text-gray-900 capitalize">
                      {selectedFabric.replace('-', ' ')}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Fabric Cost:</span>
                    <p className="font-medium text-blue-600">+₹{fabricPrice}</p>
                  </div>
                </>
              )}
              <div>
                <span className="text-sm text-gray-600">Colors ({selectedColors.length}):</span>
                <p className="font-medium text-purple-600">+₹{colorPrice}</p>
              </div>
              <div className="border-t pt-2">
                <span className="text-sm text-gray-600">Total Price:</span>
                <p className="font-bold text-2xl text-blue-700">₹{totalPrice}</p>
              </div>
            </div>

            {/* Color Palette Display */}
            {selectedColors.length > 0 && (
              <div className="p-3 bg-white/50 rounded-lg">
                <span className="text-sm text-gray-600 block mb-2">Selected Color Palette:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedColors.map((color, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white rounded-full px-3 py-1 shadow-sm">
                      <div
                        className="w-5 h-5 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs font-mono text-gray-700">{color}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Measurements Summary */}
            {Object.keys(measurements).length > 0 && (
              <div className="p-3 bg-white/50 rounded-lg">
                <span className="text-sm text-gray-600 block mb-2">
                  <Ruler className="h-4 w-4 inline mr-1" />
                  Measurements Provided:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(measurements)
                    .filter(([_, value]) => value)
                    .map(([key, value]) => (
                      <div key={key} className="bg-white rounded px-2 py-1 shadow-sm">
                        <span className="text-xs text-gray-600 capitalize block">{key.replace('-', ' ')}</span>
                        <span className="font-medium text-sm">{value}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Reference Image */}
            {uploadedImage && (
              <div className="p-3 bg-white/50 rounded-lg">
                <span className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                  <Palette className="h-4 w-4" />
                  Reference Image:
                </span>
                <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-blue-200 shadow-md">
                  <img
                    src={uploadedImage}
                    alt="Design reference"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Status Indicators */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-blue-200">
              <Badge className="bg-green-500 text-white">
                ✓ Design Selected
              </Badge>
              {selectedColors.length > 0 && (
                <Badge className="bg-blue-500 text-white">
                  ✓ {selectedColors.length} Colors Applied
                </Badge>
              )}
              {selectedFabric && (
                <Badge className="bg-purple-500 text-white">
                  ✓ Premium Fabric
                </Badge>
              )}
              {Object.keys(measurements).length > 0 && (
                <Badge className="bg-orange-500 text-white">
                  ✓ {Object.keys(measurements).length} Measurements
                </Badge>
              )}
              {uploadedImage && (
                <Badge className="bg-pink-500 text-white">
                  ✓ Reference Added
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              disabled={!selectedDesign}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate AI Variations
            </Button>
            <Button 
              variant="outline" 
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
              disabled={!selectedDesign}
            >
              <Eye className="h-4 w-4 mr-2" />
              View in Augmented Reality
            </Button>
          </div>
          
          {selectedDesign && selectedColors.length > 0 && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <span className="font-medium">Ready to proceed!</span> Your design is configured and ready for order submission.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}