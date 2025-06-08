// src/types/admin.ts - Shared types for admin components

// Base interfaces for database entities
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  categoryId: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
  };
}

// Product related interfaces
export interface ProductImage {
  id?: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductVariant {
  id?: string;
  size: string;
  color: string;
  stock: number;
  sku?: string;
  sleeveType?: string;
}

// Form data interface for product forms
export interface ProductFormData {
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  originalPrice?: number;
  sku?: string;
  categoryId: string;
  subcategoryId?: string;
  featured: boolean;
  inStock: boolean;
  sortOrder: number;
  images: ProductImage[];
  variants: ProductVariant[];
}

// API response interface for products
export interface ProductResponse {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  price: number | string; // Can be Decimal from Prisma
  originalPrice?: number | string;
  sku?: string;
  categoryId: string;
  subcategoryId?: string;
  featured: boolean;
  inStock: boolean;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
  };
  subcategory?: {
    id: string;
    name: string;
  };
  images?: ProductImage[];
  variants?: ProductVariant[];
}

// Helper type guards
export const isProductResponse = (obj: any): obj is ProductResponse => {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
};

export const isProductFormData = (obj: any): obj is ProductFormData => {
  return obj && typeof obj.name === 'string' && typeof obj.price === 'number';
};

// Transform functions
export const transformToFormData = (product: ProductResponse): ProductFormData => {
  const toNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value) || 0;
    if (value && typeof value === 'object' && 'toNumber' in value) {
      return value.toNumber();
    }
    return 0;
  };

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: toNumber(product.price),
    originalPrice: product.originalPrice ? toNumber(product.originalPrice) : undefined,
    sku: product.sku,
    categoryId: product.categoryId,
    subcategoryId: product.subcategoryId,
    featured: product.featured,
    inStock: product.inStock,
    sortOrder: product.sortOrder || 0,
    images: Array.isArray(product.images) ? product.images : [],
    variants: Array.isArray(product.variants) ? product.variants : [],
  };
};

export const formatPrice = (price: any): string => {
  const toNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value) || 0;
    if (value && typeof value === 'object' && 'toNumber' in value) {
      return value.toNumber();
    }
    return 0;
  };

  const numPrice = toNumber(price);
  return numPrice.toFixed(2);
};

// Form validation helpers
export const validateProductForm = (data: ProductFormData): string[] => {
  const errors: string[] = [];

  if (!data.name.trim()) {
    errors.push('Product name is required');
  }

  if (!data.categoryId) {
    errors.push('Category is required');
  }

  if (data.price <= 0) {
    errors.push('Price must be greater than 0');
  }

  if (!Array.isArray(data.images) || data.images.length === 0) {
    errors.push('At least one product image is required');
  }

  if (!Array.isArray(data.variants) || data.variants.length === 0) {
    errors.push('At least one product variant is required');
  } else {
    const validVariants = data.variants.filter(v => 
      v.size && v.color && v.stock >= 0
    );
    if (validVariants.length === 0) {
      errors.push('At least one valid variant with size and color is required');
    }
  }

  return errors;
};

// Constants for form options
export const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export const COLOR_OPTIONS = [
  'White', 'Black', 'Navy', 'Blue', 'Red', 'Green', 
  'Yellow', 'Purple', 'Pink', 'Orange', 'Brown', 'Gray', 'Beige'
];

export const SLEEVE_OPTIONS = ['Short Sleeve', 'Full Sleeve', '3/4 Sleeve'];

// Modal props interfaces
export interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: ProductFormData | null;
}

export interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: Category | null;
}

export interface SubcategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subcategory?: Subcategory | null;
}