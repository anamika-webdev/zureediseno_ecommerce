import { Prisma } from "@prisma/client";

export interface DashboardSidebarMenuInterface {
  label: string;
  icon: string;
  link: string;
}

// SubCategory with parent category - define directly
export interface SubCategoryWithCategoryType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    slug: string;
    description?: string;
  };
}

// Search result interface for the search component
export interface SearchResult {
  id: string;
  name: string;
  description?: string;
  price?: number;
  image?: string;
  category?: string;
  slug?: string;
}

// Product related types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  originalPrice?: number;
  sku: string;
  inStock: boolean;
  featured: boolean;
  categoryId: string;
  subcategoryId?: string;
  images: ProductImage[];
  variants: ProductVariant[];
  category?: Category;
  subcategory?: Subcategory;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  stock: number;
  sleeveType?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  featured?: boolean;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  categoryId: string;
  category?: Category;
}

// Cart related types
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  size?: string;
  color?: string;
  quantity: number;
}

// Order related types
export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  image?: string;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  totalAmount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

// User related types
export interface User {
  id: string;
  clerkId: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}