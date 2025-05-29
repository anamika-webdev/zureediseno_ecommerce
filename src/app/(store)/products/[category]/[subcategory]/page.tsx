// src/app/(store)/products/[category]/[subcategory]/page.tsx
import { getProductsBySubcategory } from '@/lib/queries/products'
import ProductGrid from '@/components/ProductGrid'
import { notFound } from 'next/navigation'

interface SubcategoryPageProps {
  params: {
    category: string
    subcategory: string
  }
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  try {
    const products = await getProductsBySubcategory(params.subcategory)
    
    if (!products || products.length === 0) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">
              {params.category} / {params.subcategory}
            </h1>
            <p className="text-gray-600">No products found in this subcategory.</p>
          </div>
        </div>
      )
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {products[0]?.subcategory?.name || params.subcategory}
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