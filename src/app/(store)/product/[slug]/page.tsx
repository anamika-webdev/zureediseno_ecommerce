// src/app/(store)/product/[slug]/page.tsx
"use client";

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Minus, Plus, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import SizeChart from '@/components/store/SizeChart';

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
    name: string;
    slug: string;
  };
  sortOrder?: number;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Utility function to format price
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN').format(price);
};

// Enhanced color mapping
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
  'lavender': '#e6e6fa',
  'mint': '#98fb98',
  'coral': '#ff7f50',
  'turquoise': '#40e0d0',
};

const getColorCode = (colorName: string): string => {
  const normalizedColor = colorName.toLowerCase().trim();
  return colorMap[normalizedColor] || '#6b7280';
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

  // Fit options and images
  const availableFits = ['Regular Fit', 'Slim Fit', 'Belly Fit'];
  const fitImages: { [key: string]: string } = {
    'Regular Fit': '/assets/img/Fit/Regular Fit.png',
    'Slim Fit': '/assets/img/Fit/SlimFit.jpg',
    'Belly Fit': '/assets/img/Fit/BellyFit.jpg'
  };

  // Get unique options from variants
  const availableColors = product ? [...new Set(product.variants.map(v => v.color))] : [];
  const availableSizes = product ? [...new Set(product.variants.map(v => v.size))] : [];
  const availableSleeveTypes = product ? 
    [...new Set(product.variants.map(v => v.sleeveType).filter(Boolean))] : [];

  // Get available options based on current selections
  const currentAvailableColors = selectedSize || selectedSleeveType
    ? [...new Set(product?.variants
        .filter(v => (!selectedSize || v.size === selectedSize) && (!selectedSleeveType || v.sleeveType === selectedSleeveType))
        .map(v => v.color) || [])]
    : availableColors;

  const currentAvailableSizes = selectedColor || selectedSleeveType
    ? [...new Set(product?.variants
        .filter(v => (!selectedColor || v.color === selectedColor) && (!selectedSleeveType || v.sleeveType === selectedSleeveType))
        .map(v => v.size) || [])]
    : availableSizes;

  const currentAvailableSleeveTypes = selectedColor || selectedSize
    ? [...new Set(product?.variants
        .filter(v => (!selectedColor || v.color === selectedColor) && (!selectedSize || v.size === selectedSize))
        .map(v => v.sleeveType)
        .filter(Boolean) || [])]
    : availableSleeveTypes;

  // Find current variant and check stock
  const currentVariant = product?.variants.find(v => 
    v.size === selectedSize && 
    v.color === selectedColor && 
    (!selectedSleeveType || v.sleeveType === selectedSleeveType)
  );

  const maxQuantity = currentVariant?.stock || 0;
  const isInStock = maxQuantity > 0;

  // Load product data from API
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/products/${resolvedParams.slug}`);
        
        if (response.ok) {
          const productData = await response.json();
          setProduct(productData);
          
          if (productData.variants && productData.variants.length > 0) {
            const firstVariant = productData.variants[0];
            setSelectedColor(firstVariant.color || '');
            setSelectedSize(firstVariant.size || '');
            if (firstVariant.sleeveType) {
              setSelectedSleeveType(firstVariant.sleeveType);
            }
          }
        } else {
          console.error('Product not found');
          setProduct(null);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [resolvedParams.slug]);

  const handleAddToCart = () => {
    if (!product || !selectedSize || !selectedColor) {
      toast.error('Please select size and color');
      return;
    }

    if (availableSleeveTypes.length > 0 && !selectedSleeveType) {
      toast.error('Please select sleeve type');
      return;
    }

    if (!selectedFit) {
      toast.error('Please select a fit');
      return;
    }

    if (!isInStock) {
      toast.error('Selected combination is out of stock');
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url || '/placeholder.jpg',
      slug: product.slug,
      size: selectedSize,
      color: selectedColor,
      fit: selectedFit,
      quantity: quantity
    });

    toast.success(`Added ${quantity} ${product.name} to cart!`);
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const nextImage = () => {
    if (product && product.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product && product.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-200 rounded-lg h-96"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link href="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link href="/products" className="hover:text-gray-900 transition-colors">Shop</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link href={`/products/${product.category.slug}`} className="hover:text-gray-900 transition-colors">
            {product.category.name}
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Product Images */}
            <div className="p-8 lg:p-12">
              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4 group">
                {product.images && product.images.length > 0 && (
                  <Image
                    src={product.images[currentImageIndex]?.url || '/placeholder.jpg'}
                    alt={product.images[currentImageIndex]?.alt || product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                )}
                
                {/* Navigation Arrows */}
                {product.images && product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
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
            <div className="p-8 lg:p-12 space-y-6">
              {/* Product Title and Price */}
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

              {/* Fit Selection */}
              {availableFits.length > 0 && (
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
                          {fit}
                        </button>
                        
                        {/* Fit Image Tooltip */}
                        {hoveredFit === fit && fitImages[fit] && (
                          <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl">
                            <Image
                              src={fitImages[fit]}
                              alt={fit}
                              width={120}
                              height={160}
                              className="rounded"
                            />
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
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Color
                    </h3>
                    <span className="text-sm text-gray-600 font-medium">
                      {selectedColor || 'Select color'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {availableColors.map((color) => {
                      const isAvailable = currentAvailableColors.includes(color);
                      const isSelected = selectedColor === color;
                      const colorCode = getColorCode(color);
                      
                      return (
                        <button
                          key={color}
                          onClick={() => isAvailable && setSelectedColor(color)}
                          disabled={!isAvailable}
                          className={`group relative flex items-center gap-3 px-4 py-3 border-2 rounded-lg font-semibold transition-all ${
                            isSelected
                              ? 'border-gray-900 bg-gray-50 shadow-md'
                              : isAvailable
                              ? 'border-gray-300 hover:border-gray-500 hover:bg-gray-50'
                              : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full border-2 ${
                              colorCode === '#ffffff' ? 'border-gray-300' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: colorCode }}
                          />
                          <span className="text-sm">{color}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sleeve Type Selection */}
              {availableSleeveTypes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Sleeve Type
                    </h3>
                    <span className="text-sm text-gray-600 font-medium">
                      {selectedSleeveType || 'Select sleeve'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {availableSleeveTypes.map((sleeveType) => {
                      const isAvailable = currentAvailableSleeveTypes.includes(sleeveType);
                      const isSelected = selectedSleeveType === sleeveType;
                      const displayName = sleeveType || 'Standard';
                      
                      return (
                        <button
                          key={sleeveType || 'standard'}
                          onClick={() => isAvailable && setSelectedSleeveType(sleeveType || '')}
                          disabled={!isAvailable}
                          className={`py-3 px-4 border-2 rounded-lg font-semibold text-sm transition-all ${
                            isSelected
                              ? 'border-gray-900 bg-gray-900 text-white shadow-md'
                              : isAvailable
                              ? 'border-gray-300 hover:border-gray-500 hover:bg-gray-50'
                              : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {displayName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection with Size Guide */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Size
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 font-medium">
                      {selectedSize || 'Select size'}
                    </span>
                    
                    {/* Size Guide Button with Dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="text-sm text-blue-600 hover:text-blue-800 underline transition-colors">
                          Size Guide
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Size Guide</DialogTitle>
                        </DialogHeader>
                        <SizeChart />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {['S', 'M', 'L', 'XL'].map((size) => {
                    const isAvailable = currentAvailableSizes.includes(size);
                    const isSelected = selectedSize === size;
                    
                    return (
                      <button
                        key={size}
                        onClick={() => isAvailable && setSelectedSize(size)}
                        disabled={!isAvailable}
                        className={`py-4 px-4 border-2 font-bold text-lg rounded-lg transition-all ${
                          isSelected
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

              {/* Quantity */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="px-6 py-2 text-lg font-semibold border-x-2 border-gray-300">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= maxQuantity}
                      className="p-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  {isInStock && (
                    <span className="text-sm text-green-600 font-medium">
                      {maxQuantity} in stock
                    </span>
                  )}
                  {!isInStock && (
                    <span className="text-sm text-red-600 font-medium">
                      Out of stock
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  onClick={handleAddToCart}
                  disabled={!isInStock || !selectedSize || !selectedColor || !selectedFit}
                  className="flex-1 bg-black hover:bg-gray-800 text-white py-6 text-lg font-semibold rounded-xl"
                  size="lg"
                >
                  {isInStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-6 py-6 rounded-xl border-2"
                >
                  <Heart className="h-6 w-6" />
                </Button>
              </div>

              {/* Product Details */}
              <div className="border-t pt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">SKU:</span>
                  <span className="font-medium">{product.sku}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <Link 
                    href={`/products/${product.category.slug}`}
                    className="font-medium hover:text-gray-600 transition-colors"
                  >
                    {product.category.name}
                  </Link>
                </div>
                {product.subcategory && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subcategory:</span>
                    <span className="font-medium">{product.subcategory.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}