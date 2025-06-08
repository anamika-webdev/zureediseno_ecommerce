// src/hooks/useAutoUpdateProducts.ts
import { useState, useEffect, useCallback, useRef } from 'react';

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
  category: {
    id: string;
    name: string;
    slug: string;
  };
  subcategory?: {
    id: string;
    name: string;
    slug: string;
  };
  totalStock: number;
  availableColors: string[];
  availableSizes: string[];
  availableSleeveTypes: string[];
  createdAt: string;
  updatedAt: string;
}

interface UseAutoUpdateProductsOptions {
  productId?: string;
  includeVariants?: boolean;
  includeImages?: boolean;
  autoRefreshInterval?: number; // in milliseconds
  enableRealTimeUpdates?: boolean;
}

interface UseAutoUpdateProductsReturn {
  products: Product[];
  currentProduct: Product | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  refreshProducts: () => Promise<void>;
  updateProduct: (productId: string, updateFields: string[]) => Promise<boolean>;
  selectProduct: (productId: string) => void;
  isConnected: boolean;
}

export function useAutoUpdateProducts(
  options: UseAutoUpdateProductsOptions = {}
): UseAutoUpdateProductsReturn {
  const {
    productId,
    includeVariants = true,
    includeImages = true,
    autoRefreshInterval = 30000, // 30 seconds default
    enableRealTimeUpdates = false
  } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch products from API
  const fetchProducts = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (productId) params.append('productId', productId);
      if (includeVariants) params.append('includeVariants', 'true');
      if (includeImages) params.append('includeImages', 'true');

      const response = await fetch(`/api/products/auto-update?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        if (productId && data.product) {
          // Single product mode
          setProducts([data.product]);
          setCurrentProduct(data.product);
        } else if (data.products) {
          // Multiple products mode
          setProducts(data.products);
          if (data.products.length > 0 && !currentProduct) {
            setCurrentProduct(data.products[0]);
          }
        }
        setLastUpdated(data.lastUpdated || new Date().toISOString());
        setIsConnected(true);
      } else {
        throw new Error(data.error || 'Failed to fetch products');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setIsConnected(false);
      console.error('Error fetching products:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [productId, includeVariants, includeImages, currentProduct]);

  // Update specific product
  const updateProduct = useCallback(async (productId: string, updateFields: string[]): Promise<boolean> => {
    try {
      const response = await fetch('/api/products/auto-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds: [productId],
          updateFields
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.results[0]?.success) {
        // Refresh products to get updated data
        await fetchProducts(false);
        return true;
      } else {
        const errorMessage = data.results[0]?.error || 'Failed to update product';
        setError(errorMessage);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error updating product:', err);
      return false;
    }
  }, [fetchProducts]);

  // Select a specific product as current
  const selectProduct = useCallback((productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setCurrentProduct(product);
    }
  }, [products]);

  // Set up WebSocket for real-time updates
  useEffect(() => {
    if (!enableRealTimeUpdates) return;

    const connectWebSocket = () => {
      try {
        // Replace with your actual WebSocket URL
        const wsUrl = process.env.NODE_ENV === 'production' 
          ? 'wss://your-domain.com/ws/products'
          : 'ws://localhost:3000/ws/products';
        
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log('WebSocket connected for product updates');
          setIsConnected(true);
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'PRODUCT_UPDATED') {
              // Update specific product in state
              setProducts(prev => prev.map(product => 
                product.id === data.productId 
                  ? { ...product, ...data.updates, updatedAt: new Date().toISOString() }
                  : product
              ));
              
              // Update current product if it's the one that changed
              if (currentProduct?.id === data.productId) {
                setCurrentProduct(prev => prev ? { ...prev, ...data.updates } : null);
              }
              
              setLastUpdated(new Date().toISOString());
            } else if (data.type === 'BULK_UPDATE') {
              // Refresh all products
              fetchProducts(false);
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };

        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };

        wsRef.current.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
          
          // Attempt to reconnect after 5 seconds
          setTimeout(connectWebSocket, 5000);
        };
      } catch (err) {
        console.error('Error connecting to WebSocket:', err);
        setIsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [enableRealTimeUpdates, currentProduct?.id, fetchProducts]);

  // Set up auto-refresh interval
  useEffect(() => {
    if (autoRefreshInterval > 0 && !enableRealTimeUpdates) {
      intervalRef.current = setInterval(() => {
        fetchProducts(false); // Don't show loading spinner for background updates
      }, autoRefreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefreshInterval, enableRealTimeUpdates, fetchProducts]);

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Cleanup on unmount
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

  // Manual refresh function
  const refreshProducts = useCallback(async () => {
    await fetchProducts(true);
  }, [fetchProducts]);

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
}

// Additional hook for product-specific operations
export function useProductOperations() {
  const [operationLoading, setOperationLoading] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);

  const bulkUpdateProducts = useCallback(async (
    productIds: string[], 
    updateFields: string[]
  ): Promise<{ success: boolean; results: any[] }> => {
    try {
      setOperationLoading(true);
      setOperationError(null);

      const response = await fetch('/api/products/auto-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds,
          updateFields
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return { success: true, results: data.results };
      } else {
        throw new Error(data.error || 'Failed to bulk update products');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setOperationError(errorMessage);
      console.error('Error in bulk update:', err);
      return { success: false, results: [] };
    } finally {
      setOperationLoading(false);
    }
  }, []);

  const refreshProductCache = useCallback(async (): Promise<boolean> => {
    try {
      setOperationLoading(true);
      setOperationError(null);

      // This could trigger a cache refresh on your backend
      const response = await fetch('/api/products/refresh-cache', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setOperationError(errorMessage);
      console.error('Error refreshing cache:', err);
      return false;
    } finally {
      setOperationLoading(false);
    }
  }, []);

  return {
    bulkUpdateProducts,
    refreshProductCache,
    operationLoading,
    operationError
  };
}