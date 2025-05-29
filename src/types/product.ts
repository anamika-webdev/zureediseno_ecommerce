// src/types/product.ts
export interface ProductProps {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  comparePrice?: number
  images: string[]
  featured: boolean
  inStock: boolean
  category?: {
    id: string
    name: string
  }
  subcategory?: {
    id: string
    name: string
  }
  sizes?: string[]
  colors?: string[]
}

export interface CartItem extends ProductProps {
  quantity: number
  selectedSize?: string
  selectedColor?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  sortOrder?: number
  createdAt: string
  updatedAt?: string
}

export interface Subcategory {
  id: string
  name: string
  slug: string
  categoryId: string
  description?: string
  image?: string
  sortOrder?: number
  createdAt: string
  updatedAt?: string
}

export interface CategoryWithSubcategories extends Category {
  subcategories: Subcategory[]
}