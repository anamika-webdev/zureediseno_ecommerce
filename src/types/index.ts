// src/types/index.ts

// Product related types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  comparePrice?: number | null;
  images: string[];
  featured: boolean;
  inStock: boolean;
  categoryId?: string | null;
  subcategoryId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  category?: Category | null;
  subcategory?: Subcategory | null;
}

// Category related types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  subcategories?: Subcategory[];
  products?: Product[];
}

// Subcategory related types
export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
  products?: Product[];
}

// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
  banned?: boolean;
  locked?: boolean;
  privateMetadata?: Record<string, any>;
  lastActiveAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Form props types
export interface CategoryFormProps {
  category?: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface ProductFormProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface SubcategoryFormProps {
  subcategory?: Subcategory | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Prisma select types for queries
export type CategorySelect = {
  id: true;
  name: true;
  slug: true;
  description: true;
  createdAt: true;
  updatedAt: true;
}

export type ProductSelect = {
  id: true;
  name: true;
  slug: true;
  description: true;
  price: true;
  comparePrice: true;
  images: true;
  featured: true;
  inStock: true;
  createdAt: true;
  updatedAt: true;
  category: {
    select: {
      id: true;
      name: true;
      slug: true;
    }
  };
  subcategory: {
    select: {
      id: true;
      name: true;
      slug: true;
    }
  };
}

// Component props types
export interface ProductGridProps {
  products: Product[];
  className?: string;
}

export interface SidebarProps {
  user?: User | null;
  className?: string;
}

export interface UserInfoProps {
  userId?: string;
  className?: string;
}