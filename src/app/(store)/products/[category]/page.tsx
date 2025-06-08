// src/app/(store)/products/[category]/page.tsx - Complete Enhanced Products Listing
"use client";

import { useState, useEffect, use } from 'react';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Grid, List, Filter, SortAsc } from 'lucide-react';




interface Product {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  originalPrice?: number | string;
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
  sortOrder?: number;
  category?: {
    name: string;
    slug: string;
  };
  subcategory?: {
    name: string;
    slug: string;
  };
}

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

type SortOption = 'default' | 'price-low' | 'price-high' | 'name-asc' | 'name-desc' | 'featured';
type ViewMode = 'grid' | 'list';

export default function ProductsPage({ params, searchParams }: PageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedSleeveTypes, setSelectedSleeveTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  
  // Unwrap the promises
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);

  // Safely access searchParams
  const subcategory = typeof resolvedSearchParams.subcategory === 'string' ? resolvedSearchParams.subcategory : undefined;

  // Mock data with working images and sort orders
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Premium White Cotton Shirt',
      slug: 'premium-white-cotton-shirt',
      price: 2999,
      originalPrice: 3999,
      images: [
        {
          id: '1',
          url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop',
          alt: 'Premium White Cotton Shirt',
          isPrimary: true
        }
      ],
      variants: [
        { id: '1', size: 'S', color: 'White', stock: 10 },
        { id: '2', size: 'M', color: 'White', stock: 15 },
        { id: '3', size: 'L', color: 'White', stock: 12 },
        { id: '4', size: 'S', color: 'Blue', stock: 8 },
        { id: '5', size: 'M', color: 'Blue', stock: 10 },
      ],
      inStock: true,
      featured: true,
      sortOrder: 1
    },
    {
      id: '2',
      name: 'Classic Black T-Shirt',
      slug: 'classic-black-tshirt',
      price: 1999,
      originalPrice: 2499,
      images: [
        {
          id: '2',
          url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
          alt: 'Classic Black T-Shirt',
          isPrimary: true
        }
      ],
      variants: [
        { id: '6', size: 'S', color: 'Black', stock: 8 },
        { id: '7', size: 'M', color: 'Black', stock: 12 },
        { id: '8', size: 'L', color: 'Black', stock: 10 },
        { id: '9', size: 'M', color: 'Navy', stock: 6 },
      ],
      inStock: true,
      featured: false,
      sortOrder: 2
    },
    {
      id: '3',
      name: 'Formal Navy Blazer',
      slug: 'formal-navy-blazer',
      price: 5999,
      originalPrice: 7499,
      images: [
        {
          id: '3',
          url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
          alt: 'Formal Navy Blazer',
          isPrimary: true
        }
      ],
      variants: [
        { id: '10', size: 'S', color: 'Navy', stock: 5, sleeveType: 'Full Sleeve' },
        { id: '11', size: 'M', color: 'Navy', stock: 8, sleeveType: 'Full Sleeve' },
        { id: '12', size: 'L', color: 'Navy', stock: 6, sleeveType: 'Full Sleeve' },
        { id: '13', size: 'M', color: 'Black', stock: 4, sleeveType: 'Full Sleeve' },
      ],
      inStock: true,
      featured: true,
      sortOrder: 3
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
        { id: '14', size: 'S', color: 'Blue', stock: 4, sleeveType: 'Full Sleeve' },
        { id: '15', size: 'M', color: 'Blue', stock: 7, sleeveType: 'Full Sleeve' },
        { id: '16', size: 'L', color: 'Blue', stock: 5, sleeveType: 'Full Sleeve' },
        { id: '17', size: 'M', color: 'Black', stock: 3, sleeveType: 'Full Sleeve' },
      ],
      inStock: true,
      featured: false,
      sortOrder: 4
    },
    {
      id: '5',
      name: 'Premium Polo Shirt',
      slug: 'premium-polo-shirt',
      price: 2299,
      originalPrice: 2799,
      images: [
        {
          id: '5',
          url: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=400&fit=crop',
          alt: 'Premium Polo Shirt',
          isPrimary: true
        }
      ],
      variants: [
        { id: '18', size: 'S', color: 'Navy', stock: 6, sleeveType: 'Short Sleeve' },
        { id: '19', size: 'M', color: 'Navy', stock: 10, sleeveType: 'Short Sleeve' },
        { id: '20', size: 'L', color: 'Navy', stock: 8, sleeveType: 'Short Sleeve' },
        { id: '21', size: 'M', color: 'White', stock: 5, sleeveType: 'Short Sleeve' },
        { id: '22', size: 'M', color: 'Red', stock: 4, sleeveType: 'Short Sleeve' },
      ],
      inStock: true,
      featured: false,
      sortOrder: 5
    },
    {
      id: '6',
      name: 'Comfortable Gray Hoodie',
      slug: 'comfortable-gray-hoodie',
      price: 3499,
      originalPrice: 4299,
      images: [
        {
          id: '6',
          url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
          alt: 'Comfortable Gray Hoodie',
          isPrimary: true
        }
      ],
      variants: [
        { id: '23', size: 'S', color: 'Gray', stock: 5 },
        { id: '24', size: 'M', color: 'Gray', stock: 8 },
        { id: '25', size: 'L', color: 'Gray', stock: 6 },
        { id: '26', size: 'XL', color: 'Gray', stock: 3 },
        { id: '27', size: 'M', color: 'Black', stock: 4 },
      ],
      inStock: true,
      featured: true,
      sortOrder: 6
    }
  ];

  // Get all unique filter options from products
  const getAllColors = () => {
    const colors = new Set<string>();
    products.forEach(product => {
      product.variants.forEach(variant => colors.add(variant.color));
    });
    return Array.from(colors);
  };

  const getAllSizes = () => {
    const sizes = new Set<string>();
    products.forEach(product => {
      product.variants.forEach(variant => sizes.add(variant.size));
    });
    return Array.from(sizes).sort();
  };

  const getAllSleeveTypes = () => {
    const sleeves = new Set<string>();
    products.forEach(product => {
      product.variants.forEach(variant => {
        if (variant.sleeveType) sleeves.add(variant.sleeveType);
      });
    });
    return Array.from(sleeves);
  };

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
  }, [resolvedParams.category, subcategory]);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Apply filters
    if (selectedColors.length > 0) {
      filtered = filtered.filter(product =>
        product.variants.some(variant => selectedColors.includes(variant.color))
      );
    }

    if (selectedSizes.length > 0) {
      filtered = filtered.filter(product =>
        product.variants.some(variant => selectedSizes.includes(variant.size))
      );
    }

    if (selectedSleeveTypes.length > 0) {
      filtered = filtered.filter(product =>
        product.variants.some(variant => 
          variant.sleeveType && selectedSleeveTypes.includes(variant.sleeveType)
        )
      );
    }

    // Apply price range filter
    filtered = filtered.filter(product => {
      const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Apply sorting
    switch (sortBy) {
      case 'default':
        filtered.sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));
        break;
      case 'price-low':
        filtered.sort((a, b) => {
          const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
          const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        filtered.sort((a, b) => {
          const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
          const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
          return priceB - priceA;
        });
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'featured':
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return (a.sortOrder || 999) - (b.sortOrder || 999);
        });
        break;
    }

    setFilteredProducts(filtered);
  }, [products, sortBy, selectedColors, selectedSizes, selectedSleeveTypes, priceRange]);

  const toggleFilter = (filterArray: string[], setFilter: (filters: string[]) => void, value: string) => {
    if (filterArray.includes(value)) {
      setFilter(filterArray.filter(item => item !== value));
    } else {
      setFilter([...filterArray, value]);
    }
  };

  const clearAllFilters = () => {
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedSleeveTypes([]);
    setPriceRange([0, 10000]);
    setSortBy('default');
  };

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

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="font-medium">Sort by:</span>
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Order</SelectItem>
                <SelectItem value="featured">Featured First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name-asc">Name: A to Z</SelectItem>
                <SelectItem value="name-desc">Name: Z to A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {filteredProducts.length} of {products.length} products
            </span>
            
            <div className="flex border rounded-lg">
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

        {/* Filter Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Color Filter */}
          {getAllColors().length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Colors</h4>
              <div className="flex flex-wrap gap-2">
                {getAllColors().map((color) => (
                  <button
                    key={color}
                    onClick={() => toggleFilter(selectedColors, setSelectedColors, color)}
                    className={`px-3 py-1 text-sm border rounded-full transition-colors ${
                      selectedColors.includes(color)
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Filter */}
          {getAllSizes().length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Sizes</h4>
              <div className="flex flex-wrap gap-2">
                {getAllSizes().map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleFilter(selectedSizes, setSelectedSizes, size)}
                    className={`px-3 py-1 text-sm border rounded transition-colors ${
                      selectedSizes.includes(size)
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sleeve Type Filter */}
          {getAllSleeveTypes().length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Sleeve Types</h4>
              <div className="flex flex-wrap gap-2">
                {getAllSleeveTypes().map((sleeve) => (
                  <button
                    key={sleeve}
                    onClick={() => toggleFilter(selectedSleeveTypes, setSelectedSleeveTypes, sleeve)}
                    className={`px-3 py-1 text-sm border rounded transition-colors ${
                      selectedSleeveTypes.includes(sleeve)
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {sleeve.replace(' Sleeve', '')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear Filters */}
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="w-full"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedColors.length > 0 || selectedSizes.length > 0 || selectedSleeveTypes.length > 0) && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-2">Active Filters:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedColors.map((color) => (
                <Badge
                  key={`color-${color}`}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => toggleFilter(selectedColors, setSelectedColors, color)}
                >
                  Color: {color} ×
                </Badge>
              ))}
              {selectedSizes.map((size) => (
                <Badge
                  key={`size-${size}`}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => toggleFilter(selectedSizes, setSelectedSizes, size)}
                >
                  Size: {size} ×
                </Badge>
              ))}
              {selectedSleeveTypes.map((sleeve) => (
                <Badge
                  key={`sleeve-${sleeve}`}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => toggleFilter(selectedSleeveTypes, setSelectedSleeveTypes, sleeve)}
                >
                  {sleeve} ×
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Products Grid/List */}
      {filteredProducts.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-6'
        }>
          {filteredProducts.map((product) => (
            <div key={product.id} className={viewMode === 'list' ? 'max-w-none' : ''}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <SortAsc className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search terms to find what you're looking for.
            </p>
            <Button onClick={clearAllFilters} variant="outline">
              Clear All Filters
            </Button>
          </div>
        </div>
      )}

      {/* Product Count Summary */}
      {filteredProducts.length > 0 && (
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
            {(selectedColors.length > 0 || selectedSizes.length > 0 || selectedSleeveTypes.length > 0) && (
              <span> with active filters</span>
            )}
          </p>
        </div>
      )}

      {/* Load More Button (if needed for pagination) */}
      {filteredProducts.length > 0 && filteredProducts.length < products.length && (
        <div className="mt-8 text-center">
          <Button variant="outline" size="lg">
            Load More Products
          </Button>
        </div>
      )}
    </div>
  );
}