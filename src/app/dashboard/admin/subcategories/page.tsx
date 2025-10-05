// src/app/dashboard/admin/subcategories/page.tsx - COMPLETE VERSION WITH PAGINATION
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
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Trash2, 
  Edit, 
  Plus, 
  Loader2, 
  Search,
  Star,
  Layers,
  FolderTree,
  Tag
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Pagination } from '@/components/admin/Pagination';

// Types
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
    id: string;
    name: string;
  };
  _count?: {
    products: number;
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
  // State
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { toast } = useToast();

  // Form data
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
        fetch('/api/admin/subcategories', { credentials: 'include' }),
        fetch('/api/admin/categories', { credentials: 'include' })
      ]);

      // Handle subcategories response
      if (subcategoriesResponse.ok) {
        const subcategoriesData = await subcategoriesResponse.json();
        console.log('Subcategories API response:', subcategoriesData);

        // Handle different response formats
        let subcategoriesArray: Subcategory[] = [];
        if (subcategoriesData.success && Array.isArray(subcategoriesData.subcategories)) {
          subcategoriesArray = subcategoriesData.subcategories;
        } else if (Array.isArray(subcategoriesData)) {
          subcategoriesArray = subcategoriesData;
        }

        setSubcategories(subcategoriesArray);
      } else {
        console.error('Failed to fetch subcategories:', subcategoriesResponse.status);
        setSubcategories([]);
      }

      // Handle categories response
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        console.log('Categories API response:', categoriesData);

        let categoriesArray: Category[] = [];
        if (categoriesData.success && Array.isArray(categoriesData.categories)) {
          categoriesArray = categoriesData.categories;
        } else if (Array.isArray(categoriesData)) {
          categoriesArray = categoriesData;
        }

        setCategories(categoriesArray);
      } else {
        console.error('Failed to fetch categories:', categoriesResponse.status);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter subcategories based on search and category filter
  const filteredSubcategories = subcategories.filter(sub => {
    const matchesSearch = 
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.slug && sub.slug.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sub.category && sub.category.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sub.description && sub.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || sub.categoryId === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Paginate filtered subcategories
  const totalItems = filteredSubcategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedSubcategories = filteredSubcategories.slice(startIdx, startIdx + itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage, categoryFilter]);

  // Page change handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Form handlers
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.categoryId) {
      toast({
        title: 'Validation Error',
        description: 'Subcategory name and category are required',
        variant: 'destructive',
      });
      return;
    }

    setFormLoading(true);

    try {
      const url = selectedSubcategory
        ? `/api/admin/subcategories/${selectedSubcategory.id}`
        : '/api/admin/subcategories';

      const method = selectedSubcategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Subcategory ${selectedSubcategory ? 'updated' : 'created'} successfully`,
        });

        setIsDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save subcategory');
      }
    } catch (error) {
      console.error('Error saving subcategory:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save subcategory',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subcategory? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/subcategories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Subcategory deleted successfully',
        });
        fetchData();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete subcategory');
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete subcategory',
        variant: 'destructive',
      });
    }
  };

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

  const handleFormCancel = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading subcategories...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Layers className="w-8 h-8" />
            Subcategories Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your product subcategories ({totalItems} total subcategories)
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Subcategory
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
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
                  disabled={formLoading}
                />
              </div>

              <div>
                <Label htmlFor="categoryId">Parent Category *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => handleInputChange('categoryId', value)}
                  disabled={formLoading}
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
                <p className="text-xs text-gray-500 mt-1">
                  {categories.length} categories available
                </p>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter subcategory description"
                  rows={3}
                  disabled={formLoading}
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
                  disabled={formLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers appear first
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleInputChange('featured', checked)}
                  disabled={formLoading}
                />
                <Label htmlFor="featured">Featured Subcategory</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleFormCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>{selectedSubcategory ? 'Update Subcategory' : 'Create Subcategory'}</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search subcategories by name, category, or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="categoryFilter" className="whitespace-nowrap text-sm">
                Category:
              </Label>
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger id="categoryFilter" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Items Per Page Selector */}
            <div className="flex items-center gap-2">
              <Label htmlFor="itemsPerPage" className="whitespace-nowrap text-sm">
                Items per page:
              </Label>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => setItemsPerPage(Number(value))}
              >
                <SelectTrigger id="itemsPerPage" className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="36">36</SelectItem>
                  <SelectItem value="48">48</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subcategories Grid */}
      {paginatedSubcategories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Layers className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">
              {searchQuery || categoryFilter !== 'all'
                ? 'No subcategories found matching your filters.'
                : 'No subcategories found. Create your first subcategory to get started.'}
            </p>
            {!searchQuery && categoryFilter === 'all' && (
              <Button onClick={() => setIsDialogOpen(true)} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Create First Subcategory
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedSubcategories.map((subcategory) => (
              <Card key={subcategory.id} className="hover:shadow-lg transition-shadow group">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="truncate flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-400" />
                      {subcategory.name}
                    </span>
                    <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(subcategory)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(subcategory.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Category Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                      <FolderTree className="w-4 h-4" />
                      {subcategory.category.name}
                    </div>

                    <p className="text-sm text-gray-600">
                      Slug: <span className="font-mono">/{subcategory.slug}</span>
                    </p>

                    {subcategory.description && (
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {subcategory.description}
                      </p>
                    )}

                    {/* Stats */}
                    {subcategory._count && (
                      <div className="text-xs text-gray-500 pt-2 border-t">
                        📦 {subcategory._count.products} Products
                      </div>
                    )}

                    {/* Badges */}
                    <div className="flex gap-2 flex-wrap pt-2">
                      {subcategory.featured && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Featured
                        </span>
                      )}
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
                        Order: {subcategory.sortOrder}
                      </span>
                    </div>

                    {/* Meta Info */}
                    <div className="text-xs text-gray-400 pt-2 border-t">
                      Created: {new Date(subcategory.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Component */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
            />
          )}
        </>
      )}
    </div>
  );
}