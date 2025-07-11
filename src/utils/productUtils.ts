// src/utils/productUtils.ts
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
}

// Database product type (what comes from API)
export interface DatabaseProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  featured: boolean;
  inStock: boolean;
  images: ProductImage[];
  variants?: ProductVariant[];
}

// UI Product type (what ProductCard expects)
export interface UIProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  images: string[];
  featured: boolean;
  inStock: boolean;
  variants?: ProductVariant[];
}

// Transform database product to UI product
export function transformProductForUI(dbProduct: DatabaseProduct): UIProduct {
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

// Transform multiple products
export function transformProductsForUI(dbProducts: DatabaseProduct[]): UIProduct[] {
  return dbProducts.map(transformProductForUI);
}