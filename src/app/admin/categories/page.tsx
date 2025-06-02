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
import { Trash2, Edit, Plus, Star } from 'lucide-react'

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

      fetchCategories()
    } catch (err: any) {
      alert(err.message || 'Failed to delete category')
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
          <p className="text-gray-600 mt-2">Manage your product categories</p>
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div key={category.id} className="border rounded-lg p-6 bg-white shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    {category.featured && (
                      <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">/{category.slug}</p>
                </div>
                
                <div className="flex gap-1">
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

              {category.image && (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
              )}

              <div className="text-xs text-gray-500">
                Created: {new Date(category.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}