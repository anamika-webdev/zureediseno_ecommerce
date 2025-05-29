// src/components/ProductCard.tsx
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

interface ProductVariant {
  id: string;
  size: string;
  color: string;
  stock: number;
  sleeveType?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  images: ProductImage[];
  variants: ProductVariant[];
  inStock: boolean;
  featured: boolean;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  console.log('🔥 ProductCard rendering:', product?.name, product); // Debug log
  
  // Add safety checks for undefined properties
  if (!product) {
    return null;
  }

  const images = product.images || [];
  const variants = product.variants || [];
  
  const primaryImage = images.find(img => img.isPrimary) || images[0];
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
      <Link href={`/product/${product.slug}`}>
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <Image
            src={primaryImage?.url || '/placeholder.jpg'}
            alt={primaryImage?.alt || product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Wishlist Button */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="outline"
              className="bg-white/90 hover:bg-white"
              onClick={(e) => e.preventDefault()}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 hover:text-red-600 transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-lg font-bold text-red-600">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
          )}
        </div>

        {/* Available Sizes */}
        {variants.length > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <span className="text-xs text-gray-500">Available:</span>
            <div className="flex gap-1">
              {[...new Set(variants.map(v => v.size))].slice(0, 4).map((size) => (
                <span key={size} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                  {size}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Main View Product Button */}
        <Button 
          className="w-full bg-black hover:bg-gray-800 text-white font-medium"
          asChild
        >
          <Link href={`/product/${product.slug}`}>
            View Product
          </Link>
        </Button>
      </div>
    </div>
  );
}