// src/app/(store)/products/[category]/[subcategory]/page.tsx - Fixed version
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Database product type (what comes from API)
interface DatabaseProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  featured: boolean;
  inStock: boolean;
  images: Array<{
    id: string;
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  variants?: Array<{
    id: string;
    size: string;
    color: string;
    stock: number;
    sleeveType?: string;
  }>;
}

// UI Product type (what ProductCard expects)
interface UIProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  images: string[];
  featured: boolean;
  inStock: boolean;
  variants?: Array<{
    id: string;
    size: string;
    color: string;
    stock: number;
    sleeveType?: string;
  }>;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: Category;
}

// Transform function
function transformProductForUI(dbProduct: DatabaseProduct): UIProduct {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    slug: dbProduct.slug,
    price: dbProduct.price,
    originalPrice: dbProduct.originalPrice,
    images: dbProduct.images?.map(img => img.url) || [],
    featured: dbProduct.featured,
    inStock: dbProduct.inStock,
    variants: dbProduct.variants
  };
}

export default function SubcategoryPage() {
  const params = useParams();
  const categorySlug = params.category as string;
  const subcategorySlug = params.subcategory as string;
  
  const [products, setProducts] = useState<UIProduct[]>([]);
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSubcategoryAndProducts = async () => {
      try {
        // Fetch products for this subcategory
        const response = await fetch(`/api/products?category=${categorySlug}&subcategory=${subcategorySlug}`);
        if (response.ok) {
          const data = await response.json();
          
          // Transform database products to UI format
          const uiProducts = data.products?.map(transformProductForUI) || [];
          setProducts(uiProducts);
          setSubcategory(data.subcategory);
        }
      } catch (error) {
        console.error('Error fetching subcategory products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug && subcategorySlug) {
      fetchSubcategoryAndProducts();
    }
  }, [categorySlug, subcategorySlug]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
        <Link href="/products" className="hover:text-gray-900">Products</Link>
        <span>/</span>
        <Link href={`/products/${categorySlug}`} className="hover:text-gray-900">
          {subcategory?.category?.name}
        </Link>
        <span>/</span>
        <span className="text-gray-900">{subcategory?.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Link href={`/products/${categorySlug}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to {subcategory?.category?.name}
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">{subcategory?.name || 'Subcategory'}</h1>
          {subcategory?.description && (
            <p className="text-gray-600 mt-2">{subcategory.description}</p>
          )}
          <p className="text-gray-500 text-sm mt-1">{filteredProducts.length} products found</p>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 w-64"
          />
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found in this subcategory</p>
          {searchTerm && (
            <p className="text-gray-400 mt-2">Try adjusting your search criteria</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} // Now the types match perfectly!
            />
          ))}
        </div>
      )}
    </div>
  );
}