// src/components/admin/SubcategoryFormModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface SubcategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subcategory?: Subcategory | null;
}

export default function SubcategoryFormModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  subcategory 
}: SubcategoryFormModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    categoryId: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // Set form data when subcategory changes
  useEffect(() => {
    if (subcategory) {
      setFormData({
        name: subcategory.name,
        slug: subcategory.slug,
        categoryId: subcategory.categoryId,
        description: subcategory.description || ''
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        categoryId: '',
        description: ''
      });
    }
  }, [subcategory]);

  // Generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const generatedSlug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    
    setFormData(prev => ({
      ...prev,
      name,
      slug: generatedSlug
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.categoryId) {
      toast.error('Name and category are required');
      return;
    }

    if (!formData.slug.trim()) {
      toast.error('URL slug is required');
      return;
    }

    setIsLoading(true);

    try {
      const url = subcategory 
        ? `/api/admin/subcategories/${subcategory.id}` 
        : '/api/admin/subcategories';
      
      const method = subcategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          categoryId: formData.categoryId,
          description: formData.description.trim() || undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save subcategory');
      }

      toast.success(subcategory ? 'Subcategory updated successfully' : 'Subcategory created successfully');
      onSuccess();
    } catch (error) {
      console.error('Error saving subcategory:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save subcategory');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {subcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Enter subcategory name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="subcategory-url-slug"
              required
            />
            <p className="text-xs text-gray-500">
              This will be used in the URL: /products/category/{formData.slug}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Category *</Label>
            <Select 
              value={formData.categoryId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
            >
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter subcategory description (optional)"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : subcategory ? 'Update Subcategory' : 'Create Subcategory'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}