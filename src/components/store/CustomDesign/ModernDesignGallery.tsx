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
    name: 'Trending',
    designs: [
      { id: 'oversized-tee', name: 'Oversized Tee', price: '₹1,299', popularity: 95, category: 'casual' },
      { id: 'blazer-modern', name: 'Modern Blazer', price: '₹3,499', popularity: 88, category: 'formal' },
      { id: 'crop-hoodie', name: 'Crop Hoodie', price: '₹1,899', popularity: 92, category: 'streetwear' },
    ]
  },
  shirts: {
    name: 'Shirts',
    designs: [
      { id: 'full-shirt', name: 'Full Shirts', price: '₹1,799', popularity: 85, category: 'formal' },
      { id: 'half-shirt', name: 'Half Shirts', price: '₹1,299', popularity: 82, category: 'casual' },
      { id: 'polo-shirt', name: 'Polo Shirt', price: '₹1,199', popularity: 88, category: 'casual' },
    ]
  },
  casualWear: {
    name: 'Casual Wear',
    designs: [
      { id: 't-shirts', name: 'T-Shirts', price: '₹899', popularity: 90, category: 'casual' },
      { id: 'shorts', name: 'Shorts', price: '₹799', popularity: 85, category: 'casual' },
      { id: 'pajamas', name: 'Pajamas', price: '₹1,199', popularity: 75, category: 'casual' },
    ]
  },
  traditional: {
    name: 'Traditional',
    designs: [
      { id: 'kurtas', name: 'Kurtas', price: '₹1,699', popularity: 75, category: 'traditional' },
      { id: 'nehru-jacket', name: 'Nehru Jacket', price: '₹2,299', popularity: 68, category: 'traditional' },
      { id: 'dhoti-pants', name: 'Dhoti Pants', price: '₹1,399', popularity: 65, category: 'traditional' },
    ]
  },
  formalWear: {
    name: 'Formal Wear',
    designs: [
      { id: 'blazers', name: 'Blazers', price: '₹4,299', popularity: 80, category: 'formal' },
      { id: 'formal-pants', name: 'Pants', price: '₹2,199', popularity: 78, category: 'formal' },
      { id: 'waistcoat', name: 'Waistcoat', price: '₹2,799', popularity: 70, category: 'formal' },
    ]
  },
  womensWear: {
    name: 'Women\'s Wear',
    designs: [
      { id: 'dresses', name: 'Dresses', price: '₹2,499', popularity: 87, category: 'women' },
      { id: 'blouse', name: 'Blouse', price: '₹1,599', popularity: 84, category: 'women' },
      { id: 'saree-blouse', name: 'Saree Blouse', price: '₹1,899', popularity: 80, category: 'women' },
      { id: 'palazzo', name: 'Palazzo', price: '₹1,299', popularity: 78, category: 'women' },
    ]
  }
};

