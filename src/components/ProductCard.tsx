// src/components/ProductCard.tsx - Enhanced with color palette and admin control
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';
import { useState } from 'react';

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
  price: number | string;
  originalPrice?: number | string;
  images: ProductImage[];
  variants: ProductVariant[];
  inStock: boolean;
  featured: boolean;
  sortOrder?: number; // For display ordering
}

interface ProductCardProps {
  product: Product;
}

// Color palette mapping for better UI
const colorMap: Record<string, string> = {
  'white': '#ffffff',
  'black': '#000000',
  'red': '#ef4444',
  'blue': '#3b82f6',
  'green': '#10b981',
  'yellow': '#f59e0b',
  'purple': '#8b5cf6',
  'pink': '#ec4899',
  'gray': '#6b7280',
  'orange': '#f97316',
  'indigo': '#6366f1',
  'teal': '#14b8a6',
  'cyan': '#06b6d4',
  'lime': '#84cc16',
  'amber': '#f59e0b',
  'emerald': '#10b981',
  'rose': '#f43f5e',
  'navy': '#1e3a8a',
  'maroon': '#7f1d1d',
  'brown': '#92400e',
  'beige': '#d2b48c',
  'cream': '#fffdd0',
  'ivory': '#fffff0',
  'khaki': '#f0e68c',
  'olive': '#808000',
  'silver': '#c0c0c0',
  'gold': '#ffd700',
  'bronze': '#cd7f32',
};

