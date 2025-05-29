'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Category {
  id: string
  name: string
  url: string
}

interface Subcategory {
  id: string
  name: string
  url: string
  image: string | null
  featured: boolean
  sortOrder: number
  categoryId: string
  createdAt: Date
  updatedAt: Date
}

interface SubcategoryFormProps {
  subcategory?: Subcategory | null
  onSubcategoryAdded: () => void
  closeModal: () => void
}

export default function SubcategoryForm({ 
  subcategory, 
  onSubcategoryAdded, 
  closeModal 
}: SubcategoryFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    categoryId: '',
    featured: false,
    sortOrder: 0
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>('')

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  // Reset form when subcategory changes
  useEffect(() => {
    if (subcategory) {
      setFormData({
        name: subcategory.name || '',
        url: subcategory.url || '',
        categoryId: subcategory.categoryId || '',
        featured: Boolean(subcategory.featured),
        sortOrder: subcategory.sortOrder || 0
      })
    } else {
      setFormData({ 
        name: '', 
        url: '', 
        categoryId: '', 
        featured: false, 
        sortOrder: 0 
      })
    }
    setImageFile(null)
    setError('')
  }, [subcategory])

  const generateUrl = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData(prev => ({
      ...prev,
      name,
      url: generateUrl(name)
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Subcategory name is required')
      return
    }
    if (!formData.url.trim()) {
      setError('URL is required')
      return
    }
    if (!formData.categoryId) {
      setError('Category is required')
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = new FormData()
      
      if (subcategory?.id) {
        submitData.append('id', subcategory.id)
      }
      
      submitData.append('name', formData.name.trim())
      submitData.append('url', formData.url.trim())
      submitData.append('categoryId', formData.categoryId)
      submitData.append('featured', String(formData.featured))
      submitData.append('sortOrder', String(formData.sortOrder))
      
      if (imageFile) {
        submitData.append('image', imageFile)
      }

      const response = await fetch('/api/subcategories', {
        method: 'POST',
        body: submitData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save subcategory')
      }

      onSubcategoryAdded()
    } catch (err: any) {
      setError(err.message || 'Failed to save subcategory')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="categoryId">Parent Category *</Label>
          <Select value={formData.categoryId} onValueChange={(value) => 
            setFormData(prev => ({ ...prev, categoryId: value }))
          }>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Subcategory Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={handleNameChange}
            placeholder="e.g., T-Shirts"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="url">URL Slug *</Label>
          <Input
            id="url"
            value={formData.url}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              url: generateUrl(e.target.value) 
            }))}
            placeholder="e.g., t-shirts"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input
            id="sortOrder"
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              sortOrder: parseInt(e.target.value) || 0 
            }))}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Subcategory Image (optional)</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="featured"
            checked={formData.featured}
            onCheckedChange={(checked) =>
              setFormData(prev => ({ ...prev, featured: Boolean(checked) }))
            }
          />
          <Label htmlFor="featured">Featured on homepage</Label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Saving...'
              : subcategory
              ? 'Update Subcategory'
              : 'Create Subcategory'}
          </Button>
          <Button type="button" variant="outline" onClick={closeModal}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
