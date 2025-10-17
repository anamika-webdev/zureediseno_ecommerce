'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { Grid, List, Filter, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Product {
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
  image?: string;
  description?: string;
  _count: {
    products: number;
  };
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

export default function ShopPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const subcategoryParam = searchParams.get('subcategory');

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);

  useEffect(() => {
    if (categoryParam || subcategoryParam) {
      // Fetch filtered products
      fetchProducts();
    } else {
      // Fetch all categories for browsing
      fetchCategories();
    }
  }, [categoryParam, subcategoryParam]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories-with-subcategories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      let url = '/api/products?';
      if (categoryParam) url += `category=${categoryParam}`;
      if (subcategoryParam) url += `&subcategory=${subcategoryParam}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        
        // Transform products to match the format expected by ProductCard
        const transformedProducts = data.products?.map((product: any) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          originalPrice: product.originalPrice,
          images: product.images?.map((img: any) => img.url) || [],
          featured: product.featured,
          inStock: product.inStock,
          variants: product.variants
        })) || [];

        setProducts(transformedProducts);
        setSelectedCategory(data.category || null);
        setSelectedSubcategory(data.subcategory || null);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories
    .filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'products':
          return b._count.products - a._count.products;
        default:
          return 0;
      }
    });

  const filteredProducts = products
    .filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show products view if category or subcategory is selected
  if (categoryParam || subcategoryParam) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
            <Link href="/shop" className="hover:text-gray-900">Shop</Link>
            {selectedCategory && (
              <>
                <span>/</span>
                <Link href={`/shop?category=${selectedCategory.slug}`} className="hover:text-gray-900">
                  {selectedCategory.name}
                </Link>
              </>
            )}
            {selectedSubcategory && (
              <>
                <span>/</span>
                <span className="text-gray-900">{selectedSubcategory.name}</span>
              </>
            )}
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Link href="/shop">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Shop
                  </Button>
                </Link>
              </div>
              <h1 className="text-3xl font-bold">
                {selectedSubcategory?.name || selectedCategory?.name || 'Products'}
              </h1>
              {(selectedCategory?.description || selectedSubcategory) && (
                <p className="text-gray-600 mt-2">
                  {selectedCategory?.description}
                </p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                {filteredProducts.length} products found
              </p>
            </div>
            
            {/* Search and Sort */}
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found</p>
              {searchTerm && (
                <p className="text-gray-400 mt-2">Try adjusting your search criteria</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show categories browse view (default)
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Shop Collections</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our curated collections of premium clothing and accessories designed for every occasion.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search collections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="products">Most Products</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Categories Grid/List */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No collections found</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCategories.map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className="group"
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="aspect-square relative overflow-hidden bg-gray-100">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <span className="text-6xl">📦</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold group-hover:text-zuree-red transition-colors">
                        {category.name}
                      </h3>
                      <Badge variant="secondary">
                        {category._count.products} items
                      </Badge>
                    </div>
                    {category.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCategories.map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className="group"
              >
                <Card className="overflow-hidden hover:shadow-md transition-all duration-300">
                  <div className="flex">
                    <div className="w-48 h-48 relative overflow-hidden bg-gray-100 flex-shrink-0">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <span className="text-4xl">📦</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-2xl font-semibold group-hover:text-zuree-red transition-colors">
                            {category.name}
                          </h3>
                          <Badge variant="secondary" className="text-base">
                            {category._count.products} items
                          </Badge>
                        </div>
                        {category.description && (
                          <p className="text-gray-600 mt-2">
                            {category.description}
                          </p>
                        )}
                      </div>
                      <div className="mt-4 text-zuree-red font-medium flex items-center">
                        Browse Collection
                        <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}