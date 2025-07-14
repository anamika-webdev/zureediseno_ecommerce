// src/components/admin/CategoryFormModal.tsx - UPDATED with Product-Style Upload
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CategoryImageUploadBox } from './CategoryImageUploadBox';
import { toast } from 'sonner';
import { Save, X, Tag, Image as ImageIcon, Settings } from 'lucide-react';

interface CategoryFormData {
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  images?: string[]; // Add support for multiple images
  featured: boolean;
  sortOrder: number;
}

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: CategoryFormData | null;
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  onSuccess,
  category
}: CategoryFormModalProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    image: '',
    images: [],
    featured: false,
    sortOrder: 0,
  });

  const [loading, setLoading] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  // Update form data when category changes
  useEffect(() => {
    if (category) {
      // Handle both single image and multiple images
      const categoryImages = category.images || (category.image ? [category.image] : []);
      
      setFormData({
        id: category.id,
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        image: category.image || '',
        images: categoryImages,
        featured: category.featured || false,
        sortOrder: category.sortOrder || 0,
      });
      setSlugEdited(!!category.slug);
    } else {
      setFormData({
        name: '',
        description: '',
        image: '',
        images: [],
        featured: false,
        sortOrder: 0,
      });
      setSlugEdited(false);
    }
  }, [category, isOpen]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleInputChange = (field: keyof CategoryFormData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate slug from name if not manually edited
      if (field === 'name' && !slugEdited) {
        updated.slug = generateSlug(value);
      }
      
      return updated;
    });
  };

  const handleSlugChange = (value: string) => {
    setSlugEdited(true);
    setFormData(prev => ({ ...prev, slug: value }));
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({ 
      ...prev, 
      images: images,
      image: images[0] || '' // Set first image as primary
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    setLoading(true);

    try {
      const slug = formData.slug || generateSlug(formData.name);
      
      const submitData = {
        name: formData.name.trim(),
        slug: slug.trim(),
        description: formData.description?.trim() || null,
        image: formData.images?.[0] || formData.image || null, // Use first image as primary
        featured: formData.featured,
        sortOrder: formData.sortOrder || 0,
      };

      console.log('Submitting category data:', submitData); // Debug log

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
        const responseData = await response.json();
        console.log('Category saved successfully:', responseData); // Debug log
        toast.success(category?.id ? 'Category updated successfully!' : 'Category created successfully!');
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData); // Debug log
        throw new Error(errorData.error || 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            {category?.id ? 'Edit Category' : 'Create New Category'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Category Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Category Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter category name"
                      disabled={loading}
                      required
                    />
                  </div>

                  {/* URL Slug */}
                  <div className="space-y-2">
                    <Label htmlFor="slug" className="text-sm font-medium">
                      URL Slug
                    </Label>
                    <Input
                      id="slug"
                      value={formData.slug || ''}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder="category-url-slug"
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500">
                      Auto-generated from name. Used in URLs: /category/{formData.slug || 'category-name'}
                    </p>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter category description (optional)"
                      rows={4}
                      disabled={loading}
                    />
                  </div>

                  {/* Sort Order */}
                  <div className="space-y-2">
                    <Label htmlFor="sortOrder" className="text-sm font-medium">
                      Sort Order
                    </Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      disabled={loading}
                      min="0"
                    />
                    <p className="text-xs text-gray-500">
                      Lower numbers appear first in category listings
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Category Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="featured" className="text-sm font-medium">
                        Featured Category
                      </Label>
                      <p className="text-xs text-gray-500">
                        Display this category prominently on the homepage and in navigation
                      </p>
                    </div>
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => handleInputChange('featured', checked)}
                      disabled={loading}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Image Upload */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Category Images
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CategoryImageUploadBox
                    images={formData.images || []}
                    onChange={handleImagesChange}
                    disabled={loading}
                    maxImages={3} // Limit to 3 images for categories
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.name.trim()}
              className="min-w-[120px]"
            >
              {loading ? (
                'Saving...'
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {category?.id ? 'Update Category' : 'Create Category'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}