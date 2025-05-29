// src/components/ProductGrid.tsx
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'

// Product type that matches your database structure
interface Product {
  id: string
  name: string
  slug: string
  description?: string | null
  price: number
  comparePrice?: number | null
  images: string[]
  featured: boolean
  inStock: boolean
  category?: {
    id: string
    name: string
  } | null
  subcategory?: {
    id: string
    name: string
  } | null
}

interface ProductGridProps {
  products: Product[]
  className?: string
}

import { formatPrice, formatCurrency, isOnSale } from '@/lib/utils';

export default function ProductGrid({ products, className = '' }: ProductGridProps) {
  // Add null/undefined check first
  if (!products || !Array.isArray(products)) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">Loading products...</div>
        <p className="text-gray-600">Please wait while we fetch the products.</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">No products found</div>
        <p className="text-gray-600">Check back later for new products!</p>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {products.map((product) => {
        // Safely handle images
        const images = Array.isArray(product.images) ? product.images : [];
        const hasImage = images.length > 0;

        return (
          <Link
            key={product.id}
            href={`/product/${product.slug}`}
            className="group bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200"
          >
            <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gray-100">
              {hasImage ? (
                <Image
                  src={images[0]}
                  alt={product.name || 'Product image'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📦</div>
                    <div className="text-sm">No Image</div>
                  </div>
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.featured && (
                  <Badge className="bg-purple-500 text-white">Featured</Badge>
                )}
                {!product.inStock && (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
                {isOnSale(product.price, product.comparePrice) && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Sale
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                {product.name}
              </h3>
              
              {product.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {product.description}
                </p>
              )}
              
              <div className="flex items-center gap-2 mb-2">
                {product.category && (
                  <Badge variant="outline" className="text-xs">
                    {product.category.name}
                  </Badge>
                )}
                {product.subcategory && (
                  <Badge variant="outline" className="text-xs bg-gray-50">
                    {product.subcategory.name}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(product.price)}
                  </span>
                  {isOnSale(product.price, product.comparePrice) && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatCurrency(product.comparePrice)}
                    </span>
                  )}
                </div>
                
                {!product.inStock && (
                  <span className="text-sm text-red-600 font-medium">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  )
}