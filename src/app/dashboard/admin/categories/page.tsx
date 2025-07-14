// src/app/dashboard/admin/categories/page.tsx - QUICK FIX
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import SimpleCategoryForm from '@/components/admin/SimpleCategoryForm'
import { Trash2, Edit, Plus, Star } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true)
      
      console.log('📥 Fetching categories from /api/admin/categories...'); // Debug log
      
      const response = await fetch('/api/admin/categories', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('📡 Categories API response status:', response.status); // Debug log
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Categories API error:', errorText); // Debug log
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('📊 Categories data received:', data); // Debug log
      
      // ✅ FIXED: Ensure data is always an array
      const categoriesArray = Array.isArray(data) ? data : []
      console.log('📥 Categories processed:', categoriesArray.length, 'categories'); // Debug log
      
      setCategories(categoriesArray)
    } catch (err: any) {
      console.error('❌ Error fetching categories:', err)
      toast.error(err.message || 'Failed to fetch categories')
      setCategories([]) // ✅ Set empty array on error
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

  // Handle create new
  const handleCreateNew = () => {
    setSelectedCategory(null)
    setIsDialogOpen(true)
  }

  // Handle edit
  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setIsDialogOpen(true)
  }


  // Handle delete
  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      console.log('🗑️ Starting delete process for category:', categoryId);
      
      const deleteUrl = `/api/admin/categories/${categoryId}`;
      console.log('🔗 Delete URL:', deleteUrl);
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Delete response status:', response.status);
      console.log('📡 Delete response headers:', Object.fromEntries(response.headers.entries()));

      // Get response text first to avoid JSON parsing issues
      const responseText = await response.text();
      console.log('📥 Delete response text (raw):', responseText);

      if (!response.ok) {
        console.error('❌ Delete request failed with status:', response.status);
        
        let errorMessage = `Delete failed (${response.status})`;
        
        if (responseText) {
          try {
            const errorData = JSON.parse(responseText);
            console.error('❌ Delete error data:', errorData);
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (parseError) {
            console.error('❌ Could not parse error response:', parseError);
            errorMessage = `${errorMessage}: ${responseText}`;
          }
        }
        
        throw new Error(errorMessage);
      }

      // Try to parse success response
      let result = { success: true, message: 'Deleted successfully' };
      if (responseText) {
        try {
          result = JSON.parse(responseText);
          console.log('✅ Delete success response:', result);
        } catch (parseError) {
          console.log('⚠️ Could not parse success response, but delete succeeded');
        }
      }
      
      toast.success(result.message || 'Category deleted successfully');
      fetchCategories();
      
    } catch (err: any) {
      console.error('❌ Delete operation failed:', err);
      
      let errorMessage = 'Failed to delete category';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object') {
        errorMessage = err.message || err.error || JSON.stringify(err);
      }
      
      console.error('❌ Final error message:', errorMessage);
      toast.error(errorMessage);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-gray-600">Manage your product categories</p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No categories found. Create your first category!</p>
          <Button onClick={handleCreateNew} className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Create First Category
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="border rounded-lg p-4 space-y-4">
              {/* Category Image */}
              <div className="aspect-video relative bg-gray-100 rounded overflow-hidden">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      // Hide broken images
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <span>No Image</span>
                  </div>
                )}
                
                {category.featured && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </div>
                )}
              </div>

              {/* Category Info */}
              <div>
                <h3 className="font-semibold text-lg">{category.name}</h3>
                <p className="text-sm text-gray-500">/{category.slug}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Order: {category.sortOrder}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(category)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(category.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <SimpleCategoryForm
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={handleFormSuccess}
        category={selectedCategory}
      />
    </div>
  )
}