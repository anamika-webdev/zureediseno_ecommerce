// src/app/(store)/products/[category]/page.tsx
"use client";

import { useState, useEffect, use } from 'react';
import ProductCard from '@/components/ProductCard';

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
}

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function ProductsPage({ params, searchParams }: PageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Unwrap the promises using React.use()
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);

  // Safely access searchParams
  const subcategory = typeof resolvedSearchParams.subcategory === 'string' ? resolvedSearchParams.subcategory : undefined;

  // Mock data with working images
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Classic White Shirt',
      slug: 'classic-white-shirt',
      price: 2999,
      originalPrice: 3999,
      images: [
        {
          id: '1',
          url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop',
          alt: 'Classic White Shirt',
          isPrimary: true
        }
      ],
      variants: [
        { id: '1', size: 'S', color: 'White', stock: 10 },
        { id: '2', size: 'M', color: 'White', stock: 15 },
        { id: '3', size: 'L', color: 'White', stock: 12 }
      ],
      inStock: true,
      featured: true
    },
    // ... other mock products with the same structure
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = `/api/products?category=${resolvedParams.category}`;
        if (subcategory) {
          url += `&subcategory=${subcategory}`;
        }
        
        console.log('🔍 Fetching products from:', url);
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📦 API Response:', data);
          
          // Transform API data to match expected format
          const transformedData = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            price: item.price,
            originalPrice: item.originalPrice || item.comparePrice,
            images: item.images ? item.images.map((img: any) => ({
              id: img.id,
              url: img.url,
              alt: img.alt || item.name,
              isPrimary: img.isPrimary
            })) : [],
            variants: item.variants ? item.variants.map((variant: any) => ({
              id: variant.id,
              size: variant.size,
              color: variant.color,
              stock: variant.stock,
              sleeveType: variant.sleeveType
            })) : [],
            inStock: item.inStock,
            featured: item.featured
          }));
          
          setProducts(transformedData.length > 0 ? transformedData : mockProducts);
        } else {
          console.log('⚠️ API failed, using mock data');
          setProducts(mockProducts);
        }
      } catch (error) {
        console.error('❌ Error fetching products:', error);
        console.log('🔄 Using mock data as fallback');
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [resolvedParams.category, subcategory]);

  // Rest of the component remains the same...
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <nav className="text-sm text-gray-500 mb-4">
          <span>Home</span> / <span>Shop</span> / <span className="capitalize">{resolvedParams.category}</span>
          {subcategory && <span> / <span className="capitalize">{subcategory}</span></span>}
        </nav>
        
        <h1 className="text-3xl font-bold text-center mb-2 capitalize">
          {subcategory || resolvedParams.category}
        </h1>
        <p className="text-gray-600 text-center">
          {subcategory ? `${subcategory} collection` : `${resolvedParams.category}'s fashion collection`}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button className="px-4 py-2 bg-black text-white rounded-md transition-colors">
            All
          </button>
          <button className="px-4 py-2 text-gray-600 hover:text-black transition-colors">
            Shirts
          </button>
          <button className="px-4 py-2 text-gray-600 hover:text-black transition-colors">
            T-Shirts
          </button>
          <button className="px-4 py-2 text-gray-600 hover:text-black transition-colors">
            Hoodies
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found in this category.</p>
          <p className="text-sm text-gray-400 mt-2">
            Category: {resolvedParams.category}
            {subcategory && ` | Subcategory: ${subcategory}`}
          </p>
        </div>
      )}
    </div>
  );
}