// Realistic garment cutouts with accurate proportions
const RealisticGarmentCutouts = {
  't-shirts': () => (
    <svg viewBox="0 0 300 350" className="w-full h-full">
      <path
        d="M 75 90 
           C 75 85, 80 80, 85 80
           L 120 80
           C 125 80, 130 75, 135 70
           C 140 65, 145 60, 150 60
           C 155 60, 160 65, 165 70
           C 170 75, 175 80, 180 80
           L 215 80
           C 220 80, 225 85, 225 90
           L 225 130
           L 210 130
           L 210 300
           C 210 310, 200 320, 190 320
           L 110 320
           C 100 320, 90 310, 90 300
           L 90 130
           L 75 130
           Z"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  ),

  'full-shirt': () => (
    <svg viewBox="0 0 300 380" className="w-full h-full">
      {/* Main shirt body */}
      <path
        d="M 90 100
           C 90 95, 95 90, 100 90
           L 130 90
           C 135 90, 140 85, 145 80
           C 147 78, 149 76, 150 76
           C 151 76, 153 78, 155 80
           C 160 85, 165 90, 170 90
           L 200 90
           C 205 90, 210 95, 210 100
           L 210 350
           C 210 355, 205 360, 200 360
           L 100 360
           C 95 360, 90 355, 90 350
           Z"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      
      {/* Long sleeves */}
      <path
        d="M 90 100 L 60 100 L 55 110 L 55 180 L 60 190 L 85 190 L 90 180"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M 210 100 L 240 100 L 245 110 L 245 180 L 240 190 L 215 190 L 210 180"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      
      {/* Collar */}
      <path
        d="M 135 90 L 140 70 C 145 65, 155 65, 160 70 L 165 90"
        fill="none"
        stroke="#2D3748"
        strokeWidth="2"
      />
    </svg>
  ),

  'half-shirt': () => (
    <svg viewBox="0 0 300 320" className="w-full h-full">
      {/* Main shirt body */}
      <path
        d="M 90 100
           C 90 95, 95 90, 100 90
           L 130 90
           C 135 90, 140 85, 145 80
           C 147 78, 149 76, 150 76
           C 151 76, 153 78, 155 80
           C 160 85, 165 90, 170 90
           L 200 90
           C 205 90, 210 95, 210 100
           L 210 280
           C 210 285, 205 290, 200 290
           L 100 290
           C 95 290, 90 285, 90 280
           Z"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      
      {/* Short sleeves */}
      <path
        d="M 90 100 L 70 100 L 65 110 L 65 140 L 70 150 L 85 150 L 90 140"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M 210 100 L 230 100 L 235 110 L 235 140 L 230 150 L 215 150 L 210 140"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      
      {/* Collar */}
      <path
        d="M 135 90 L 140 70 C 145 65, 155 65, 160 70 L 165 90"
        fill="none"
        stroke="#2D3748"
        strokeWidth="2"
      />
    </svg>
  ),

  'oversized-tee': () => (
    <svg viewBox="0 0 320 350" className="w-full h-full">
      <path
        d="M 60 100 
           C 60 95, 65 90, 70 90
           L 115 90
           C 120 90, 125 85, 130 80
           C 135 75, 140 70, 145 68
           C 148 67, 152 67, 155 68
           C 160 70, 165 75, 170 80
           C 175 85, 180 90, 185 90
           L 230 90
           C 235 90, 240 95, 240 100
           L 240 140
           L 220 140
           L 220 300
           C 220 310, 210 320, 200 320
           L 100 320
           C 90 320, 80 310, 80 300
           L 80 140
           L 60 140
           Z"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  ),

  'polo-shirt': () => (
    <svg viewBox="0 0 300 320" className="w-full h-full">
      {/* Main polo body */}
      <path
        d="M 90 100
           C 90 95, 95 90, 100 90
           L 130 90
           C 135 90, 140 85, 145 80
           C 147 78, 149 76, 150 76
           C 151 76, 153 78, 155 80
           C 160 85, 165 90, 170 90
           L 200 90
           C 205 90, 210 95, 210 100
           L 210 280
           C 210 285, 205 290, 200 290
           L 100 290
           C 95 290, 90 285, 90 280
           Z"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      
      {/* Short sleeves */}
      <path
        d="M 90 100 L 75 100 L 70 110 L 70 135 L 75 145 L 85 145 L 90 135"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M 210 100 L 225 100 L 230 110 L 230 135 L 225 145 L 215 145 L 210 135"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      
      {/* Polo collar */}
      <path
        d="M 135 90 L 138 75 C 142 70, 148 68, 150 68 C 152 68, 158 70, 162 75 L 165 90"
        fill="none"
        stroke="#2D3748"
        strokeWidth="2"
      />
      
      {/* Button placket */}
      <line x1="150" y1="90" x2="150" y2="130" stroke="#2D3748" strokeWidth="1"/>
    </svg>
  ),

  'blazers': () => (
    <svg viewBox="0 0 300 400" className="w-full h-full">
      {/* Main blazer body */}
      <path
        d="M 85 110
           C 85 105, 90 100, 95 100
           L 125 100
           C 130 100, 135 95, 140 90
           C 142 88, 144 86, 145 86
           C 146 86, 148 88, 150 90
           C 155 95, 160 100, 165 100
           L 205 100
           C 210 100, 215 105, 215 110
           L 215 370
           C 215 375, 210 380, 205 380
           L 95 380
           C 90 380, 85 375, 85 370
           Z"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      
      {/* Sleeves */}
      <path
        d="M 85 110 L 50 110 L 45 120 L 45 200 L 50 210 L 80 210 L 85 200"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M 215 110 L 250 110 L 255 120 L 255 200 L 250 210 L 220 210 L 215 200"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      
      {/* Lapels */}
      <path
        d="M 125 100 L 115 120 L 125 150 L 150 100"
        fill="none"
        stroke="#2D3748"
        strokeWidth="2"
      />
      <path
        d="M 175 100 L 150 100 L 175 150 L 185 120 Z"
        fill="none"
        stroke="#2D3748"
        strokeWidth="2"
      />
    </svg>
  ),

  'kurtas': () => (
    <svg viewBox="0 0 300 420" className="w-full h-full">
      {/* Main kurta body */}
      <path
        d="M 80 110
           C 80 105, 85 100, 90 100
           L 125 100
           C 130 100, 135 95, 140 90
           C 142 88, 144 86, 145 86
           C 146 86, 148 88, 150 90
           C 155 95, 160 100, 165 100
           L 210 100
           C 215 100, 220 105, 220 110
           L 220 390
           C 220 395, 215 400, 210 400
           L 90 400
           C 85 400, 80 395, 80 390
           Z"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      
      {/* Sleeves */}
      <path
        d="M 80 110 L 55 110 L 50 120 L 50 180 L 55 190 L 75 190 L 80 180"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M 220 110 L 245 110 L 250 120 L 250 180 L 245 190 L 225 190 L 220 180"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      
      {/* Traditional collar */}
      <rect x="130" y="95" width="40" height="10" 
            fill="none" 
            stroke="#2D3748" 
            strokeWidth="2" 
            rx="5"/>
      
      {/* Side slits */}
      <line x1="80" y1="360" x2="80" y2="400" stroke="#2D3748" strokeWidth="3"/>
      <line x1="220" y1="360" x2="220" y2="400" stroke="#2D3748" strokeWidth="3"/>
    </svg>
  ),

  'formal-pants': () => (
    <svg viewBox="0 0 280 450" className="w-full h-full">
      {/* Waistband */}
      <rect x="100" y="80" width="80" height="12" 
            fill="none" 
            stroke="#2D3748" 
            strokeWidth="2"/>
      
      {/* Left leg */}
      <path
        d="M 105 92 L 125 92 L 130 420 L 110 420 Z"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      
      {/* Right leg */}
      <path
        d="M 155 92 L 175 92 L 170 420 L 150 420 Z"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  ),

  'shorts': () => (
    <svg viewBox="0 0 280 220" className="w-full h-full">
      {/* Waistband */}
      <rect x="100" y="80" width="80" height="12" 
            fill="none" 
            stroke="#2D3748" 
            strokeWidth="2"/>
      
      {/* Left leg */}
      <path
        d="M 105 92 L 125 92 L 130 180 L 110 180 Z"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      
      {/* Right leg */}
      <path
        d="M 155 92 L 175 92 L 170 180 L 150 180 Z"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  ),

  'dresses': () => (
    <svg viewBox="0 0 300 420" className="w-full h-full">
      {/* Dress silhouette */}
      <path
        d="M 100 100
           C 100 95, 105 90, 110 90
           L 130 90
           C 135 90, 140 85, 145 80
           C 147 78, 149 76, 150 76
           C 151 76, 153 78, 155 80
           C 160 85, 165 90, 170 90
           L 190 90
           C 195 90, 200 95, 200 100
           L 210 150
           L 240 400
           L 60 400
           L 90 150
           Z"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      
      {/* Straps */}
      <path d="M 120 90 L 125 70" stroke="#2D3748" strokeWidth="2"/>
      <path d="M 180 90 L 175 70" stroke="#2D3748" strokeWidth="2"/>
    </svg>
  ),

  'crop-hoodie': () => (
    <svg viewBox="0 0 320 280" className="w-full h-full">
      {/* Hoodie body */}
      <path
        d="M 70 110
           C 70 105, 75 100, 80 100
           L 115 100
           C 120 100, 125 95, 130 90
           C 135 85, 140 80, 145 78
           C 148 77, 152 77, 155 78
           C 160 80, 165 85, 170 90
           C 175 95, 180 100, 185 100
           L 220 100
           C 225 100, 230 105, 230 110
           L 230 240
           C 230 245, 225 250, 220 250
           L 80 250
           C 75 250, 70 245, 70 240
           Z"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      
      {/* Hood */}
      <path
        d="M 115 100 C 110 85, 115 70, 125 60 C 135 55, 165 55, 175 60 C 185 70, 190 85, 185 100"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      
      {/* Long sleeves */}
      <path
        d="M 70 110 L 40 110 L 35 120 L 35 200 L 40 210 L 65 210 L 70 200"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M 230 110 L 260 110 L 265 120 L 265 200 L 260 210 L 235 210 L 230 200"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  ),

  'pajamas': () => (
    <svg viewBox="0 0 300 380" className="w-full h-full">
      {/* Top */}
      <path
        d="M 90 80
           C 90 75, 95 70, 100 70
           L 130 70
           C 135 70, 140 75, 145 80
           L 200 80
           C 205 80, 210 85, 210 90
           L 210 160
           C 210 165, 205 170, 200 170
           L 100 170
           C 95 170, 90 165, 90 160
           Z"
        fill="none"
        stroke="#2D3748"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      
      {/* Short sleeves */}
      <path d="M 90 90 L 75 90 L 70 100 L 70 120 L 75 130 L 85 130 L 90 120" 
            fill="none" stroke="#2D3748" strokeWidth="2"/>
      <path d="M 210 90 L 225 90 L 230 100 L 230 120 L 225 130 L 215 130 L 210 120" 
            fill="none" stroke="#2D3748" strokeWidth="2"/>
      
      {/* Bottom - loose pants */}
      <path d="M 110 180 L 125 185 L 130 350 L 115 350 Z" 
            fill="none" stroke="#2D3748" strokeWidth="2"/>
      <path d="M 175 185 L 190 180 L 185 350 L 170 350 Z" 
            fill="none" stroke="#2D3748" strokeWidth="2"/>
    </svg>
  ),

  'blazer-modern': () => (
    <svg viewBox="0 0 280 380" className="w-full h-full">
      {/* Slim blazer body */}
      <path
        d="M 95 110
           C 95 105, 100 100, 105 100
           L 125 100
           C 130 100, 135 95, 140 90
           C 142 88, 144 86, 145 86
           C 146 86, 148 88, 150 90
           C 155 95, 160 100, 165 100
           L 195 100
           C 200 100, 205 105, 205 110
           L 205 350
           C 205 355, 200 360, 195 360
           L 105 360
           C 100 360, 95 355, 95 350
           Z"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      
      {/* Fitted sleeves */}
      <path d="M 95 110 L 70 110 L 65 120 L 65 180 L 70 190 L 90 190 L 95 180" 
            fill="none" stroke="#2D3748" strokeWidth="3"/>
      <path d="M 205 110 L 230 110 L 235 120 L 235 180 L 230 190 L 210 190 L 205 180" 
            fill="none" stroke="#2D3748" strokeWidth="3"/>
      
      {/* Modern lapels */}
      <path d="M 125 100 L 120 115 L 125 135 L 145 100" 
            fill="none" stroke="#2D3748" strokeWidth="2"/>
      <path d="M 175 100 L 145 100 L 175 135 L 180 115 Z" 
            fill="none" stroke="#2D3748" strokeWidth="2"/>
    </svg>
  ),

  // Add more garments following the same realistic style...
  'nehru-jacket': () => (
    <svg viewBox="0 0 280 360" className="w-full h-full">
      <path
        d="M 95 110
           C 95 105, 100 100, 105 100
           L 195 100
           C 200 100, 205 105, 205 110
           L 205 330
           C 205 335, 200 340, 195 340
           L 105 340
           C 100 340, 95 335, 95 330
           Z"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      
      {/* Mandarin collar */}
      <rect x="125" y="95" width="50" height="8" 
            fill="none" 
            stroke="#2D3748" 
            strokeWidth="2" 
            rx="4"/>
    </svg>
  ),

  'dhoti-pants': () => (
    <svg viewBox="0 0 300 420" className="w-full h-full">
      <path d="M 90 80 L 210 80 L 200 150 L 130 390 L 110 390 L 100 150 Z" 
            fill="none" stroke="#2D3748" strokeWidth="3"/>
      <path d="M 200 150 L 230 390 L 190 390 L 170 150 Z" 
            fill="none" stroke="#2D3748" strokeWidth="3"/>
      
      <rect x="90" y="75" width="120" height="12" 
            fill="none" stroke="#2D3748" strokeWidth="2"/>
    </svg>
  ),

  'blouse': () => (
    <svg viewBox="0 0 280 300" className="w-full h-full">
      <path
        d="M 100 110
           C 100 105, 105 100, 110 100
           L 170 100
           C 175 100, 180 105, 180 110
           L 180 270
           C 180 275, 175 280, 170 280
           L 110 280
           C 105 280, 100 275, 100 270
           Z"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      
      {/* Cap sleeves */}
      <path d="M 100 115 L 85 115 L 80 125 L 80 140 L 85 150 L 95 150 L 100 140" 
            fill="none" stroke="#2D3748" strokeWidth="2"/>
      <path d="M 180 115 L 195 115 L 200 125 L 200 140 L 195 150 L 185 150 L 180 140" 
            fill="none" stroke="#2D3748" strokeWidth="2"/>
    </svg>
  ),

  'saree-blouse': () => (
    <svg viewBox="0 0 280 280" className="w-full h-full">
      <path
        d="M 105 120
           C 105 115, 110 110, 115 110
           L 165 110
           C 170 110, 175 115, 175 120
           L 175 250
           C 175 255, 170 260, 165 260
           L 115 260
           C 110 260, 105 255, 105 250
           Z"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      
      {/* Short sleeves */}
      <path d="M 105 125 L 95 125 L 90 135 L 90 150 L 95 160 L 100 160 L 105 150" 
            fill="none" stroke="#2D3748" strokeWidth="2"/>
      <path d="M 175 125 L 185 125 L 190 135 L 190 150 L 185 160 L 180 160 L 175 150" 
            fill="none" stroke="#2D3748" strokeWidth="2"/>
    </svg>
  ),

  'palazzo': () => (
    <svg viewBox="0 0 300 420" className="w-full h-full">
      {/* High waistband */}
      <rect x="110" y="80" width="80" height="12" 
            fill="none" 
            stroke="#2D3748" 
            strokeWidth="2"/>
      
      {/* Wide flowing palazzo pants */}
      <path
        d="M 115 92 L 175 92 L 220 400 L 80 400 Z"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  ),

  'waistcoat': () => (
    <svg viewBox="0 0 280 350" className="w-full h-full">
      {/* Waistcoat body with V-neck */}
      <path
        d="M 100 110
           C 100 105, 105 100, 110 100
           L 130 100
           L 140 120
           L 140 320
           C 140 325, 135 330, 130 330
           L 110 330
           C 105 330, 100 325, 100 320
           Z"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      
      <path
        d="M 180 110
           C 180 105, 175 100, 170 100
           L 150 100
           L 140 120
           L 140 320
           C 140 325, 145 330, 150 330
           L 170 330
           C 175 330, 180 325, 180 320
           Z"
        fill="none"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      
      {/* Connect the V-neck */}
      <path d="M 130 100 L 140 120 L 150 100" 
            fill="none" 
            stroke="#2D3748" 
            strokeWidth="3" 
            strokeLinejoin="round"/>
    </svg>
  )
};

export default function ModernDesignGallery({ selectedDesign, onDesignSelect, selectedColors = [] }: ModernDesignGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<string>('trending');

  const handleDesignSelect = (designId: string) => {
    onDesignSelect(designId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Design Gallery</h2>
        <p className="text-gray-600 text-sm">Choose your garment type to start designing</p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(designCategories).map(([key, category]) => (
          <Button
            key={key}
            variant={activeCategory === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(key)}
            className="text-sm"
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Design Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {designCategories[activeCategory as keyof typeof designCategories]?.designs.map((design) => {
          const isSelected = selectedDesign === design.id;
          const DesignComponent = RealisticGarmentCutouts[design.id as keyof typeof RealisticGarmentCutouts];
          
          return (
            <Card
              key={design.id}
              className={`group cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => handleDesignSelect(design.id)}
            >
              <CardContent className="p-4">
                {/* Realistic Garment Cutout */}
                <div className="aspect-square mb-3 bg-white rounded-lg flex items-center justify-center overflow-hidden relative group-hover:bg-gray-50 transition-colors">
                  {DesignComponent ? (
                    <div className="w-full h-full p-4 flex items-center justify-center">
                      <DesignComponent />
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-2xl text-gray-400">👕</span>
                    </div>
                  )}
                  
                  {/* Popularity Badge */}
                  {design.popularity > 85 && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-200">
                        <Star className="h-2 w-2 mr-1 fill-current" />
                        Popular
                      </Badge>
                    </div>
                  )}
                  
                  {/* Trending Badge */}
                  {design.popularity > 90 && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-red-500 text-white text-xs border-0">
                        <TrendingUp className="h-2 w-2 mr-1" />
                        Hot
                      </Badge>
                    </div>
                  )}

                  {/* Selection Overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-10 flex items-center justify-center">
                      <div className="bg-blue-500 text-white rounded-full p-2">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Design Info */}
                <div className="text-center space-y-2">
                  <h3 className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                    {design.name}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="outline" 
                      className="text-xs text-gray-500 border-gray-300"
                    >
                      {design.category}
                    </Badge>
                    
                    <div className="text-sm font-semibold text-green-600">
                      {design.price}
                    </div>
                  </div>

                  {/* Selection Status */}
                  {isSelected && (
                    <div className="pt-2">
                      <Badge className="bg-blue-500 text-white text-xs">
                        ✓ Selected
                      </Badge>
                    </div>
                  )}
                  
                  {/* Hover Action */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity pt-1">
                    <div className="text-xs text-gray-500">
                      {isSelected ? 'Selected' : 'Click to select'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {designCategories[activeCategory as keyof typeof designCategories]?.designs.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No designs available</h3>
          <p className="text-gray-500">Try selecting a different category</p>
        </div>
      )}

      {/* Selected Design Summary */}
      {selectedDesign && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-lg shadow-sm flex items-center justify-center">
                {RealisticGarmentCutouts[selectedDesign as keyof typeof RealisticGarmentCutouts] && (
                  <div className="w-12 h-12">
                    {React.createElement(RealisticGarmentCutouts[selectedDesign as keyof typeof RealisticGarmentCutouts])}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">
                  {Object.values(designCategories)
                    .flatMap(cat => cat.designs)
                    .find(d => d.id === selectedDesign)?.name} Selected
                </h3>
                <p className="text-gray-600 text-sm">
                  Ready for customization • {selectedColors.length} colors applied
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-green-500 text-white text-xs">
                    ✓ Design Locked
                  </Badge>
                  <span className="text-green-600 font-semibold text-sm">
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