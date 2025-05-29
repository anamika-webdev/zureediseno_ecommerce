'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Minus, Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

interface AddToCartSectionProps {
  product: {
    id: string;
    name: string;
    price: number;
    slug: string;
    images?: { url: string }[];
    stock?: number;
  };
}

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const COLORS = [
  { name: 'White', value: '#FFFFFF', border: true },
  { name: 'Black', value: '#000000' },
  { name: 'Navy', value: '#1a237e' },
  { name: 'Gray', value: '#757575' },
];

export function AddToCartSection({ product }: AddToCartSectionProps) {
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('White');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.url || '/assets/img/cloth.jpg',
        slug: product.slug,
        quantity,
        size: selectedSize,
        color: selectedColor,
      });
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <div className="space-y-6">
      {/* Color Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium">Color: {selectedColor}</span>
        </div>
        <div className="flex gap-2">
          {COLORS.map((color) => (
            <button
              key={color.name}
              onClick={() => setSelectedColor(color.name)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                selectedColor === color.name
                  ? 'border-black scale-110'
                  : color.border
                  ? 'border-gray-300'
                  : 'border-transparent'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Size Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium">Size</span>
          <button className="text-sm text-gray-600 underline hover:text-black">
            Size Guide
          </button>
        </div>
        <div className="flex gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`px-4 py-2 border rounded-md text-sm transition-colors ${
                selectedSize === size
                  ? 'border-black bg-black text-white'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div>
        <span className="font-medium block mb-3">Quantity</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-md">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 hover:bg-gray-100 transition-colors"
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-4 py-2 border-x">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 hover:bg-gray-100 transition-colors"
              disabled={quantity >= (product.stock || 10)}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {product.stock && (
            <span className="text-sm text-gray-600">
              {product.stock} in stock
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={handleAddToCart}
          disabled={isLoading}
          className="flex-1 bg-black hover:bg-gray-800 text-white py-3"
          size="lg"
        >
          {isLoading ? 'Adding...' : 'Add to Cart'}
        </Button>
        <Button
          onClick={handleWishlist}
          variant="outline"
          size="lg"
          className="px-4"
        >
          <Heart
            className={`h-5 w-5 ${
              isWishlisted ? 'fill-red-500 text-red-500' : ''
            }`}
          />
        </Button>
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm text-gray-600">In stock and ready to ship</span>
      </div>
    </div>
  );
}