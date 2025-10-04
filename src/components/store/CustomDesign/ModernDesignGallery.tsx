// src/components/store/CustomDesign/ModernDesignGallery.tsx
'use client';

import React from 'react';
import { Palette } from 'lucide-react';
import Image from 'next/image';

interface ModernDesignGalleryProps {
  selectedDesign: string;
  onDesignSelect: (designId: string) => void;
  previewColors: string[];
  setPreviewColors: (colors: string[]) => void;
}

interface GarmentType {
  name: string;
  imagePath: string;
  icon: React.ReactNode;
}

const ModernDesignGallery: React.FC<ModernDesignGalleryProps> = ({
  selectedDesign,
  onDesignSelect,
  previewColors = ['#E5E7EB'],
  setPreviewColors,
}) => {
  const garmentTypes: GarmentType[] = [
    {
      name: 'Full Shirts',
      imagePath: '/assets/img/Design gallery/FullShirt.png',
      icon: (
        <div className="w-24 h-24 relative">
          <Image
            src="/assets/img/Design gallery/FullShirt.png"
            alt="Full Shirt"
            fill
            className="object-contain"
          />
        </div>
      ),
    },
    {
      name: 'Half Shirts',
      imagePath: '/assets/img/Design gallery/Half Shirt.png',
      icon: (
        <div className="w-24 h-24 relative">
          <Image
            src="/assets/img/Design gallery/Half Shirt.png"
            alt="Half Shirt"
            fill
            className="object-contain"
          />
        </div>
      ),
    },
    {
      name: 'T-Shirts',
      imagePath: '/assets/img/Design gallery/T-Shirt (2).png',
      icon: (
        <div className="w-24 h-24 relative">
          <Image
            src="/assets/img/Design gallery/T-Shirt (2).png"
            alt="T-Shirt"
            fill
            className="object-contain"
          />
        </div>
      ),
    },
    {
      name: 'Kurtas',
      imagePath: '/assets/img/Design gallery/Kurta.png',
      icon: (
        <div className="w-24 h-24 relative">
          <Image
            src="/assets/img/Design gallery/Kurta.png"
            alt="Kurta"
            fill
            className="object-contain"
          />
        </div>
      ),
    },
    {
      name: 'Pants',
      imagePath: '/assets/img/Design gallery/Pants.png',
      icon: (
        <div className="w-24 h-24 relative">
          <Image
            src="/assets/img/Design gallery/Pants.png"
            alt="Pants"
            fill
            className="object-contain"
          />
        </div>
      ),
    },
    {
      name: 'Pajamas',
      imagePath: '/assets/img/Design gallery/Pajamas.png',
      icon: (
        <div className="w-24 h-24 relative">
          <Image
            src="/assets/img/Design gallery/Pajamas.png"
            alt="Pajamas"
            fill
            className="object-contain"
          />
        </div>
      ),
    },
    {
      name: 'Blazers',
      imagePath: '/assets/img/Design gallery/Blazer.png',
      icon: (
        <div className="w-24 h-24 relative">
          <Image
            src="/assets/img/Design gallery/Blazer.png"
            alt="Blazer"
            fill
            className="object-contain"
          />
        </div>
      ),
    },
    {
      name: 'Dresses',
      imagePath: '/assets/img/Design gallery/Dress.png',
      icon: (
        <div className="w-24 h-24 relative">
          <Image
            src="/assets/img/Design gallery/Dress.png"
            alt="Dress"
            fill
            className="object-contain"
          />
        </div>
      ),
    },
    {
      name: 'Shorts',
      imagePath: '/assets/img/Design gallery/Shorts.png',
      icon: (
        <div className="w-24 h-24 relative">
          <Image
            src="/assets/img/Design gallery/Shorts.png"
            alt="Shorts"
            fill
            className="object-contain"
          />
        </div>
      ),
    }
  ];

  const handleGarmentClick = (garment: GarmentType) => {
    const designId = garment.name.toLowerCase().replace(/\s+/g, '-');
    onDesignSelect(designId);
  };

  return (
    <div>
      {/* Garment Grid - 4 columns with better spacing */}
      <div className="grid grid-cols-4 gap-3">
        {garmentTypes.map((item, index) => {
          const designId = item.name.toLowerCase().replace(/\s+/g, '-');
          const isSelected = selectedDesign === designId;
          
          return (
            <div
              key={index}
              onClick={() => handleGarmentClick(item)}
              className={`bg-white rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer transition-all group border-2 ${
                isSelected
                  ? 'border-orange-500 bg-orange-50 shadow-lg'
                  : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
              }`}
            >
              <div className="flex flex-col items-center justify-center">
                {item.icon}
                <p className="text-xs font-medium text-gray-700 mt-2">{item.name}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ModernDesignGallery;