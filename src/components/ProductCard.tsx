'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
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
  const availableFits = ['Regular Fit', 'Slim Fit', 'Belly Fit'];

  const currentVariant = product.variants?.find(v => 
    v.color === selectedColor && 
    v.size === selectedSize && 
    (!selectedSleeve || v.sleeveType === selectedSleeve)
  );

  const isVariantInStock = currentVariant ? currentVariant.stock > 0 : true;
  const canAddToCart = product.inStock &&
    (availableColors.length === 0 || selectedColor) &&
    (availableSizes.length === 0 || selectedSize) &&
    (availableSleeves.length === 0 || !availableSleeves.length || selectedSleeve) &&
    isVariantInStock;

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setSelectedSize('');
    setSelectedSleeve('');
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setSelectedSleeve('');
  };

  const handleSleeveSelect = (sleeve: string) => {
    setSelectedSleeve(sleeve);
  };

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
      fit: selectedFit,
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
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              onError={(e) => {
                e.currentTarget.src = '/assets/images/placeholder.jpg';
              }}
            />
          </Link>
        ) : (
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
        )}

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

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300">
          <div className="absolute bottom-2 left-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              size="sm" 
              variant="secondary" 
              className="flex-1"
              onClick={handleQuickView}
              type="button"
              disabled={!hasValidSlug}
            >
              <Eye className="h-4 w-4 mr-1" />
              Quick View
            </Button>
            <Button 
              size="sm" 
              variant="secondary"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toast.success('Added to wishlist!');
              }}
              type="button"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
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

            {/* Fit Selection with relative container for absolute preview */}
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
                    {fit}
                  </button>
                ))}

                {/* Fit Preview below buttons */}
                {hoveredFit && (
                  <div className="absolute top-full mt-2 left-0 z-30 bg-white border border-gray-300 rounded-lg shadow-lg p-3 w-[220px] pointer-events-none">
                    <Image
                      src={fitImages[hoveredFit]}
                      alt={hoveredFit}
                      width={200}
                      height={200}
                      className="object-contain rounded mx-auto"
                      onError={(e) => {
                        e.currentTarget.src = '/assets/images/placeholder.jpg';
                      }}
                    />
                    <p className="text-xs text-center mt-2 font-medium text-gray-700">{hoveredFit}</p>
                  </div>
                )}
              </div>
            </div>

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
                        handleColorSelect(color);
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
                            handleSizeSelect(size);
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

            {/* Sleeve Selection */}
            {availableSleeves.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-700">
                  Sleeve: {selectedSleeve || 'Select sleeve'}
                </div>
                <div className="flex flex-wrap gap-1">
                  {getAvailableSleeves().map((sleeve) => {
                    if (!sleeve || typeof sleeve !== 'string') return null;
                    const currentAvailableSleeves = getAvailableSleeves();
                    const isAvailable = currentAvailableSleeves.includes(sleeve);
                    return (
                      <button
                        key={sleeve}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (isAvailable && sleeve && typeof sleeve === 'string') {
                            handleSleeveSelect(sleeve);
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

          {currentVariant && (
            <div className="text-xs text-gray-600">
              {currentVariant.stock} in stock
            </div>
          )}

          <Button 
            className="w-full" 
            size="sm"
            onClick={handleAddToCart}
            disabled={!canAddToCart || !product.inStock}
            type="button"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            {!product.inStock 
              ? 'Out of Stock' 
              : !selectedColor && availableColors.length > 0
              ? 'Select Color' 
              : !selectedSize && availableSizes.length > 0
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
