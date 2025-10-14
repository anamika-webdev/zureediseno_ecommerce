// src/app/(store)/product/[slug]/page.tsx - Fit only for Men's Shirts
'use client';

import { useState, useEffect, use } from 'react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, Share2, Minus, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ProductVariant {
  id: string;
  size: string;
  color: string;
  sleeveType?: string;
  fit?: string;
  stock: number;
  sku?: string;
}

interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  sku: string;
  inStock: boolean;
  featured: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  subcategory?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN').format(price);
};

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
  'navy': '#1e3a8a',
};

const getColorCode = (colorName: string): string => {
  const normalized = colorName.toLowerCase().trim();
  return colorMap[normalized] || '#6b7280';
};

export default function ProductDetailsPage({ params }: PageProps) {
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedSleeveType, setSelectedSleeveType] = useState('');
  const [selectedFit, setSelectedFit] = useState<string>('');
  const [hoveredFit, setHoveredFit] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const resolvedParams = use(params);

  // ✅ CHECK: Only show fit for Men's Shirts
  const isMensShirts = 
    product?.category?.slug?.toLowerCase() === 'men' && 
    (product?.subcategory?.slug?.toLowerCase() === 'shirts' || 
     product?.subcategory?.slug?.toLowerCase() === 'shirt');

  // Fit options and images - only for Men's Shirts
  const availableFits = isMensShirts ? ['Regular Fit', 'Slim Fit', 'Belly Fit'] : [];
  const fitImages: { [key: string]: string } = {
    'Regular Fit': '/assets/img/Fit/Regular Fit.png',
    'Slim Fit': '/assets/img/Fit/SlimFit.jpg',
    'Belly Fit': '/assets/img/Fit/BellyFit.jpg'
  };

  // Get unique options from variants
  const availableColors = product ? [...new Set(product.variants.map(v => v.color))] : [];
  const availableSizes = product ? [...new Set(product.variants.map(v => v.size))] : [];
  const availableSleeveTypes = product ? [...new Set(product.variants.map(v => v.sleeveType).filter(Boolean))] : [];

  // Fetch product on mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${resolvedParams.slug}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
          
          // Auto-select first available options
          if (data.variants && data.variants.length > 0) {
            const firstVariant = data.variants[0];
            setSelectedColor(firstVariant.color || '');
            setSelectedSize(firstVariant.size || '');
            if (firstVariant.sleeveType) setSelectedSleeveType(firstVariant.sleeveType);
            
            // Check if it's men's shirts before setting fit
            const isMensShirt = 
              data.category?.slug?.toLowerCase() === 'men' && 
              (data.subcategory?.slug?.toLowerCase() === 'shirts' || 
               data.subcategory?.slug?.toLowerCase() === 'shirt');
            
            if (firstVariant.fit && isMensShirt) setSelectedFit(firstVariant.fit);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [resolvedParams.slug]);

  // Get filtered options based on selections
  const currentAvailableSizes = selectedColor
    ? [...new Set(product?.variants.filter(v => v.color === selectedColor).map(v => v.size) || [])]
    : availableSizes;

  const currentAvailableSleeveTypes = selectedColor && selectedSize
    ? [...new Set(product?.variants.filter(v => v.color === selectedColor && v.size === selectedSize).map(v => v.sleeveType).filter(Boolean) || [])]
    : availableSleeveTypes;

  // Find current variant
  const currentVariant = product?.variants.find(v => {
    const colorMatch = v.color === selectedColor;
    const sizeMatch = v.size === selectedSize;
    const sleeveMatch = !selectedSleeveType || v.sleeveType === selectedSleeveType;
    const fitMatch = !isMensShirts || !selectedFit || v.fit === selectedFit;
    
    return colorMatch && sizeMatch && sleeveMatch && fitMatch;
  });

  const isInStock = currentVariant ? currentVariant.stock > 0 : false;
  const maxQuantity = currentVariant ? Math.min(currentVariant.stock, 10) : 1;

  const handleAddToCart = () => {
    if (!product || !currentVariant) {
      toast.error('Please select all options');
      return;
    }

    if (!isInStock) {
      toast.error('This variant is out of stock');
      return;
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url || '',
      slug: product.slug,
      size: selectedSize,
      color: selectedColor,
      sleeveType: selectedSleeveType,
      fit: isMensShirts ? selectedFit : undefined,
      variantId: currentVariant.id,
      sku: currentVariant.sku,
      quantity
    };

    addToCart(cartItem);
    toast.success(`Added ${quantity} ${quantity > 1 ? 'items' : 'item'} to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={product.images[currentImageIndex]?.url || '/placeholder.jpg'}
                alt={product.images[currentImageIndex]?.alt || product.name}
                fill
                className="object-cover"
                priority
              />
              {product.featured && (
                <Badge className="absolute top-4 left-4 bg-yellow-500">Featured</Badge>
              )}
              {product.originalPrice && product.originalPrice > product.price && (
                <Badge variant="destructive" className="absolute top-4 right-4">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </Badge>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                      currentImageIndex === index
                        ? 'border-gray-900 ring-2 ring-gray-200'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  ₹{formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ₹{formatPrice(product.originalPrice)}
                    </span>
                    <span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-semibold rounded-full">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* ✅ FIT SELECTION - ONLY FOR MEN'S SHIRTS */}
            {isMensShirts && availableFits.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Choose Your Fit
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {availableFits.map((fit) => (
                    <div
                      key={fit}
                      className="relative"
                      onMouseEnter={() => setHoveredFit(fit)}
                      onMouseLeave={() => setHoveredFit(null)}
                    >
                      <button
                        onClick={() => setSelectedFit(fit)}
                        className={`w-full py-3 px-4 border-2 rounded-lg font-semibold text-sm transition-all ${
                          selectedFit === fit
                            ? 'border-gray-900 bg-gray-900 text-white shadow-md'
                            : 'border-gray-300 hover:border-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {selectedFit === fit && <Check className="w-4 h-4 inline mr-1" />}
                        {fit.replace(' Fit', '')}
                      </button>

                      {/* Fit Preview Tooltip */}
                      {hoveredFit === fit && fitImages[fit] && (
                        <div className="absolute z-50 top-full left-1/2 transform -translate-x-1/2 mt-2 p-3 bg-white border-2 rounded-lg shadow-2xl">
                          <Image
                            src={fitImages[fit]}
                            alt={fit}
                            width={150}
                            height={150}
                            className="rounded"
                          />
                          <p className="text-sm text-center mt-2 font-semibold text-gray-900">{fit}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {availableColors.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Color: <span className="font-normal text-gray-600">{selectedColor}</span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setSelectedSize('');
                        setSelectedSleeveType('');
                      }}
                      className={`group relative flex items-center gap-2 px-4 py-2 border-2 rounded-lg transition-all ${
                        selectedColor === color
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: getColorCode(color) }}
                      />
                      <span className="font-medium text-sm">{color}</span>
                      {selectedColor === color && (
                        <Check className="w-4 h-4 text-gray-900" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Size: <span className="font-normal text-gray-600">{selectedSize || 'Select size'}</span>
                  </h3>
                  <button className="text-sm text-blue-600 hover:text-blue-800 underline">
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {availableSizes.map((size) => {
                    const isAvailable = currentAvailableSizes.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => {
                          if (isAvailable) {
                            setSelectedSize(size);
                          }
                        }}
                        disabled={!isAvailable}
                        className={`py-4 border-2 rounded-lg font-bold text-lg transition-all ${
                          selectedSize === size
                            ? 'border-gray-900 bg-gray-900 text-white shadow-md'
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

            {/* Sleeve Type Selection */}
            {availableSleeveTypes.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Sleeve Type: <span className="font-normal text-gray-600">{selectedSleeveType || 'Select sleeve'}</span>
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {availableSleeveTypes.map((sleeve) => {
                    const isAvailable = currentAvailableSleeveTypes.includes(sleeve);
                    return (
                      <button
                        key={sleeve}
                        onClick={() => {
                          if (isAvailable && sleeve) {
                            setSelectedSleeveType(sleeve);
                          }
                        }}
                        disabled={!isAvailable}
                        className={`py-3 px-4 border-2 rounded-lg font-semibold text-sm transition-all ${
                          selectedSleeveType === sleeve
                            ? 'border-gray-900 bg-gray-900 text-white shadow-md'
                            : isAvailable
                            ? 'border-gray-300 hover:border-gray-500 hover:bg-gray-50'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {selectedSleeveType === sleeve && <Check className="w-4 h-4 inline mr-1" />}
                        {sleeve}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 font-semibold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    className="p-3 hover:bg-gray-100 transition-colors"
                    disabled={quantity >= maxQuantity}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {currentVariant && (
                  <span className="text-sm text-gray-600">
                    {currentVariant.stock} items available
                  </span>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {isInStock ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-medium">In Stock</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-700 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={!isInStock || !currentVariant}
                className="w-full py-6 text-lg font-semibold"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {isInStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="py-6 text-base font-semibold"
                  onClick={() => toast.info('Added to wishlist!')}
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Wishlist
                </Button>
                <Button
                  variant="outline"
                  className="py-6 text-base font-semibold"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied to clipboard!');
                  }}
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Product Info */}
            <div className="border-t pt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">SKU:</span>
                <span className="font-medium">{product.sku}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium">{product.category.name}</span>
              </div>
              {product.subcategory && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subcategory:</span>
                  <span className="font-medium">{product.subcategory.name}</span>
                </div>
              )}
              {currentVariant?.sku && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Variant SKU:</span>
                  <span className="font-medium">{currentVariant.sku}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}