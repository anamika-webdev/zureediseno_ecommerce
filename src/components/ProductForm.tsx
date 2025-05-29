
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  subcategories?: Subcategory[]
}

interface Subcategory {
  id: string
  name: string
  url: string
}

interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  comparePrice?: number
  images: string[]
  featured: boolean
  inStock: boolean
  categoryId?: string
  subcategoryId?: string
}

interface ProductFormProps {
  product?: Product | null
  onProductAdded: () => void
  closeModal: () => void
}

export default function ProductForm({ 
  product, 
  onProductAdded, 
  closeModal 
}: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    comparePrice: '',
    categoryId: '',
    subcategoryId: '',
    featured: false,
    inStock: true
  })
  const [imageFiles, setImageFiles] = useState<FileList | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>('')

  // EMERGENCY FIX: Simplified fetch with better error handling
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        console.log('🔍 Fetching categories...')
        
        // Try the main categories endpoint first
        let response = await fetch('/api/categories')
        
        if (!response.ok) {
          console.error('❌ Categories API failed:', response.status, response.statusText)
          // Set empty categories to prevent crash
          setCategories([])
          return
        }
        
        const categoriesData = await response.json()
        console.log('✅ Categories loaded:', categoriesData.length)
        
        // Try to get categories with subcategories
        try {
          response = await fetch('/api/categories-with-subcategories')
          if (response.ok) {
            const categoriesWithSubs = await response.json()
            setCategories(categoriesWithSubs)
            console.log('✅ Categories with subcategories loaded')
          } else {
            // Fallback to basic categories
            setCategories(categoriesData)
            console.log('⚠️ Using basic categories (no subcategories)')
          }
        } catch (subError) {
          console.warn('⚠️ Subcategories fetch failed, using basic categories')
          setCategories(categoriesData)
        }
        
      } catch (error) {
        console.error('❌ Failed to fetch categories:', error)
        setError('Failed to load categories. You can still create products without categories.')
        setCategories([]) // Prevent crash
      } finally {
        setLoading(false)
      }
    }
    
    fetchCategories()
  }, [])

  // Update subcategories when category changes
  useEffect(() => {
    const selectedCategory = categories.find(cat => cat.id === formData.categoryId)
    setSubcategories(selectedCategory?.subcategories || [])
    if (selectedCategory && formData.subcategoryId) {
      const subcategoryExists = selectedCategory.subcategories?.some(sub => sub.id === formData.subcategoryId)
      if (!subcategoryExists) {
        setFormData(prev => ({ ...prev, subcategoryId: '' }))
      }
    }
  }, [formData.categoryId, categories])

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        comparePrice: product.comparePrice?.toString() || '',
        categoryId: product.categoryId || '',
        subcategoryId: product.subcategoryId || '',
        featured: Boolean(product.featured),
        inStock: Boolean(product.inStock)
      })
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        price: '',
        comparePrice: '',
        categoryId: '',
        subcategoryId: '',
        featured: false,
        inStock: true
      })
    }
    setImageFiles(null)
    setError('')
  }, [product])

  const generateSlug = (name: string): string => {
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
      slug: generateSlug(name)
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.name.trim()) {
      setError('Product name is required')
      return
    }
    if (!formData.slug.trim()) {
      setError('Slug is required')
      return
    }
    if (!formData.price) {
      setError('Price is required')
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = new FormData()
      
      if (product?.id) {
        submitData.append('id', product.id)
      }
      
      submitData.append('name', formData.name.trim())
      submitData.append('slug', formData.slug.trim())
      submitData.append('description', formData.description.trim())
      submitData.append('price', formData.price)
      if (formData.comparePrice) {
        submitData.append('comparePrice', formData.comparePrice)
      }
      if (formData.categoryId) {
        submitData.append('categoryId', formData.categoryId)
      }
      if (formData.subcategoryId) {
        submitData.append('subcategoryId', formData.subcategoryId)
      }
      submitData.append('featured', String(formData.featured))
      submitData.append('inStock', String(formData.inStock))
      
      // Add image files
      if (imageFiles) {
        for (let i = 0; i < imageFiles.length; i++) {
          submitData.append('images', imageFiles[i])
        }
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        body: submitData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save product')
      }

      onProductAdded()
    } catch (err: any) {
      setError(err.message || 'Failed to save product')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {loading && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-700 text-sm">Loading categories...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="e.g., Cotton T-Shirt"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                slug: generateSlug(e.target.value) 
              }))}
              placeholder="e.g., cotton-t-shirt"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Product description..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="29.99"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comparePrice">Compare Price</Label>
            <Input
              id="comparePrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.comparePrice}
              onChange={(e) => setFormData(prev => ({ ...prev, comparePrice: e.target.value }))}
              placeholder="39.99"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <Select 
              value={formData.categoryId} 
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, categoryId: value, subcategoryId: '' }))
              }
              disabled={categories.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={categories.length === 0 ? "No categories available" : "Select a category"} />
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
            <Label htmlFor="subcategoryId">Subcategory</Label>
            <Select 
              value={formData.subcategoryId} 
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, subcategoryId: value }))
              }
              disabled={!formData.categoryId || subcategories.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a subcategory" />
              </SelectTrigger>
              <SelectContent>
                {subcategories.map((subcategory) => (
                  <SelectItem key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="images">Product Images</Label>
          <Input
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImageFiles(e.target.files)}
          />
          <p className="text-xs text-gray-500">
            You can select multiple images. First image will be the main image.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, featured: Boolean(checked) }))
              }
            />
            <Label htmlFor="featured">Featured product</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="inStock"
              checked={formData.inStock}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, inStock: Boolean(checked) }))
              }
            />
            <Label htmlFor="inStock">In stock</Label>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Saving...'
              : product
              ? 'Update Product'
              : 'Create Product'}
          </Button>
          <Button type="button" variant="outline" onClick={closeModal}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}