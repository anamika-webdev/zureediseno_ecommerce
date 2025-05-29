// src/components/admin/SubcategoryFormModal.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: ''
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch categories
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // Update form when subcategory changes
  useEffect(() => {
    if (subcategory) {
      setFormData({
        name: subcategory.name || '',
        description: subcategory.description || '',
        categoryId: subcategory.categoryId || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        categoryId: ''
      });
    }
  }, [subcategory]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.categoryId) {
      toast.error('Name and category are required');
      return;
    }

    setLoading(true);

    try {
      const url = subcategory ? `/api/admin/subcategories/${subcategory.id}` : '/api/admin/subcategories';
      const method = subcategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          categoryId: formData.categoryId
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(subcategory ? 'Subcategory updated successfully' : 'Subcategory created successfully');
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'Failed to save subcategory');
      }
    } catch (error) {
      console.error('Error saving subcategory:', error);
      toast.error('Failed to save subcategory');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">
            {subcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="name">Subcategory Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter subcategory name"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
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
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter subcategory description (optional)"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Saving...' : (subcategory ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}