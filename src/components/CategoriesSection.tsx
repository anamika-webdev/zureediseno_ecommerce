'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  url: string
  image: string | null
  featured: boolean
  subcategories?: Array<{
    id: string
    name: string
    url: string
    image: string | null
    featured: boolean
  }>
}

export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories-with-subcategories')
        if (response.ok) {
          const data = await response.json()
          // Show only featured categories
          setCategories(data.filter((cat: Category) => cat.featured))
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-3"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (categories.length === 0) return null

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Category Header */}
              <Link
                href={`/products/${category.url}`}
                className="block relative overflow-hidden aspect-video bg-gray-100"
              >
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-4xl">📦</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-end">
                  <div className="w-full p-4">
                    <h3 className="text-white font-bold text-xl text-center bg-black bg-opacity-60 rounded px-3 py-2">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </Link>

              {/* Subcategories */}
              {category.subcategories && category.subcategories.length > 0 && (
                <div className="p-4">
                  <h4 className="font-semibold text-sm text-gray-600 mb-3 uppercase tracking-wide">
                    Browse by Type
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {category.subcategories
                      .filter(sub => sub.featured)
                      .slice(0, 4)
                      .map((subcategory) => (
                        <Link
                          key={subcategory.id}
                          href={`/products/${category.url}/${subcategory.url}`}
                          className="text-sm text-gray-700 hover:text-zuree-red hover:bg-gray-50 px-3 py-2 rounded transition-colors"
                        >
                          {subcategory.name}
                        </Link>
                      ))
                    }
                  </div>
                  {category.subcategories.length > 4 && (
                    <Link
                      href={`/products/${category.url}`}
                      className="text-sm text-zuree-red hover:underline mt-2 block"
                    >
                      View all {category.name.toLowerCase()} →
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}