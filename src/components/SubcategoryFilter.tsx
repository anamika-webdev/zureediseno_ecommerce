'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Subcategory {
  id: string
  name: string
  url: string
  _count?: {
    products: number
  }
}

interface SubcategoryFilterProps {
  subcategories: Subcategory[]
  categoryUrl: string
  currentSubcategory?: string
  className?: string
}

export default function SubcategoryFilter({ 
  subcategories, 
  categoryUrl, 
  currentSubcategory,
  className = '' 
}: SubcategoryFilterProps) {
  const [showAll, setShowAll] = useState(false)
  const displaySubcategories = showAll ? subcategories : subcategories.slice(0, 8)

  if (subcategories.length === 0) {
    return null
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Filter by Subcategory</h3>
      
      <div className="space-y-3">
        {/* All Products Link */}
        <Link
          href={`/products/${categoryUrl}`}
          className={`block px-3 py-2 rounded-md text-sm transition-colors ${
            !currentSubcategory 
              ? 'bg-blue-100 text-blue-800 font-medium' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          All Products
        </Link>
        
        {/* Subcategory Links */}
        {displaySubcategories.map((subcategory) => (
          <Link
            key={subcategory.id}
            href={`/products/${categoryUrl}/${subcategory.url}`}
            className={`flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
              currentSubcategory === subcategory.url
                ? 'bg-blue-100 text-blue-800 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span>{subcategory.name}</span>
            {subcategory._count && (
              <Badge variant="secondary" className="text-xs">
                {subcategory._count.products}
              </Badge>
            )}
          </Link>
        ))}
        
        {/* Show More/Less Button */}
        {subcategories.length > 8 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="w-full mt-2"
          >
            {showAll ? 'Show Less' : `Show ${subcategories.length - 8} More`}
          </Button>
        )}
      </div>
    </div>
  )
}