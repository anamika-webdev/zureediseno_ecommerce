// components/optimized/ProductCardOptimized.tsx - Optimized product card
import { memo } from 'react'
import { LazyImage } from './LazyImage'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface ProductCardOptimizedProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    originalPrice?: number
    images: Array<{ url: string; alt: string; isPrimary: boolean }>
    inStock: boolean
    featured: boolean
  }
}

const ProductCardOptimized = memo(({ product }: ProductCardOptimizedProps) => {
  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0]
  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
        <div className="relative aspect-square">
          <LazyImage
            src={primaryImage?.url || '/placeholder.jpg'}
            alt={primaryImage?.alt || product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="group-hover:scale-105 transition-transform duration-300"
          />
          
          {product.featured && (
            <Badge className="absolute top-2 left-2 bg-blue-600 text-white">
              Featured
            </Badge>
          )}
          
          {hasDiscount && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              {Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}% OFF
            </Badge>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                ₹{product.price.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{product.originalPrice!.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
})

ProductCardOptimized.displayName = 'ProductCardOptimized'
export default ProductCardOptimized