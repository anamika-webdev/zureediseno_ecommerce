// src/app/dashboard/admin/subcategories/page.tsx - Complete subcategory management
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Trash2, Edit, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  categoryId: string;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  category: {
    name: string;
  };
}

interface SubcategoryFormData {
  name: string;
  description: string;
  categoryId: string;
  featured: boolean;
  sortOrder: number;
}

export default function SubcategoriesPage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState<SubcategoryFormData>({
    name: '',
    description: '',
    categoryId: '',
    featured: false,
    sortOrder: 0,
  });

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [subcategoriesResponse, categoriesResponse] = await Promise.all([
        fetch('/api/admin/subcategories'),
        fetch('/api/admin/categories')
      ]);

      if (subcategoriesResponse.ok) {
        const subcategoriesData = await subcategoriesResponse.json();
        setSubcategories(subcategoriesData);
      }

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Handle form input changes
  const handleInputChange = (field: keyof SubcategoryFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      categoryId: '',
      featured: false,
      sortOrder: 0,
    });
    setSelectedSubcategory(null);
  };

  // Handle form success
  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    resetForm();
    fetchData();
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  // Handle edit
  const handleEdit = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    setFormData({
      name: subcategory.name,
      description: subcategory.description || '',
      categoryId: subcategory.categoryId,
      featured: subcategory.featured,
      sortOrder: subcategory.sortOrder,
    });
    setIsDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async (subcategoryId: string) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/subcategories/${subcategoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Subcategory deleted successfully!');
        fetchData();
      } else {
        throw new Error('Failed to delete subcategory');
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast.error('Failed to delete subcategory');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a subcategory name');
      return;
    }

    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }

    setFormLoading(true);

    try {
      const slug = generateSlug(formData.name);
      
      const submitData = {
        ...formData,
        slug,
      };

      const url = selectedSubcategory?.id 
        ? `/api/admin/subcategories/${selectedSubcategory.id}`
        : '/api/admin/subcategories';
      
      const method = selectedSubcategory?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast.success(
          selectedSubcategory?.id 
            ? 'Subcategory updated successfully!' 
            : 'Subcategory created successfully!'
        );
        handleFormSuccess();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save subcategory');
      }
    } catch (error) {
      console.error('Error saving subcategory:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save subcategory');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span className="text-lg">Loading subcategories...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Subcategory Management</h1>
          <p className="text-gray-600 mt-2">Manage your product subcategories</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Subcategory
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Subcategory Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter subcategory name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => handleInputChange('categoryId', value)}
                  required
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
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter subcategory description"
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

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleInputChange('featured', checked)}
                />
                <Label htmlFor="featured">Featured Subcategory</Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {selectedSubcategory ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      {selectedSubcategory ? 'Update Subcategory' : 'Create Subcategory'}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFormCancel}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {subcategories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No subcategories found</p>
          <p className="text-gray-400">Create your first subcategory to get started</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {subcategories.map((subcategory) => (
            <Card key={subcategory.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{subcategory.name}</span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(subcategory)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(subcategory.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-blue-600 font-medium">
                    Category: {subcategory.category.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Slug: /{subcategory.slug}
                  </p>
                  {subcategory.description && (
                    <p className="text-sm text-gray-700">
                      {subcategory.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                    <span>Order: {subcategory.sortOrder}</span>
                    {subcategory.featured && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}