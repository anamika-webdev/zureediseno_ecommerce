'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImageGalleryProps {
  images: { url: string; alt?: string }[];
  productName: string;
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Fallback to default image if no images provided
  const galleryImages = images.length > 0 
    ? images 
    : [{ url: '/assets/img/cloth.jpg', alt: productName }];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={galleryImages[selectedImage].url}
          alt={galleryImages[selectedImage].alt || productName}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Thumbnail Images */}
      {galleryImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {galleryImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                selectedImage === index
                  ? 'border-black'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt || `${productName} ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}