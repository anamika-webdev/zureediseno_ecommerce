// src/components/admin/CategoryFormModal.tsx - Fixed Version
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: Category | null;
}

export default function CategoryFormModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  category 
}: CategoryFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || ''
      });
    } else {
      setFormData({
        name: '',
        description: ''
      });
    }
    setError(null); // Clear any previous errors
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Client-side validation
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    if (formData.name.trim().length < 2) {
      setError('Category name must be at least 2 characters long');
      return;
    }

    setLoading(true);

    try {
      console.log('🚀 Submitting form:', formData);
      
      const url = category ? `/api/admin/categories/${category.id}` : '/api/admin/categories';
      const method = category ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null
        })
      });

      console.log('📊 Response status:', response.status);
      
      const data = await response.json();
      console.log('📋 Response data:', data);

      if (response.ok) {
        toast.success(category ? 'Category updated successfully!' : 'Category created successfully!');
        onSuccess();
        onClose();
        // Reset form
        setFormData({ name: '', description: '' });
      } else {
        // Handle API errors
        const errorMessage = data.error || `Failed to ${category ? 'update' : 'create'} category`;
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('💥 Network error:', error);
      const errorMessage = 'Network error. Please check your connection and try again.';
      setError(errorMessage);
      toast.error(errorMessage);
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
            {category ? 'Edit Category' : 'Add New Category'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter category name"
              required
              disabled={loading}
              className={error && !formData.name.trim() ? 'border-red-300' : ''}
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter category description (optional)"
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex-1"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                category ? 'Update' : 'Create'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}