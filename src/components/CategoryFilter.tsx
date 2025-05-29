'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface Category {
  id: string
  name: string
  url: string
  subcategories: Array<{
    id: string
    name: string
    url: string
  }>
}

export default function CategoryFilter() {
  const [categories, setCategories] = useState<Category[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories-with-subcategories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const isActive = (url: string) => pathname.includes(url)

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-semibold text-lg mb-4">Categories</h3>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-8 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="font-semibold text-lg mb-4">Categories</h3>
      
      <div className="space-y-2">
        <Link
          href="/products"
          className={`block px-3 py-2 rounded text-sm font-medium transition-colors ${
            pathname === '/products' 
              ? 'bg-zuree-red text-white' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          All Products
        </Link>

        {categories.map((category) => (
          <div key={category.id}>
            <div className="flex items-center">
              <Link
                href={`/products/${category.url}`}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(category.url)
                    ? 'text-zuree-red'
                    : 'text-gray-700 hover:text-zuree-red'
                }`}
              >
                {category.name}
              </Link>
              {category.subcategories.length > 0 && (
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {expandedCategories.has(category.id) ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              )}
            </div>

            {expandedCategories.has(category.id) && category.subcategories.length > 0 && (
              <div className="ml-4 space-y-1">
                {category.subcategories.map((subcategory) => (
                  <Link
                    key={subcategory.id}
                    href={`/products/${category.url}/${subcategory.url}`}
                    className={`block px-3 py-1 text-sm transition-colors ${
                      isActive(subcategory.url)
                        ? 'text-zuree-red font-medium'
                        : 'text-gray-600 hover:text-zuree-red'
                    }`}
                  >
                    {subcategory.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}