const getColorCode = (colorName: string): string => {
  const normalizedColor = colorName.toLowerCase().trim();
  return colorMap[normalizedColor] || '#6b7280'; // Default gray if color not found
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedSleeve, setSelectedSleeve] = useState<string>('');

  // Get primary image or fallback to first image
  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  const imageUrl = primaryImage?.url || '/assets/images/placeholder.jpg';
  
  // Get unique options from variants
  const availableColors = [...new Set(product.variants?.map(v => v.color) || [])];
  const availableSizes = [...new Set(product.variants?.map(v => v.size) || [])];
  const availableSleeves = [...new Set(product.variants?.filter(v => v.sleeveType).map(v => v.sleeveType!) || [])];

  // Get available options based on current selections
  const getFilteredVariants = () => {
    return product.variants?.filter(variant => {
      const colorMatch = !selectedColor || variant.color === selectedColor;
      const sizeMatch = !selectedSize || variant.size === selectedSize;
      const sleeveMatch = !selectedSleeve || variant.sleeveType === selectedSleeve;
      return colorMatch && sizeMatch && sleeveMatch && variant.stock > 0;
    }) || [];
  };

  const getAvailableSizes = () => {
    const filtered = product.variants?.filter(variant => {
      const colorMatch = !selectedColor || variant.color === selectedColor;
      const sleeveMatch = !selectedSleeve || variant.sleeveType === selectedSleeve;
      return colorMatch && sleeveMatch && variant.stock > 0;
    }) || [];
    return [...new Set(filtered.map(v => v.size))];
  };

  const getAvailableSleeves = () => {
    const filtered = product.variants?.filter(variant => {
      const colorMatch = !selectedColor || variant.color === selectedColor;
      const sizeMatch = !selectedSize || variant.size === selectedSize;
      return colorMatch && sizeMatch && variant.stock > 0;
    }) || [];
    return [...new Set(filtered.map(v => v.sleeveType).filter(Boolean))];
  };

  const currentVariant = product.variants?.find(v => 
    v.color === selectedColor && 
    v.size === selectedSize && 
    (!selectedSleeve || v.sleeveType === selectedSleeve)
  );

  const isVariantInStock = currentVariant && currentVariant.stock > 0;
  const canAddToCart = selectedColor && selectedSize && (!availableSleeves.length || selectedSleeve) && isVariantInStock;

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    // Reset size and sleeve if they become unavailable
    const availableSizesForColor = getAvailableSizes();
    if (selectedSize && !availableSizesForColor.includes(selectedSize)) {
      setSelectedSize('');
    }
    const availableSleeveForColor = getAvailableSleeves();
    if (selectedSleeve && !availableSleeveForColor.includes(selectedSleeve)) {
      setSelectedSleeve('');
    }
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
  };

  const handleSleeveSelect = (sleeve: string) => {
    setSelectedSleeve(sleeve);
  };

  const handleAddToCart = () => {
    if (!canAddToCart) {
      toast.error('Please select all required options');
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: parseFloat(formatPrice(product.price)),
      image: imageUrl,
      slug: product.slug,
      size: selectedSize,
      color: selectedColor,
      quantity: 1
    });

    toast.success('Added to cart!');
  };

  const handleQuickView = () => {
    window.location.href = `/product/${product.slug}`;
  };

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Link href={`/product/${product.slug}`}>
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            onError={(e) => {
              e.currentTarget.src = '/assets/images/placeholder.jpg';
            }}
          />
        </Link>
        
        {/* Only Featured Badge */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.featured && (
            <Badge className="bg-yellow-500 text-white">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
          {!product.inStock && (
            <Badge variant="secondary">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Action Buttons - Show on Hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300">
          <div className="absolute bottom-2 left-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              size="sm" 
              variant="secondary" 
              className="flex-1"
              onClick={handleQuickView}
            >
              Quick View
            </Button>
            <Button size="sm" variant="secondary">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Product Name */}
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-medium text-sm leading-tight hover:text-gray-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">
              ₹{formatPrice(product.price)}
            </span>
          </div>

          {/* Color Selection */}
          {availableColors.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-700">
                Color: {selectedColor || 'Select color'}
              </div>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                      selectedColor === color
                        ? 'border-gray-900 shadow-lg scale-110'
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: getColorCode(color) }}
                    title={color}
                  >
                    {selectedColor === color && (
                      <div className="w-full h-full rounded-full border-2 border-white flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-900 rounded-full opacity-50"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {availableSizes.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-700">
                Size: {selectedSize || 'Select size'}
              </div>
              <div className="flex flex-wrap gap-1">
                {availableSizes.map((size) => {
                  const availableSizesForSelection = getAvailableSizes();
                  const isAvailable = availableSizesForSelection.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => isAvailable && handleSizeSelect(size)}
                      disabled={!isAvailable}
                      className={`px-2 py-1 text-xs font-medium border rounded transition-all ${
                        selectedSize === size
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : isAvailable
                          ? 'border-gray-300 hover:border-gray-500 hover:bg-gray-50'
                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sleeve Selection */}
          {availableSleeves.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-700">
                Sleeve: {selectedSleeve || 'Select sleeve'}
              </div>
              <div className="flex flex-wrap gap-1">
                {availableSleeves.map((sleeve) => {
                  const availableSleeveForSelection = getAvailableSleeves();
                  const isAvailable = availableSleeveForSelection.includes(sleeve);
                  return (
                    <button
                      key={sleeve}
                      onClick={() => isAvailable && handleSleeveSelect(sleeve)}
                      disabled={!isAvailable}
                      className={`px-2 py-1 text-xs font-medium border rounded transition-all ${
                        selectedSleeve === sleeve
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : isAvailable
                          ? 'border-gray-300 hover:border-gray-500 hover:bg-gray-50'
                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {sleeve}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Info */}
          {currentVariant && (
            <div className="text-xs text-gray-600">
              {currentVariant.stock} in stock
            </div>
          )}

          {/* Add to Cart Button */}
          <Button 
            className="w-full" 
            size="sm"
            onClick={handleAddToCart}
            disabled={!canAddToCart || !product.inStock}
          >
            {!product.inStock 
              ? 'Out of Stock' 
              : !selectedColor 
              ? 'Select Color' 
              : !selectedSize 
              ? 'Select Size'
              : availableSleeves.length > 0 && !selectedSleeve
              ? 'Select Sleeve'
              : !isVariantInStock
              ? 'Out of Stock'
              : 'Add to Cart'
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}