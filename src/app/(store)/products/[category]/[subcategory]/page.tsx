// src/app/(store)/products/[category]/[subcategory]/page.tsx
import { getProductsBySubcategory } from '@/lib/queries/products'
import ProductGrid from '@/components/ProductGrid'
import { notFound } from 'next/navigation'
import { Decimal } from '@prisma/client/runtime/library'

interface SubcategoryPageProps {
  params: Promise<{
    category: string
    subcategory: string
  }>
}

// Helper function to convert Decimal to number
function convertPriceToNumber(price: Decimal | number): number {
  if (typeof price === 'number') return price
  return parseFloat(price.toString())
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  try {
    const { category, subcategory } = await params;
    
    const rawProducts = await getProductsBySubcategory(subcategory)
    
    if (!rawProducts || rawProducts.length === 0) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">
              {category} / {subcategory}
            </h1>
            <p className="text-gray-600">No products found in this subcategory.</p>
          </div>
        </div>
      )
    }

    // Convert Decimal prices to numbers for component compatibility
    const products = rawProducts.map(product => ({
      ...product,
      price: convertPriceToNumber(product.price),
      originalPrice: product.originalPrice ? convertPriceToNumber(product.originalPrice) : undefined,
      comparePrice: product.comparePrice ? convertPriceToNumber(product.comparePrice) : undefined,
    }))

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {products[0]?.subcategory?.name || subcategory}
          </h1>
          <p className="text-gray-600">
            {products.length} product{products.length !== 1 ? 's' : ''} found
          </p>
        </div>
        
        <ProductGrid products={products} />
      </div>
    )
  } catch (error) {
    console.error('Error loading subcategory page:', error)
    notFound()
  }
}