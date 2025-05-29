'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    slug: string;
    images?: { url: string }[];
  };
  className?: string;
}

export function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
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
        quantity: 1,
        size: 'M', // Default size, can be customized
        color: 'Default',
      });
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isLoading}
      className={`w-full ${className}`}
    >
      {isLoading ? 'Adding...' : 'Add to Cart'}
    </Button>
  );
}