// src/hooks/useAutoUpdateProducts.ts
import { useState, useEffect, useCallback, useRef } from 'react';

interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

interface ProductVariant {
  id: string;
  size: string;
  color: string;
  stock: number;
  sleeveType?: string;
  sku?: string;
}

interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

interface ProductSubcategory {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  originalPrice?: number;
  sku?: string;
  inStock: boolean;
  featured: boolean;
  rating: number;
  reviewCount: number;
  totalStock: number;
  images: ProductImage[];
  variants: ProductVariant[];
  category: ProductCategory;
  subcategory?: ProductSubcategory;
  createdAt: string;
  updatedAt: string;
}

interface UseAutoUpdateProductsOptions {
  productId?: string;
  includeVariants?: boolean;
  includeImages?: boolean;
  autoRefreshInterval?: number;
  enableRealTimeUpdates?: boolean;
  maxRetries?: number;
}

interface UseAutoUpdateProductsReturn {
  products: Product[];
  currentProduct: Product | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  refreshProducts: () => Promise<void>;
  updateProduct: (id: string, fields?: string[]) => Promise<void>;
  selectProduct: (id: string) => void;
  isConnected: boolean;
}

export const useAutoUpdateProducts = (
  options: UseAutoUpdateProductsOptions = {}
): UseAutoUpdateProductsReturn => {
  const {
    productId,
    includeVariants = true,
    includeImages = true,
    autoRefreshInterval = 30000,
    enableRealTimeUpdates = true,
    maxRetries = 3
  } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsConnected(true);
    const handleOffline = () => setIsConnected(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch products from API
  const fetchProducts = useCallback(async (): Promise<Product[]> => {
    try {
      setError(null);
      
      let url = '/api/products';
      const params = new URLSearchParams();
      
      if (productId) {
        url = `/api/products/${productId}`;
      } else {
        if (includeVariants) params.append('includeVariants', 'true');
        if (includeImages) params.append('includeImages', 'true');
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform single product response to array
      const productsArray = Array.isArray(data) ? data : [data];
      
      // Transform data to match our interface
      const transformedProducts: Product[] = productsArray.map((item: any) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description || '',
        price: item.price,
        originalPrice: item.originalPrice || item.comparePrice,
        sku: item.sku || '',
        inStock: item.inStock,
        featured: item.featured || false,
        rating: item.rating || 4.5, // Default rating
        reviewCount: item.reviewCount || 0,
        totalStock: item.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0,
        images: item.images?.map((img: any) => ({
          id: img.id,
          url: img.url,
          alt: img.alt || item.name,
          isPrimary: img.isPrimary || false
        })) || [],
        variants: item.variants?.map((variant: any) => ({
          id: variant.id,
          size: variant.size,
          color: variant.color,
          stock: variant.stock || 0,
          sleeveType: variant.sleeveType,
          sku: variant.sku
        })) || [],
        category: {
          id: item.category?.id || '',
          name: item.category?.name || 'Uncategorized',
          slug: item.category?.slug || 'uncategorized'
        },
        subcategory: item.subcategory ? {
          id: item.subcategory.id,
          name: item.subcategory.name,
          slug: item.subcategory.slug
        } : undefined,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString()
      }));

      setRetryCount(0);
      return transformedProducts;
    } catch (error) {
      console.error('Error fetching products:', error);
      
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        // Exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => fetchProducts(), delay);
        throw new Error(`Retrying... (${retryCount + 1}/${maxRetries})`);
      }
      
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch products');
    }
  }, [productId, includeVariants, includeImages, retryCount, maxRetries]);

  // Refresh products
  const refreshProducts = useCallback(async () => {
    try {
      setLoading(true);
      const newProducts = await fetchProducts();
      setProducts(newProducts);
      
      // Update current product if it exists
      if (currentProduct) {
        const updatedCurrentProduct = newProducts.find(p => p.id === currentProduct.id);
        if (updatedCurrentProduct) {
          setCurrentProduct(updatedCurrentProduct);
        }
      } else if (newProducts.length > 0) {
        setCurrentProduct(newProducts[0]);
      }
      
      setLastUpdated(new Date().toISOString());
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to refresh products');
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, currentProduct]);

  // Update specific product
  const updateProduct = useCallback(async (id: string, fields?: string[]) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error(`Failed to update product: ${response.status}`);
      }

      const updatedData = await response.json();
      
      // Transform the updated data
      const updatedProduct: Product = {
        id: updatedData.id,
        name: updatedData.name,
        slug: updatedData.slug,
        description: updatedData.description || '',
        price: updatedData.price,
        originalPrice: updatedData.originalPrice || updatedData.comparePrice,
        sku: updatedData.sku || '',
        inStock: updatedData.inStock,
        featured: updatedData.featured || false,
        rating: updatedData.rating || 4.5,
        reviewCount: updatedData.reviewCount || 0,
        totalStock: updatedData.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0,
        images: updatedData.images?.map((img: any) => ({
          id: img.id,
          url: img.url,
          alt: img.alt || updatedData.name,
          isPrimary: img.isPrimary || false
        })) || [],
        variants: updatedData.variants?.map((variant: any) => ({
          id: variant.id,
          size: variant.size,
          color: variant.color,
          stock: variant.stock || 0,
          sleeveType: variant.sleeveType,
          sku: variant.sku
        })) || [],
        category: {
          id: updatedData.category?.id || '',
          name: updatedData.category?.name || 'Uncategorized',
          slug: updatedData.category?.slug || 'uncategorized'
        },
        subcategory: updatedData.subcategory ? {
          id: updatedData.subcategory.id,
          name: updatedData.subcategory.name,
          slug: updatedData.subcategory.slug
        } : undefined,
        createdAt: updatedData.createdAt || new Date().toISOString(),
        updatedAt: updatedData.updatedAt || new Date().toISOString()
      };

      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      
      if (currentProduct?.id === id) {
        setCurrentProduct(updatedProduct);
      }
      
      setLastUpdated(new Date().toISOString());
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update product');
    }
  }, [currentProduct]);

  // Select product
  const selectProduct = useCallback((id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      setCurrentProduct(product);
    }
  }, [products]);

  // Setup WebSocket for real-time updates
  useEffect(() => {
    if (!enableRealTimeUpdates || !isConnected) return;

    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/api/ws/products`;
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected for product updates');
        if (productId) {
          wsRef.current?.send(JSON.stringify({
            type: 'subscribe',
            productId
          }));
        }
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'product_update' && message.productId) {
            updateProduct(message.productId, message.fields);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
      };
    } catch (error) {
      console.error('Failed to setup WebSocket:', error);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [enableRealTimeUpdates, isConnected, productId, updateProduct]);

  // Setup auto-refresh interval
  useEffect(() => {
    if (!isConnected || autoRefreshInterval <= 0) return;

    intervalRef.current = setInterval(() => {
      refreshProducts();
    }, autoRefreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [refreshProducts, autoRefreshInterval, isConnected]);

  // Initial load
  useEffect(() => {
    refreshProducts();
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    products,
    currentProduct,
    loading,
    error,
    lastUpdated,
    refreshProducts,
    updateProduct,
    selectProduct,
    isConnected
  };
};

// Hook for product operations
interface UseProductOperationsReturn {
  bulkUpdateProducts: (productIds: string[], updates: Partial<Product>) => Promise<void>;
  operationLoading: boolean;
  operationError: string | null;
}

export const useProductOperations = (): UseProductOperationsReturn => {
  const [operationLoading, setOperationLoading] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);

  const bulkUpdateProducts = useCallback(async (productIds: string[], updates: Partial<Product>) => {
    try {
      setOperationLoading(true);
      setOperationError(null);

      const response = await fetch('/api/products/bulk-update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds,
          updates
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update products: ${response.status}`);
      }

      await response.json();
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : 'Failed to update products');
      throw error;
    } finally {
      setOperationLoading(false);
    }
  }, []);

  return {
    bulkUpdateProducts,
    operationLoading,
    operationError
  };
};