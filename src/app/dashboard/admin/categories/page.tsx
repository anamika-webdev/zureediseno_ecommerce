// src/app/admin/categories/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { CategoryForm, SerializableCategory } from '@/components/CategoryForm'
import { Trash2, Edit, Plus, Star, GripVertical, ArrowUp, ArrowDown } from 'lucide-react'
import { toast } from 'sonner'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<SerializableCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<SerializableCategory | null>(null)
  const [error, setError] = useState<string>('')

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      
      const data = await response.json()
      // Convert Date objects to strings for serialization
      const serializedData: SerializableCategory[] = data.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
        image: cat.image || '',
        featured: cat.featured || false,
        sortOrder: cat.sortOrder || 0,
        createdAt: new Date(cat.createdAt).toISOString(),
        updatedAt: new Date(cat.updatedAt).toISOString()
      }))
      setCategories(serializedData)
      setError('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Handle form success
  const handleFormSuccess = () => {
    setIsDialogOpen(false)
    setSelectedCategory(null)
    fetchCategories()
  }

  // Handle form cancel
  const handleFormCancel = () => {
    setIsDialogOpen(false)
    setSelectedCategory(null)
  }

  // Handle edit
  const handleEdit = (category: SerializableCategory) => {
    setSelectedCategory(category)
    setIsDialogOpen(true)
  }

  // Handle delete
  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete category')
      }

      toast.success('Category deleted successfully')
      fetchCategories()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete category')
    }
  }

  // Handle move up/down
  const moveCategoryUp = async (category: SerializableCategory, index: number) => {
    if (index === 0) return

    const newCategories = [...categories]
    const currentCategory = newCategories[index]
    const previousCategory = newCategories[index - 1]

    // Swap sort orders
    const tempSortOrder = currentCategory.sortOrder
    currentCategory.sortOrder = previousCategory.sortOrder
    previousCategory.sortOrder = tempSortOrder

    // Update in database
    try {
      await Promise.all([
        updateCategorySortOrder(currentCategory.id, currentCategory.sortOrder),
        updateCategorySortOrder(previousCategory.id, previousCategory.sortOrder)
      ])

      // Swap in array
      newCategories[index] = previousCategory
      newCategories[index - 1] = currentCategory
      
      setCategories(newCategories)
      toast.success('Category order updated')
    } catch (error) {
      toast.error('Failed to update category order')
    }
  }

  const moveCategoryDown = async (category: SerializableCategory, index: number) => {
    if (index === categories.length - 1) return

    const newCategories = [...categories]
    const currentCategory = newCategories[index]
    const nextCategory = newCategories[index + 1]

    // Swap sort orders
    const tempSortOrder = currentCategory.sortOrder
    currentCategory.sortOrder = nextCategory.sortOrder
    nextCategory.sortOrder = tempSortOrder

    // Update in database
    try {
      await Promise.all([
        updateCategorySortOrder(currentCategory.id, currentCategory.sortOrder),
        updateCategorySortOrder(nextCategory.id, nextCategory.sortOrder)
      ])

      // Swap in array
      newCategories[index] = nextCategory
      newCategories[index + 1] = currentCategory
      
      setCategories(newCategories)
      toast.success('Category order updated')
    } catch (error) {
      toast.error('Failed to update category order')
    }
  }

  const updateCategorySortOrder = async (categoryId: string, sortOrder: number) => {
    const response = await fetch(`/api/admin/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sortOrder }),
    })

    if (!response.ok) {
      throw new Error('Failed to update sort order')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading categories...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Category Management</h1>
          <p className="text-gray-600 mt-2">Manage your product categories and their display order</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedCategory(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedCategory ? 'Edit Category' : 'Add New Category'}
              </DialogTitle>
            </DialogHeader>
            <CategoryForm
              category={selectedCategory}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No categories found</p>
          <p className="text-gray-400">Create your first category to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-lg">Categories (Ordered by Display Order)</h3>
            <p className="text-sm text-gray-600">Categories are displayed in this order on your website</p>
          </div>
          
          <div className="divide-y">
            {categories.map((category, index) => (
              <div key={category.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveCategoryUp(category, index)}
                        disabled={index === 0}
                        className="p-1 h-6 w-6"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveCategoryDown(category, index)}
                        disabled={index === categories.length - 1}
                        className="p-1 h-6 w-6"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <GripVertical className="w-5 h-5 text-gray-400" />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{category.name}</h3>
                        {category.featured && (
                          <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                        )}
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Order: {category.sortOrder}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">/{category.slug}</p>
                      <div className="text-xs text-gray-500 mt-1">
                        Created: {new Date(category.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {category.image && (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}