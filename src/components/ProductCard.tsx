// src/components/ProductCard.tsx - FIXED to work with your database structure
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { useState } from 'react';

interface ProductImage {
  id?: string;
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

interface ProductVariant {
  id?: string;
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
  images: ProductImage[] | string[]; // Support both formats
  variants: ProductVariant[];
  inStock: boolean;
  featured: boolean;
  description?: string;
  sku?: string;
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
  'grey': '#6b7280',
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
  return colorMap[normalizedColor] || '#6b7280';
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN').format(price);
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedSleeve, setSelectedSleeve] = useState<string>('');

  // Handle both image formats - array of objects or array of strings
  const getImageUrl = (): string => {
    if (!product.images || product.images.length === 0) {
      return '/assets/images/placeholder.jpg';
    }

    // If images is array of strings (from your database)
    if (typeof product.images[0] === 'string') {
      return product.images[0] as string;
    }

    // If images is array of objects
    const imageObjects = product.images as ProductImage[];
    const primaryImage = imageObjects.find(img => img.isPrimary) || imageObjects[0];
    return primaryImage?.url || '/assets/images/placeholder.jpg';
  };

  // Get unique options from variants
  const availableColors = [...new Set(product.variants?.map(v => v.color) || [])];
  const availableSizes = [...new Set(product.variants?.map(v => v.size) || [])];
  const availableSleeves = [...new Set(product.variants?.filter(v => v.sleeveType).map(v => v.sleeveType!) || [])];

  // Get available options based on current selections
  const getAvailableSizes = () => {
    if (!selectedColor) return availableSizes;
    
    const filtered = product.variants?.filter(variant => {
      const colorMatch = variant.color === selectedColor;
      const sleeveMatch = !selectedSleeve || variant.sleeveType === selectedSleeve;
      return colorMatch && sleeveMatch && variant.stock > 0;
    }) || [];
    return [...new Set(filtered.map(v => v.size))];
  };

  const getAvailableSleeves = () => {
    if (!selectedColor && !selectedSize) return availableSleeves;
    
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
    // Check if current sleeve is still available with new size
    const availableSleeveForSize = getAvailableSleeves();
    if (selectedSleeve && !availableSleeveForSize.includes(selectedSleeve)) {
      setSelectedSleeve('');
    }
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
      price: product.price,
      image: getImageUrl(),
      slug: product.slug,
      size: selectedSize,
      color: selectedColor,
      quantity: 1
    });

    toast.success('Added to cart!');
    
    // Reset selections
    setSelectedColor('');
    setSelectedSize('');
    setSelectedSleeve('');
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={getImageUrl()}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.featured && (
            <Badge className="bg-yellow-500 hover:bg-yellow-600">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
          {product.originalPrice && product.originalPrice > product.price && (
            <Badge variant="destructive">
              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-3 right-3 bg-white/80 hover:bg-white"
        >
          <Heart className="w-4 h-4" />
        </Button>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Product Info */}
        <div className="space-y-2">
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-semibold text-lg hover:text-blue-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
          
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-green-600">
              ₹{formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                ₹{formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Color Selection */}
        {availableColors.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Colors:</p>
            <div className="flex flex-wrap gap-2">
              {availableColors.map((color) => {
                const isAvailable = product.variants?.some(v => 
                  v.color === color && v.stock > 0
                );
                return (
                  <button
                    key={color}
                    onClick={() => isAvailable ? handleColorSelect(color) : null}
                    disabled={!isAvailable}
                    className={`
                      w-8 h-8 rounded-full border-2 transition-all duration-200
                      ${selectedColor === color 
                        ? 'border-blue-500 scale-110' 
                        : 'border-gray-300 hover:border-gray-400'
                      }
                      ${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    style={{ 
                      backgroundColor: getColorCode(color),
                      borderColor: color.toLowerCase() === 'white' ? '#d1d5db' : undefined
                    }}
                    title={color}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Size Selection */}
        {availableSizes.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Sizes:</p>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => {
                const isAvailable = getAvailableSizes().includes(size);
                return (
                  <button
                    key={size}
                    onClick={() => isAvailable ? handleSizeSelect(size) : null}
                    disabled={!isAvailable}
                    className={`
                      px-3 py-1 text-sm border rounded transition-all duration-200
                      ${selectedSize === size 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 hover:border-gray-400'
                      }
                      ${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sleeve Type Selection */}
        {availableSleeves.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Sleeve Type:</p>
            <div className="flex flex-wrap gap-2">
              {availableSleeves.map((sleeve) => {
                const isAvailable = getAvailableSleeves().includes(sleeve);
                return (
                  <button
                    key={sleeve}
                    onClick={() => isAvailable ? handleSleeveSelect(sleeve) : null}
                    disabled={!isAvailable}
                    className={`
                      px-3 py-1 text-sm border rounded transition-all duration-200
                      ${selectedSleeve === sleeve 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 hover:border-gray-400'
                      }
                      ${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {sleeve}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Stock Status */}
        {currentVariant && (
          <div className="text-sm">
            {currentVariant.stock > 0 ? (
              <span className="text-green-600">
                {currentVariant.stock} in stock
              </span>
            ) : (
              <span className="text-red-600">Out of stock</span>
            )}
          </div>
        )}

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={!canAddToCart}
          className="w-full"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {!product.inStock 
            ? 'Out of Stock'
            : !canAddToCart 
            ? 'Select Options'
            : 'Add to Cart'
          }
        </Button>
      </CardContent>
    </Card>
  );
}