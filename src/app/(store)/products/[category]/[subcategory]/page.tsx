// src/app/(store)/products/[category]/[subcategory]/page.tsx - FIXED: Only real database products
"use client";

import { useState, useEffect, use } from 'react';
import ProductCard from '@/components/ProductCard';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
  category?: {
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
  params: Promise<{
    category: string;
    subcategory: string;
  }>;
}

export default function SubcategoryPage({ params }: PageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Unwrap the promises
  const resolvedParams = use(params);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Build API URL with category and subcategory filters
        const url = `/api/products?category=${resolvedParams.category}&subcategory=${resolvedParams.subcategory}`;
        
        console.log('🔍 Fetching subcategory products from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📦 API Response:', data);
        
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
          console.log('✅ Products loaded for subcategory:', resolvedParams.subcategory, data.products.length);
        } else if (Array.isArray(data)) {
          setProducts(data);
          console.log('✅ Products loaded for subcategory:', resolvedParams.subcategory, data.length);
        } else {
          // No fallback to mock data
          setProducts([]);
          console.log('📭 No products found for subcategory:', resolvedParams.subcategory);
        }
        
      } catch (error) {
        console.error('❌ Error fetching subcategory products:', error);
        setError(error instanceof Error ? error.message : 'Failed to load products');
        setProducts([]); // No mock data fallback
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [resolvedParams.category, resolvedParams.subcategory]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-lg text-gray-600">
              Loading {resolvedParams.subcategory} products...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href={`/products/${resolvedParams.category}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {resolvedParams.category}
          </Button>
        </Link>

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
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <span> / </span>
          <Link href="/products" className="hover:text-gray-700">Shop</Link>
          <span> / </span>
          <Link href={`/products/${resolvedParams.category}`} className="hover:text-gray-700 capitalize">
            {resolvedParams.category}
          </Link>
          <span> / </span>
          <span className="capitalize">{resolvedParams.subcategory}</span>
        </nav>

        {/* Back Button */}
        <Link href={`/products/${resolvedParams.category}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {resolvedParams.category}
          </Button>
        </Link>

        <div className="text-center min-h-[400px] flex items-center justify-center">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md">
            <div className="bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2 capitalize">
              No {resolvedParams.subcategory} Products
            </h3>
            <p className="text-gray-600 mb-4">
              No products found in this subcategory. Products will appear here once they are added through the admin dashboard.
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>👨‍💼 <strong>Admin:</strong> Add products with category "{resolvedParams.category}" and subcategory "{resolvedParams.subcategory}"</p>
              <p>🛍️ <strong>Customers:</strong> Check back soon for new arrivals!</p>
            </div>
            <div className="mt-6">
              <Link href={`/products/${resolvedParams.category}`}>
                <Button variant="outline">
                  Browse {resolvedParams.category} Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Extract subcategory name from products data if available
  const subcategoryName = products[0]?.subcategory?.name || resolvedParams.subcategory;
  const categoryName = products[0]?.category?.name || resolvedParams.category;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span> / </span>
        <Link href="/products" className="hover:text-gray-700">Shop</Link>
        <span> / </span>
        <Link href={`/products/${resolvedParams.category}`} className="hover:text-gray-700 capitalize">
          {categoryName}
        </Link>
        <span> / </span>
        <span className="capitalize">{subcategoryName}</span>
      </nav>

      {/* Back Button */}
      <Link href={`/products/${resolvedParams.category}`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {categoryName}
        </Button>
      </Link>
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 capitalize">
          {subcategoryName}
        </h1>
        <p className="text-gray-600">
          {products.length} product{products.length !== 1 ? 's' : ''} in {subcategoryName}
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Featured Products Section */}
      {products.filter(p => p.featured).length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Featured {subcategoryName}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products
              .filter(product => product.featured)
              .map((product) => (
                <ProductCard key={`featured-${product.id}`} product={product} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}