// src/app/dashboard/admin/categories/page.tsx - WITH IMAGE UPLOAD
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
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
  FolderTree,
  Image as ImageIcon,
  Upload,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Pagination } from '@/components/admin/Pagination';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
    subcategories: number;
  };
}

interface CategoryFormData {
  name: string;
  description: string;
  featured: boolean;
  sortOrder: number;
  image?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Image upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const { toast } = useToast();

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    featured: false,
    sortOrder: 0,
    image: '',
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/categories', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      let categoriesArray: Category[] = [];
      if (data.success && Array.isArray(data.categories)) {
        categoriesArray = data.categories;
      } else if (Array.isArray(data)) {
        categoriesArray = data;
      }
      setCategories(categoriesArray);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({ title: 'Error', description: 'Failed to fetch categories', variant: 'destructive' });
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cat.slug && cat.slug.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalItems = filteredCategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIdx, startIdx + itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const uploadImage = async (): Promise<string> => {
    if (!selectedFile) return formData.image || '';

    setUploadingImage(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', selectedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();
        return data.url;
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ title: 'Upload Error', description: 'Failed to upload image', variant: 'destructive' });
      return formData.image || '';
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast({ title: 'Validation Error', description: 'Category name is required', variant: 'destructive' });
      return;
    }

    setFormLoading(true);

    try {
      const imageUrl = await uploadImage();

      const categoryData = {
        ...formData,
        image: imageUrl,
      };

      const url = selectedCategory
        ? `/api/admin/categories/${selectedCategory.id}`
        : '/api/admin/categories';

      const method = selectedCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(categoryData),
      });

      if (response.ok) {
        toast({ title: 'Success', description: `Category ${selectedCategory ? 'updated' : 'created'} successfully` });
        setIsDialogOpen(false);
        resetForm();
        fetchCategories();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to save category', variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      featured: category.featured,
      sortOrder: category.sortOrder,
      image: category.image || '',
    });
    if (category.image) {
      setPreviewUrl(category.image);
    }
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Category deleted successfully' });
        fetchCategories();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to delete category', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', featured: false, sortOrder: 0, image: '' });
    setSelectedCategory(null);
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const handleFormCancel = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading categories...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FolderTree className="w-8 h-8" />
            Categories Management
          </h1>
          <p className="text-gray-500 mt-1">Manage your product categories ({totalItems} total categories)</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter category name"
                  required
                  disabled={formLoading}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter category description"
                  rows={3}
                  disabled={formLoading}
                />
              </div>

              <div>
                <Label>Category Image</Label>
                <div className="mt-2 space-y-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingImage ? 'Uploading...' : previewUrl ? 'Change Image' : 'Upload Image'}
                  </Button>

                  {previewUrl && (
                    <div className="relative w-48 h-48">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
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
                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleInputChange('featured', checked)}
                  disabled={formLoading}
                />
                <Label htmlFor="featured">Featured Category</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleFormCancel}>Cancel</Button>
                <Button type="submit" disabled={formLoading || uploadingImage}>
                  {formLoading || uploadingImage ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                  ) : (
                    <>{selectedCategory ? 'Update Category' : 'Create Category'}</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search categories by name or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="itemsPerPage" className="whitespace-nowrap text-sm">Items per page:</Label>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger id="itemsPerPage" className="w-24"><SelectValue /></SelectTrigger>
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

      {paginatedCategories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderTree className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">
              {searchQuery ? 'No categories found matching your search.' : 'No categories found. Create your first category to get started.'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsDialogOpen(true)} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />Create First Category
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Subcategories</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sort Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedCategories.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-16 h-16 relative bg-gray-100 rounded overflow-hidden">
                            {category.image ? (
                              <Image src={category.image} alt={category.name} fill className="object-cover" sizes="64px" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-gray-300" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          <div className="text-xs text-gray-400">Created: {new Date(category.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600 font-mono">/{category.slug}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700 line-clamp-2 max-w-xs">{category.description || '-'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm text-gray-900">{category._count?.products || 0}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm text-gray-900">{category._count?.subcategories || 0}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {category.sortOrder}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {category.featured && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Star className="w-3 h-3 mr-1" />Featured
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(category)} className="h-8 w-8 p-0" title="Edit">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(category.id)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

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