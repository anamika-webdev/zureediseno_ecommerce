// src/types/product.ts
export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
  productId: string;
  createdAt: Date;
}

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  stock: number;
  sleeveType?: string;
  productId: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  categoryId: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;           // Changed from Decimal to number
  originalPrice?: number | null;  // Changed from Decimal to number
  comparePrice?: number | null;   // Changed from Decimal to number
  sku: string | null;
  inStock: boolean;
  featured: boolean;
  images: ProductImage[];
  variants?: ProductVariant[];
  category: Category;
  subcategory?: Subcategory | null;
  categoryId: string;
  subcategoryId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  image?: string; // For compatibility
}

// For simplified product display (backwards compatibility)
export interface SimpleProduct {
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