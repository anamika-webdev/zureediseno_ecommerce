// src/app/product/[slug]/page.tsx
"use client";

import { useState, useEffect, use } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Minus, Plus } from 'lucide-react';
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
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailsPage({ params }: PageProps) {
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedSleeveType, setSelectedSleeveType] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Unwrap the params promise
  const resolvedParams = use(params);

  // Get unique options from variants
  const availableColors = product ? [...new Set(product.variants.map(v => v.color))] : [];
  const availableSizes = product ? [...new Set(product.variants.map(v => v.size))] : [];
  const availableSleeveTypes = product ? [...new Set(product.variants.map(v => v.sleeveType).filter(Boolean))] : [];

  // Get available sizes based on selected color and sleeve type
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

  // Get available sleeve types based on selected color
  const getAvailableSleeveTypesForSelection = () => {
    if (!product) return [];
    
    return product.variants
      .filter(v => {
        const colorMatch = !selectedColor || v.color === selectedColor;
        return colorMatch && v.stock > 0;
      })
      .map(v => v.sleeveType)
      .filter((sleeve, index, self) => sleeve && self.indexOf(sleeve) === index);
  };

  const currentAvailableSizes = getAvailableSizesForSelection();
  const currentAvailableSleeveTypes = getAvailableSleeveTypesForSelection();

  // Get current variant stock
  const currentVariant = product?.variants.find(v => 
    v.size === selectedSize && 
    v.color === selectedColor && 
    (!selectedSleeveType || v.sleeveType === selectedSleeveType)
  );

  const maxQuantity = currentVariant?.stock || 0;
  const isInStock = maxQuantity > 0;

  // Update selections when color changes
  useEffect(() => {
    if (product && selectedColor) {
      const availableSizesForColor = getAvailableSizesForSelection();
      const availableSleeveTypesForColor = getAvailableSleeveTypesForSelection();
      
      // Reset size if current size is not available for selected color
      if (selectedSize && !availableSizesForColor.includes(selectedSize)) {
        setSelectedSize(availableSizesForColor[0] || '');
      }
      
      // Reset sleeve type if current sleeve type is not available for selected color
      if (selectedSleeveType && !availableSleeveTypesForColor.includes(selectedSleeveType)) {
        setSelectedSleeveType(availableSleeveTypesForColor[0] || '');
      }
    }
  }, [selectedColor]);

  // Update size when sleeve type changes
  useEffect(() => {
    if (product && selectedSleeveType) {
      const availableSizesForSelection = getAvailableSizesForSelection();
      if (selectedSize && !availableSizesForSelection.includes(selectedSize)) {
        setSelectedSize(availableSizesForSelection[0] || '');
      }
    }
  }, [selectedSleeveType]);

  // Load product data
  useEffect(() => {
    const loadProduct = () => {
      // Mock product data with multiple color, size, and sleeve combinations
      const mockProduct: Product = {
        id: '1',
        name: 'Classic Premium Shirt',
        slug: 'classic-premium-shirt',
        description: 'A timeless premium shirt perfect for any occasion. Made from high-quality cotton with exceptional comfort and durability. Perfect for both formal and casual wear.',
        price: 1499,
        originalPrice: 1499,
        sku: 'CPS001',
        inStock: true,
        featured: true,
        images: [
          {
            id: '1',
            url: '/uploads/WHITE SHIRT WITH POCKET-photoshoot/White_Shirt (3).jpg',
            alt: 'Classic Premium Shirt',
            isPrimary: true
          }
        ],
        variants: [
          // White color variants
          { id: '1', size: 'S', color: 'White', sleeveType: 'Short Sleeve', stock: 10 },
          { id: '2', size: 'M', color: 'White', sleeveType: 'Short Sleeve', stock: 15 },
          { id: '3', size: 'L', color: 'White', sleeveType: 'Short Sleeve', stock: 12 },
          { id: '4', size: 'XL', color: 'White', sleeveType: 'Short Sleeve', stock: 8 },
          { id: '5', size: 'S', color: 'White', sleeveType: 'Full Sleeve', stock: 8 },
          { id: '6', size: 'M', color: 'White', sleeveType: 'Full Sleeve', stock: 12 },
          { id: '7', size: 'L', color: 'White', sleeveType: 'Full Sleeve', stock: 10 },
          { id: '8', size: 'XL', color: 'White', sleeveType: 'Full Sleeve', stock: 6 },
          
          // Blue color variants
          { id: '9', size: 'S', color: 'Blue', sleeveType: 'Short Sleeve', stock: 6 },
          { id: '10', size: 'M', color: 'Blue', sleeveType: 'Short Sleeve', stock: 9 },
          { id: '11', size: 'L', color: 'Blue', sleeveType: 'Short Sleeve', stock: 7 },
          { id: '12', size: 'XL', color: 'Blue', sleeveType: 'Short Sleeve', stock: 5 },
          { id: '13', size: 'S', color: 'Blue', sleeveType: 'Full Sleeve', stock: 7 },
          { id: '14', size: 'M', color: 'Blue', sleeveType: 'Full Sleeve', stock: 10 },
          { id: '15', size: 'L', color: 'Blue', sleeveType: 'Full Sleeve', stock: 8 },
          
          // Black color variants (only full sleeve available)
          { id: '16', size: 'S', color: 'Black', sleeveType: 'Full Sleeve', stock: 8 },
          { id: '17', size: 'M', color: 'Black', sleeveType: 'Full Sleeve', stock: 12 },
          { id: '18', size: 'L', color: 'Black', sleeveType: 'Full Sleeve', stock: 10 },
          { id: '19', size: 'XL', color: 'Black', sleeveType: 'Full Sleeve', stock: 6 },
          
          // Navy color variants (mixed availability)
          { id: '20', size: 'M', color: 'Navy', sleeveType: 'Short Sleeve', stock: 5 },
          { id: '21', size: 'L', color: 'Navy', sleeveType: 'Short Sleeve', stock: 7 },
          { id: '22', size: 'M', color: 'Navy', sleeveType: 'Full Sleeve', stock: 6 },
          { id: '23', size: 'L', color: 'Navy', sleeveType: 'Full Sleeve', stock: 8 },
          { id: '24', size: 'XL', color: 'Navy', sleeveType: 'Full Sleeve', stock: 4 },
        ],
        category: {
          id: '1',
          name: 'Men',
          slug: 'men'
        },
        subcategory: {
          name: 'Shirts',
          slug: 'shirts'
        }
      };

      setProduct(mockProduct);
      
      // Set default selections
      setSelectedColor(mockProduct.variants[0].color);
      setSelectedSize(mockProduct.variants[0].size);
      if (mockProduct.variants[0].sleeveType) {
        setSelectedSleeveType(mockProduct.variants[0].sleeveType);
      }
      
      setLoading(false);
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
            {/* Product Image */}
            <div className="p-8 lg:p-12">
              <div className="relative bg-gray-100 rounded-xl overflow-hidden">
                <div className="aspect-square relative">
                  <Image
                    src={product.images[0]?.url || '/placeholder.jpg'}
                    alt={product.images[0]?.alt || product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
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
                    <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
                    {product.originalPrice && (
                      <>
                        <span className="text-xl text-gray-500 line-through">₹{product.originalPrice}</span>
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded">
                          Save ₹{product.originalPrice - product.price}
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
                  <div className="flex gap-4">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`relative w-14 h-14 rounded-full border-3 transition-all hover:scale-105 ${
                          selectedColor === color
                            ? 'border-gray-900 shadow-lg'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ 
                          backgroundColor: 
                            color.toLowerCase() === 'white' ? '#ffffff' : 
                            color.toLowerCase() === 'black' ? '#000000' :
                            color.toLowerCase() === 'blue' ? '#3b82f6' :
                            color.toLowerCase() === 'navy' ? '#1e3a8a' :
                            color.toLowerCase() === 'red' ? '#ef4444' :
                            '#6b7280'
                        }}
                        title={color}
                      >
                        {selectedColor === color && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className={`w-4 h-4 rounded-full ${
                              color.toLowerCase() === 'white' ? 'bg-gray-900' : 'bg-white'
                            }`} />
                          </div>
                        )}
                      </button>
                    ))}
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
                      {currentAvailableSleeveTypes.map((sleeveType) => {
                        const displayName = sleeveType === 'Short Sleeve' ? 'Half Sleeves' : 'Full Sleeves';
                        const isSelected = selectedSleeveType === sleeveType;
                        
                        return (
                          <button
                            key={sleeveType}
                            onClick={() => setSelectedSleeveType(sleeveType!)}
                            className={`py-4 px-6 border-2 font-semibold rounded-lg transition-all ${
                              isSelected
                                ? 'border-gray-900 bg-gray-900 text-white shadow-md'
                                : 'border-gray-300 hover:border-gray-500 hover:bg-gray-50'
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

                {/* Stock Info 
                {isInStock && currentVariant && (
                  <div className="flex items-center space-x-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">
                      {maxQuantity} items available
                    </span>
                  </div>
                )}*/}

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
                       `Add to Cart • ₹${(product.price * quantity).toLocaleString()}`}
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