// src/components/store/RelatedProducts.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
}

interface RelatedProductsProps {
  currentProductId: string;
  categoryId: string;
}

export default function RelatedProducts({ currentProductId, categoryId }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const response = await fetch(`/api/products/related?productId=${currentProductId}&categoryId=${categoryId}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [currentProductId, categoryId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => {
        const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
        
        return (
          <div key={product.id} className="group">
            <Link href={`/product/${product.slug}`}>
              <div className="relative bg-gray-50 rounded-lg overflow-hidden mb-4">
                <div className="aspect-square relative">
                  <Image
                    src={primaryImage?.url || '/placeholder.jpg'}
                    alt={primaryImage?.alt || product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
              
              <h3 className="font-medium text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
                {product.name}
              </h3>
              <p className="text-lg font-bold text-gray-900 mb-3">₹{product.price}</p>
            </Link>
            
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full"
              asChild
            >
              <Link href={`/product/${product.slug}`}>
                Select Size
              </Link>
            </Button>
          </div>
        );
      })}
    </div>
  );
}