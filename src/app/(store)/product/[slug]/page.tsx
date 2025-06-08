// src/app/(store)/product/[slug]/page.tsx - Fixed TypeScript errors
"use client";

import { useState, useEffect, use } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Minus, Plus, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

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
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const resolvedParams = use(params);

  // Get unique options from variants
  const availableColors = product ? [...new Set(product.variants.map(v => v.color))] : [];
  const availableSizes = product ? [...new Set(product.variants.map(v => v.size))] : [];
  const availableSleeveTypes = product ? [...new Set(product.variants.map(v => v.sleeveType).filter((sleeve): sleeve is string => Boolean(sleeve)))] : [];

  // Get available options based on current selections
  const getAvailableSizesForSelection = () => {
    if (!product) return [];
    
    return product.variants
      .filter(v => {
        const colorMatch = !selectedColor || v.color === selectedColor;
        const sleeveMatch = !selectedSleeveType || v.sleeveType === selectedSleeveType;
        return colorMatch && sleeveMatch && v.stock > 0;
      })
      .map(v => v.size)
      .filter((size, index, self) => self.indexOf(size) === index);
  };

  const getAvailableSleeveTypesForSelection = () => {
    if (!product) return [];
    
    return product.variants
      .filter(v => {
        const colorMatch = !selectedColor || v.color === selectedColor;
        const sizeMatch = !selectedSize || v.size === selectedSize;
        return colorMatch && sizeMatch && v.stock > 0;
      })
      .map(v => v.sleeveType)
      .filter((sleeve): sleeve is string => Boolean(sleeve))
      .filter((sleeve, index, self) => self.indexOf(sleeve) === index);
  };

  const getAvailableColorsForSelection = () => {
    if (!product) return [];
    
    return product.variants
      .filter(v => {
        const sizeMatch = !selectedSize || v.size === selectedSize;
        const sleeveMatch = !selectedSleeveType || v.sleeveType === selectedSleeveType;
        return sizeMatch && sleeveMatch && v.stock > 0;
      })
      .map(v => v.color)
      .filter((color, index, self) => self.indexOf(color) === index);
  };

  const currentAvailableSizes = getAvailableSizesForSelection();
  const currentAvailableSleeveTypes = getAvailableSleeveTypesForSelection();
  const currentAvailableColors = getAvailableColorsForSelection();

  // Get current variant
  const currentVariant = product?.variants.find(v => 
    v.size === selectedSize && 
    v.color === selectedColor && 
    (!selectedSleeveType || v.sleeveType === selectedSleeveType)
  );

  const maxQuantity = currentVariant?.stock || 0;
  const isInStock = maxQuantity > 0;

  // Update selections when they become unavailable
  useEffect(() => {
    if (product && selectedColor && !currentAvailableColors.includes(selectedColor)) {
      setSelectedColor(currentAvailableColors[0] || '');
    }
  }, [selectedSize, selectedSleeveType, currentAvailableColors, product, selectedColor]);

  useEffect(() => {
    if (product && selectedSize && !currentAvailableSizes.includes(selectedSize)) {
      setSelectedSize(currentAvailableSizes[0] || '');
    }
  }, [selectedColor, selectedSleeveType, currentAvailableSizes, product, selectedSize]);

  useEffect(() => {
    if (product && selectedSleeveType && !currentAvailableSleeveTypes.includes(selectedSleeveType)) {
      setSelectedSleeveType(currentAvailableSleeveTypes[0] || '');
    }
  }, [selectedColor, selectedSize, currentAvailableSleeveTypes, product, selectedSleeveType]);

  // Load product data from API
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        
        // Fetch actual product data by slug from API
        const response = await fetch(`/api/products/${resolvedParams.slug}`);
        
        if (response.ok) {
          const productData = await response.json();
          setProduct(productData);
          
          // Set default selections from actual variants
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
        <Link href="/products/men">
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
          <Link href="/products/men" className="hover:text-gray-900 transition-colors">Shop</Link>
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
              <div className="relative bg-gray-100 rounded-xl overflow-hidden">
                <div className="aspect-square relative">
                  <Image
                    src={product.images[currentImageIndex]?.url || '/placeholder.jpg'}
                    alt={product.images[currentImageIndex]?.alt || product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                  
                  {/* Image Navigation */}
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
                
                {/* Image Thumbnails */}
                {product.images.length > 1 && (
                  <div className="flex gap-2 mt-4 justify-center">
                    {product.images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                          currentImageIndex === index ? 'border-gray-900' : 'border-gray-300'
                        }`}
                      >
                        <Image
                          src={image.url}
                          alt={image.alt || ''}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="p-8 lg:p-12 border-l border-gray-100">
              <div className="space-y-8">
                {/* Category Badge */}
                <div className="inline-block">
                  <span className="px-3 py-1 bg-gray-900 text-white text-xs font-semibold uppercase tracking-wider rounded-full">
                    {product.subcategory?.name || product.category.name}
                  </span>
                  {product.featured && (
                    <span className="ml-2 px-3 py-1 bg-yellow-500 text-white text-xs font-semibold uppercase tracking-wider rounded-full">
                      <Star className="inline h-3 w-3 mr-1" />
                      Featured
                    </span>
                  )}
                </div>

                {/* Product Title */}
                <div>
                  <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
                    {product.name}
                  </h1>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {product.description}
                  </p>
                </div>

                {/* Price */}
                <div className="border-t border-b border-gray-200 py-6">
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl font-bold text-gray-900">₹{formatPrice(product.price)}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <>
                        <span className="text-xl text-gray-500 line-through">₹{formatPrice(product.originalPrice)}</span>
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded">
                          Save ₹{formatPrice(product.originalPrice - product.price)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Color Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Color
                    </h3>
                    <span className="text-sm text-gray-600 font-medium">
                      {selectedColor}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    {availableColors.map((color) => {
                      const isAvailable = currentAvailableColors.includes(color);
                      return (
                        <button
                          key={color}
                          onClick={() => isAvailable && setSelectedColor(color)}
                          disabled={!isAvailable}
                          className={`relative w-12 h-12 rounded-full border-3 transition-all hover:scale-105 ${
                            selectedColor === color
                              ? 'border-gray-900 shadow-lg scale-105'
                              : isAvailable
                              ? 'border-gray-300 hover:border-gray-400'
                              : 'border-gray-200 opacity-50 cursor-not-allowed'
                          }`}
                          style={{ backgroundColor: getColorCode(color) }}
                          title={color}
                        >
                          {selectedColor === color && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className={`w-4 h-4 rounded-full ${
                                color.toLowerCase() === 'white' ? 'bg-gray-900' : 'bg-white'
                              }`} />
                            </div>
                          )}
                          {!isAvailable && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-6 h-0.5 bg-red-500 rotate-45"></div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sleeve Type Selection */}
                {availableSleeveTypes.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Sleeve Type
                      </h3>
                      <span className="text-sm text-gray-600 font-medium">
                        {selectedSleeveType === 'Short Sleeve' ? 'Half Sleeves' : 
                         selectedSleeveType === 'Full Sleeve' ? 'Full Sleeves' : 
                         selectedSleeveType || 'Select sleeve type'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {availableSleeveTypes.map((sleeveType) => {
                        const displayName = sleeveType === 'Short Sleeve' ? 'Half Sleeves' : 'Full Sleeves';
                        const isSelected = selectedSleeveType === sleeveType;
                        const isAvailable = currentAvailableSleeveTypes.includes(sleeveType);
                        
                        return (
                          <button
                            key={sleeveType}
                            onClick={() => isAvailable && setSelectedSleeveType(sleeveType)}
                            disabled={!isAvailable}
                            className={`py-4 px-6 border-2 font-semibold rounded-lg transition-all ${
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

                {/* Size Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Size
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 font-medium">
                        {selectedSize || 'Select size'}
                      </span>
                      <button className="text-sm text-blue-600 hover:text-blue-800 underline transition-colors">
                        Size Guide
                      </button>
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

                {/* Stock Info */}
                {isInStock && currentVariant && (
                  <div className="flex items-center space-x-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">
                      {maxQuantity} items available
                    </span>
                  </div>
                )}

                {!currentVariant && selectedColor && selectedSize && (
                  <div className="flex items-center space-x-2 text-red-700 bg-red-50 px-4 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium">
                      This combination is not available
                    </span>
                  </div>
                )}

                {/* Quantity */}
                {isInStock && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Quantity</h3>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border-2 border-gray-300 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(-1)}
                          disabled={quantity <= 1}
                          className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="h-5 w-5" />
                        </button>
                        <span className="px-6 py-3 font-bold text-lg min-w-[80px] text-center border-l border-r border-gray-300">
                          {quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(1)}
                          disabled={quantity >= maxQuantity}
                          className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                      <span className="text-sm text-gray-600">
                        Maximum {maxQuantity} items
                      </span>
                    </div>
                  </div>
                )}

                {/* Add to Cart Button */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex gap-4">
                    <Button
                      onClick={handleAddToCart}
                      disabled={!isInStock || !selectedSize || !selectedColor || (availableSleeveTypes.length > 0 && !selectedSleeveType)}
                      className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                      size="lg"
                    >
                      {!selectedColor || !selectedSize ? 'Select Options' :
                       (availableSleeveTypes.length > 0 && !selectedSleeveType) ? 'Select Sleeve Type' :
                       !isInStock ? 'Out of Stock' : 
                       `Add to Cart • ₹${formatPrice(product.price * quantity)}`}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="lg"
                      className="p-4 border-2 border-gray-300 hover:border-gray-400 rounded-xl"
                    >
                      <Heart className="h-6 w-6" />
                    </Button>
                  </div>
                </div>

                {/* Product Features */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Product Features</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                      <span>100% Premium Cotton</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                      <span>Regular Fit</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                      <span>Button-down Collar</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                      <span>Machine Washable</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      <span>Free Shipping</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      <span>Easy Returns</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}