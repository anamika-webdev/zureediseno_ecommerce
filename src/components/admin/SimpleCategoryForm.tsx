// src/components/admin/SimpleCategoryForm.tsx - WORKING VERSION
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface CategoryData {
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  featured: boolean;
  sortOrder: number;
}

interface SimpleCategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: CategoryData | null;
}

export default function SimpleCategoryForm({
  isOpen,
  onClose,
  onSuccess,
  category
}: SimpleCategoryFormProps) {
  const [formData, setFormData] = useState<CategoryData>({
    name: '',
    description: '',
    image: '',
    featured: false,
    sortOrder: 0,
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        id: category.id,
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        image: category.image || '',
        featured: category.featured || false,
        sortOrder: category.sortOrder || 0,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        image: '',
        featured: false,
        sortOrder: 0,
      });
    }
  }, [category, isOpen]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      console.log('📤 Uploading image:', file.name); // Debug log

      const response = await fetch('/api/images', {
        method: 'POST',
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Image uploaded:', data.imageUrl); // Debug log
        
        setFormData(prev => ({
          ...prev,
          image: data.imageUrl
        }));
        toast.success('Image uploaded successfully!');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleImageRemove = () => {
    setFormData(prev => ({ ...prev, image: '' }));
    toast.success('Image removed');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setLoading(true);

    try {
      const slug = formData.slug || generateSlug(formData.name);
      
      const submitData = {
        name: formData.name.trim(),
        slug: slug.trim(),
        description: formData.description?.trim() || null,
        image: formData.image?.trim() || null,
        featured: formData.featured,
        sortOrder: formData.sortOrder || 0,
      };

      console.log('📤 Submitting category:', submitData); // Debug log

      const url = category?.id 
        ? `/api/admin/categories/${category.id}`
        : '/api/admin/categories';
      
      const method = category?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // ✅ Include credentials
        body: JSON.stringify(submitData),
      });

      console.log('📡 Submit response status:', response.status); // Debug log

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Submit successful:', responseData); // Debug log
        toast.success(category?.id ? 'Category updated successfully!' : 'Category created successfully!');
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to save category' }));
        console.error('❌ Submit error:', errorData); // Debug log
        throw new Error(errorData.error || 'Failed to save category');
      }
    } catch (error) {
      console.error('❌ Submit error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {category?.id ? 'Edit Category' : 'Create New Category'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  name: e.target.value,
                  slug: prev.slug || generateSlug(e.target.value)
                }))}
                placeholder="Enter category name"
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={formData.slug || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="category-url-slug"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter category description (optional)"
                rows={3}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                placeholder="0"
                disabled={loading}
                min="0"
              />
            </div>
          </div>

          {/* Image Upload */}
          <Card>
            <CardContent className="p-4">
              <Label className="text-sm font-medium mb-3 block">Category Image</Label>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                className="hidden"
                disabled={loading || uploading}
              />

              {formData.image ? (
                <div className="space-y-3">
                  <div className="relative aspect-video w-full max-w-md border rounded-lg overflow-hidden">
                    <Image
                      src={formData.image}
                      alt="Category image"
                      fill
                      className="object-cover"
                      onError={() => {
                        toast.error('Failed to load image');
                        setFormData(prev => ({ ...prev, image: '' }));
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={handleImageRemove}
                      disabled={loading || uploading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading || uploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Change Image
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-900">Upload category image</p>
                    <p className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3"
                    disabled={loading || uploading}
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Choose Image'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="featured">Featured Category</Label>
              <p className="text-sm text-gray-500">Display prominently on homepage</p>
            </div>
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploading || !formData.name.trim()}>
              {loading ? 'Saving...' : (category?.id ? 'Update Category' : 'Create Category')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}