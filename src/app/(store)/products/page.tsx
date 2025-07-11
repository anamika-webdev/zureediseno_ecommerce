// src/app/(store)/products/page.tsx - FIXED: Only show real database products
"use client";

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { Loader2, AlertCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  images: Array<{
    id: string;
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  variants: Array<{
    id: string;
    size: string;
    color: string;
    stock: number;
    sleeveType?: string;
  }>;
  inStock: boolean;
  featured: boolean;
  description?: string;
  sku?: string;
  category?: {
    name: string;
    slug: string;
  };
  subcategory?: {
    name: string;
    slug: string;
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('🔍 Fetching products from database...');
        
        const response = await fetch('/api/products');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📦 API Response:', data);
        
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
          console.log('✅ Products loaded from database:', data.products.length);
        } else {
          // No fallback to mock data - show empty state
          setProducts([]);
          console.log('📭 No products found in database');
        }
        
      } catch (error) {
        console.error('❌ Error fetching products:', error);
        setError(error instanceof Error ? error.message : 'Failed to load products');
        setProducts([]); // Don't use mock data on error
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-lg text-gray-600">Loading products from database...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center min-h-[400px] flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to load products</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center min-h-[400px] flex items-center justify-center">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md">
            <div className="bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Products Available</h3>
            <p className="text-gray-600 mb-4">
              Products will appear here once they are added through the admin dashboard.
            </p>
            <div className="text-sm text-gray-500">
              <p>👨‍💼 Admin: Add products in the dashboard</p>
              <p>🛍️ Customers: Check back soon for new arrivals!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Products</h1>
        <p className="text-gray-600">
          Discover our latest collection ({products.length} product{products.length !== 1 ? 's' : ''})
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}