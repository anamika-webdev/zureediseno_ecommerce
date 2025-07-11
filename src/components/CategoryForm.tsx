// src/components/admin/CategoryForm.tsx - Complete with image upload
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export interface SerializableCategory {
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  featured: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryFormProps {
  category?: SerializableCategory | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const [formData, setFormData] = useState<SerializableCategory>({
    name: '',
    description: '',
    image: '',
    featured: false,
    sortOrder: 0,
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Update form data when category changes
  useEffect(() => {
    if (category) {
      setFormData(category);
      setPreviewUrl(category.image || '');
    } else {
      setFormData({
        name: '',
        description: '',
        image: '',
        featured: false,
        sortOrder: 0,
      });
      setPreviewUrl('');
    }
    setSelectedFile(null);
  }, [category]);

  const handleInputChange = (field: keyof SerializableCategory, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);
    formDataUpload.append('folder', 'categories');

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formDataUpload,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.url;
  };

  const handleImageRemove = () => {
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
    setPreviewUrl('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        toast.error('Please drop an image file');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = formData.image || '';

      // Upload new image if selected
      if (selectedFile) {
        setUploadingImage(true);
        imageUrl = await handleImageUpload(selectedFile);
        setUploadingImage(false);
      }

      const slug = formData.slug || generateSlug(formData.name);
      
      const submitData = {
        ...formData,
        slug,
        image: imageUrl,
      };

      const url = category?.id 
        ? `/api/admin/categories/${category.id}`
        : '/api/admin/categories';
      
      const method = category?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast.success(category?.id ? 'Category updated successfully!' : 'Category created successfully!');
        onSuccess();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save category');
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Category Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter category name"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter category description"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input
            id="sortOrder"
            type="number"
            value={formData.sortOrder}
            onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
            placeholder="0"
          />
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <Label>Category Image</Label>
        <Card className="mt-2">
          <CardContent className="p-4">
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Category preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleImageRemove}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadingImage ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-600">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      Drop an image here, or click to select
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports: JPG, PNG, GIF (Max 5MB)
                    </p>
                  </>
                )}
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </CardContent>
        </Card>
      </div>

      {/* Settings */}
      <div className="flex items-center space-x-2">
        <Switch
          id="featured"
          checked={formData.featured}
          onCheckedChange={(checked) => handleInputChange('featured', checked)}
        />
        <Label htmlFor="featured">Featured Category</Label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={loading || uploadingImage}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {category?.id ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              {category?.id ? 'Update Category' : 'Create Category'}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading || uploadingImage}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}