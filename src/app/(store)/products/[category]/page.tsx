// src/app/products/[category]/page.tsx
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
    {
      id: '2',
      name: 'Premium Cotton T-Shirt',
      slug: 'premium-cotton-tshirt',
      price: 1999,
      originalPrice: 2499,
      images: [
        {
          id: '2',
          url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
          alt: 'Premium Cotton T-Shirt',
          isPrimary: true
        }
      ],
      variants: [
        { id: '4', size: 'S', color: 'Black', stock: 8 },
        { id: '5', size: 'M', color: 'Black', stock: 12 },
        { id: '6', size: 'L', color: 'Black', stock: 10 }
      ],
      inStock: true,
      featured: false
    },
    {
      id: '3',
      name: 'Formal Black Shirt',
      slug: 'formal-black-shirt',
      price: 3499,
      originalPrice: 4299,
      images: [
        {
          id: '3',
          url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop',
          alt: 'Formal Black Shirt',
          isPrimary: true
        }
      ],
      variants: [
        { id: '7', size: 'S', color: 'Black', stock: 5 },
        { id: '8', size: 'M', color: 'Black', stock: 8 },
        { id: '9', size: 'L', color: 'Black', stock: 6 }
      ],
      inStock: true,
      featured: false
    },
    {
      id: '4',
      name: 'Casual Denim Shirt',
      slug: 'casual-denim-shirt',
      price: 2799,
      images: [
        {
          id: '4',
          url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop',
          alt: 'Casual Denim Shirt',
          isPrimary: true
        }
      ],
      variants: [
        { id: '10', size: 'S', color: 'Denim Blue', stock: 4 },
        { id: '11', size: 'M', color: 'Denim Blue', stock: 7 },
        { id: '12', size: 'L', color: 'Denim Blue', stock: 5 }
      ],
      inStock: true,
      featured: false
    },
    {
      id: '5',
      name: 'Navy Blue Polo',
      slug: 'navy-blue-polo',
      price: 2299,
      originalPrice: 2799,
      images: [
        {
          id: '5',
          url: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=400&fit=crop',
          alt: 'Navy Blue Polo',
          isPrimary: true
        }
      ],
      variants: [
        { id: '13', size: 'S', color: 'Navy', stock: 6 },
        { id: '14', size: 'M', color: 'Navy', stock: 10 },
        { id: '15', size: 'L', color: 'Navy', stock: 8 },
        { id: '16', size: 'XL', color: 'Navy', stock: 4 }
      ],
      inStock: true,
      featured: false
    },
    {
      id: '6',
      name: 'Casual Gray Hoodie',
      slug: 'casual-gray-hoodie',
      price: 3499,
      originalPrice: 4299,
      images: [
        {
          id: '6',
          url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
          alt: 'Casual Gray Hoodie',
          isPrimary: true
        }
      ],
      variants: [
        { id: '17', size: 'S', color: 'Gray', stock: 5 },
        { id: '18', size: 'M', color: 'Gray', stock: 8 },
        { id: '19', size: 'L', color: 'Gray', stock: 6 },
        { id: '20', size: 'XL', color: 'Gray', stock: 3 }
      ],
      inStock: true,
      featured: true
    }
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
          
          // Use API data if available, otherwise use mock data
          setProducts(data.length > 0 ? data : mockProducts);
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
  }, [resolvedParams.category, subcategory, mockProducts]);

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