// src/components/ProductCard.tsx - Fit option only for Men's Shirts
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ProductVariant {
  id: string;
  size: string;
  color: string;
  stock: number;
  sku?: string;
  sleeveType?: string;
  fit?: string;
}

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number;
    images: string[];
    featured: boolean;
    inStock: boolean;
    variants?: ProductVariant[];
    category?: {
      name: string;
      slug: string;
    };
    subcategory?: {
      name: string;
      slug: string;
    };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedSleeve, setSelectedSleeve] = useState<string>('');
  const [selectedFit, setSelectedFit] = useState<string>('');
  const [hoveredFit, setHoveredFit] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // ✅ CHECK: Only show fit for Men's Shirts category
  const isMensShirts = 
    product.category?.slug?.toLowerCase() === 'men' && 
    (product.subcategory?.slug?.toLowerCase() === 'shirts' || 
     product.subcategory?.slug?.toLowerCase() === 'shirt');

  const fitImages: { [key: string]: string } = {
    'Regular Fit': '/assets/img/Fit/Regular Fit.png',
    'Slim Fit': '/assets/img/Fit/SlimFit.jpg',
    'Belly Fit': '/assets/img/Fit/BellyFit.jpg'
  };

  const imageUrl = product.images && product.images.length > 0 
    ? product.images[currentImageIndex] 
    : '/assets/images/placeholder.jpg';

  const availableColors = [...new Set(product.variants?.map(v => v.color).filter(Boolean) || [])];
  const availableSizes = [...new Set(product.variants?.map(v => v.size).filter(Boolean) || [])];
  const availableSleeves = [...new Set(
    product.variants?.map(v => v.sleeveType)
      .filter((sleeve): sleeve is string => sleeve !== undefined && sleeve !== null && sleeve.trim() !== '') 
      || []
  )];
  
  // ✅ Only show fit options for Men's Shirts
  const availableFits = isMensShirts ? ['Regular Fit', 'Slim Fit', 'Belly Fit'] : [];

  const currentVariant = product.variants?.find(v => {
    const colorMatch = v.color === selectedColor;
    const sizeMatch = v.size === selectedSize;
    const sleeveMatch = !selectedSleeve || v.sleeveType === selectedSleeve;
    const fitMatch = !isMensShirts || !selectedFit || v.fit === selectedFit;
    
    return colorMatch && sizeMatch && sleeveMatch && fitMatch;
  });

  const isVariantInStock = currentVariant ? currentVariant.stock > 0 : true;
  
  const canAddToCart = product.inStock &&
    (availableColors.length === 0 || selectedColor) &&
    (availableSizes.length === 0 || selectedSize) &&
    (availableSleeves.length === 0 || !availableSleeves.length || selectedSleeve) &&
    (availableFits.length === 0 || selectedFit) && // ✅ Fit required only if availableFits exists
    isVariantInStock;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!canAddToCart) {
      toast.error('Please select all required options');
      return;
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: imageUrl,
      slug: product.slug,
      size: selectedSize || 'One Size',
      color: selectedColor || 'Default',
      sleeveType: selectedSleeve,
      fit: isMensShirts ? selectedFit : undefined, // ✅ Only include fit for Men's Shirts
      variantId: currentVariant?.id,
      sku: currentVariant?.sku
    };

    addToCart(cartItem);
    toast.success('Added to cart!');
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.slug && typeof product.slug === 'string' && product.slug.trim()) {
      router.push(`/product/${product.slug}`);
    } else {
      toast.error('Product page not available');
    }
  };

  const getAvailableSizes = (): string[] => {
    if (!selectedColor) return availableSizes;
    return [...new Set(
      product.variants?.filter(v => v.color === selectedColor)
        .map(v => v.size)
        .filter(Boolean) || []
    )];
  };

  const getAvailableSleeves = (): string[] => {
    if (!selectedColor || !selectedSize) return availableSleeves;
    return [...new Set(
      product.variants?.filter(v => 
        v.color === selectedColor && v.size === selectedSize
      ).map(v => v.sleeveType)
      .filter((sleeve): sleeve is string => sleeve !== undefined && sleeve !== null && sleeve.trim() !== '') 
      || []
    )];
  };

  const productUrl = product.slug && product.slug.trim() ? `/product/${product.slug}` : '#';
  const hasValidSlug = productUrl !== '#';

  return (
    <Card className="group relative overflow-visible hover:shadow-lg transition-all duration-300">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {hasValidSlug ? (
          <Link href={productUrl}>
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          </Link>
        ) : (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {product.featured && (
            <Badge className="bg-yellow-500 hover:bg-yellow-600">Featured</Badge>
          )}
          {product.originalPrice && product.originalPrice > product.price && (
            <Badge variant="destructive">
              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full bg-white/90 hover:bg-white"
            onClick={handleQuickView}
            type="button"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full bg-white/90 hover:bg-white"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toast.info('Added to wishlist!');
            }}
            type="button"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          {hasValidSlug ? (
            <Link href={productUrl}>
              <h3 className="font-semibold text-sm hover:text-primary transition-colors line-clamp-2">
                {product.name}
              </h3>
            </Link>
          ) : (
            <h3 className="font-semibold text-sm line-clamp-2">
              {product.name}
            </h3>
          )}

          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">₹{product.price.toFixed(2)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                ₹{product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Options stacked vertically */}
          <div className="space-y-3">
            {/* ✅ FIT SELECTION - ONLY FOR MEN'S SHIRTS */}
            {isMensShirts && availableFits.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-700">
                  Fit: {selectedFit || 'Select fit'}
                </div>
                <div className="flex flex-wrap gap-1 relative">
                  {availableFits.map((fit) => (
                    <button
                      key={fit}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedFit(fit);
                      }}
                      onMouseEnter={() => setHoveredFit(fit)}
                      onMouseLeave={() => setHoveredFit(null)}
                      className={`px-2 py-1 text-xs font-medium border rounded transition-all ${
                        selectedFit === fit
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-300 hover:border-gray-500 hover:bg-gray-50'
                      }`}
                      type="button"
                    >
                      {fit.replace(' Fit', '')}
                    </button>
                  ))}

                  {/* Fit Preview Tooltip */}
                  {hoveredFit && fitImages[hoveredFit] && (
                    <div className="absolute z-50 bottom-full left-0 mb-2 p-2 bg-white border rounded-lg shadow-xl">
                      <Image
                        src={fitImages[hoveredFit]}
                        alt={hoveredFit}
                        width={120}
                        height={120}
                        className="rounded"
                      />
                      <p className="text-xs text-center mt-1 font-medium">{hoveredFit}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {availableColors.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-700">
                  Color: {selectedColor || 'Select color'}
                </div>
                <div className="flex flex-wrap gap-1">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedColor(color);
                        setSelectedSize('');
                        setSelectedSleeve('');
                      }}
                      className={`px-2 py-1 text-xs font-medium border rounded transition-all ${
                        selectedColor === color
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-300 hover:border-gray-500 hover:bg-gray-50'
                      }`}
                      type="button"
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-700">
                  Size: {selectedSize || 'Select size'}
                </div>
                <div className="flex flex-wrap gap-1">
                  {getAvailableSizes().map((size) => {
                    const currentAvailableSizes = getAvailableSizes();
                    const isAvailable = currentAvailableSizes.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (isAvailable && size) {
                            setSelectedSize(size);
                            setSelectedSleeve('');
                          }
                        }}
                        disabled={!isAvailable}
                        className={`px-2 py-1 text-xs font-medium border rounded transition-all ${
                          selectedSize === size
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : isAvailable
                            ? 'border-gray-300 hover:border-gray-500 hover:bg-gray-50'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        type="button"
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
              <div>
                <div className="text-xs font-medium text-gray-700">
                  Sleeve: {selectedSleeve || 'Select sleeve'}
                </div>
                <div className="flex flex-wrap gap-1">
                  {getAvailableSleeves().map((sleeve) => {
                    const currentAvailableSleeves = getAvailableSleeves();
                    const isAvailable = currentAvailableSleeves.includes(sleeve);
                    return (
                      <button
                        key={sleeve}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (isAvailable) {
                            setSelectedSleeve(sleeve);
                          }
                        }}
                        disabled={!isAvailable}
                        className={`px-2 py-1 text-xs font-medium border rounded transition-all ${
                          selectedSleeve === sleeve
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : isAvailable
                            ? 'border-gray-300 hover:border-gray-500 hover:bg-gray-50'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        type="button"
                      >
                        {sleeve}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Stock Status */}
          {!isVariantInStock && (
            <p className="text-xs text-red-600 font-medium">Out of stock</p>
          )}

          {/* Add to Cart Button */}
          <Button
            className="w-full"
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            type="button"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {canAddToCart ? 'Add to Cart' : 'Select Options'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}