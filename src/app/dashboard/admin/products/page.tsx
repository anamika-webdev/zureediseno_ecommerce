// src/app/dashboard/admin/products/page.tsx - COMPLETE FULL VERSION
'use client';

import { useState, useEffect, useRef } from 'react';
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
import { Trash2, Edit, Plus, Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

// Types
interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

interface ProductVariant {
  id?: string;
  size: string;
  color: string;
  stock: number;
  sleeveType?: string;
  sku?: string;
}

interface ProductImage {
  id?: string;
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  originalPrice?: number;
  sku?: string;
  categoryId: string;
  subcategoryId?: string;
  featured: boolean;
  inStock: boolean;
  sortOrder: number;
  images: ProductImage[] | string[];
  variants: ProductVariant[];
  createdAt: string;
  category: { name: string };
  subcategory?: { name: string };
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  sku: string;
  categoryId: string;
  subcategoryId: string;
  featured: boolean;
  inStock: boolean;
  sortOrder: number;
  variants: ProductVariant[];
}

export default function ProductsPage() {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Form data
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    sku: '',
    categoryId: '',
    subcategoryId: '',
    featured: false,
    inStock: true,
    sortOrder: 0,
    variants: [{ size: '', color: '', stock: 0, sleeveType: '' }],
  });

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [productsResponse, categoriesResponse, subcategoriesResponse] = await Promise.all([
        fetch('/api/admin/products', { credentials: 'include' }),
        fetch('/api/admin/categories', { credentials: 'include' }),
        fetch('/api/admin/subcategories', { credentials: 'include' })
      ]);

      // Handle products
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        console.log('Products API response:', productsData);
        
        if (productsData.success && Array.isArray(productsData.products)) {
          setProducts(productsData.products);
        } else if (Array.isArray(productsData)) {
          setProducts(productsData);
        } else {
          console.warn('Unexpected products response format:', productsData);
          setProducts([]);
        }
      } else {
        console.error('Failed to fetch products:', productsResponse.status);
        setProducts([]);
      }

      // Handle categories - Check for nested response
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        console.log('Categories API response:', categoriesData);
        
        let categoriesArray: Category[] = [];
        if (categoriesData.success && Array.isArray(categoriesData.categories)) {
          categoriesArray = categoriesData.categories;
        } else if (Array.isArray(categoriesData)) {
          categoriesArray = categoriesData;
        } else {
          console.warn('Unexpected categories response format:', categoriesData);
        }
        
        setCategories(categoriesArray);
      } else {
        console.error('Failed to fetch categories:', categoriesResponse.status);
        setCategories([]);
      }

      // Handle subcategories - FIX: Check for nested response
      if (subcategoriesResponse.ok) {
        const subcategoriesData = await subcategoriesResponse.json();
        console.log('Subcategories API response:', subcategoriesData);
        
        let subcategoriesArray: Subcategory[] = [];
        if (subcategoriesData.success && Array.isArray(subcategoriesData.subcategories)) {
          subcategoriesArray = subcategoriesData.subcategories;
        } else if (Array.isArray(subcategoriesData)) {
          subcategoriesArray = subcategoriesData;
        } else {
          console.warn('Unexpected subcategories response format:', subcategoriesData);
        }
        
        console.log('Final subcategories array:', subcategoriesArray);
        setSubcategories(subcategoriesArray);
      } else {
        console.error('Failed to fetch subcategories:', subcategoriesResponse.status);
        setSubcategories([]);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
      setProducts([]);
      setCategories([]);
      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchData();
  }, []);

  // Filter subcategories based on selected category
  useEffect(() => {
    console.log('Category changed:', formData.categoryId);
    console.log('All subcategories:', subcategories);
    
    if (formData.categoryId) {
      const filtered = subcategories.filter(sub => sub.categoryId === formData.categoryId);
      console.log('Filtered subcategories:', filtered);
      setFilteredSubcategories(filtered);
      
      // Reset subcategory if it doesn't belong to the selected category
      if (formData.subcategoryId && !filtered.find(sub => sub.id === formData.subcategoryId)) {
        console.log('Resetting subcategory because it doesnt belong to selected category');
        setFormData(prev => ({ ...prev, subcategoryId: '' }));
      }
    } else {
      console.log('No category selected, clearing subcategories');
      setFilteredSubcategories([]);
      setFormData(prev => ({ ...prev, subcategoryId: '' }));
    }
  }, [formData.categoryId, subcategories]);

  // Utility functions
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Form handlers
  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: any) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setFormData(prev => ({ ...prev, variants: updatedVariants }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { size: '', color: '', stock: 0, sleeveType: '' }]
    }));
  };

  const removeVariant = (index: number) => {
    if (formData.variants.length > 1) {
      const updatedVariants = formData.variants.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, variants: updatedVariants }));
    }
  };

  // File handling
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      
      const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    // Remove from selectedFiles if it's a new file
    if (index < selectedFiles.length) {
      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    }
    
    // Clean up blob URLs
    if (previewUrls[index] && previewUrls[index].startsWith('blob:')) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    
    // Remove from preview URLs
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeAllImages = () => {
    // Clean up all blob URLs
    previewUrls.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    
    // Clear all images
    setSelectedFiles([]);
    setPreviewUrls([]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);
      formDataUpload.append('folder', 'products');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload ${file.name}`);
      }

      const data = await response.json();
      return data.url;
    });

    return Promise.all(uploadPromises);
  };

  // Form management
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      originalPrice: 0,
      sku: '',
      categoryId: '',
      subcategoryId: '',
      featured: false,
      inStock: true,
      sortOrder: 0,
      variants: [{ size: '', color: '', stock: 0, sleeveType: '' }],
    });
    setSelectedProduct(null);
    setSelectedFiles([]);
    setPreviewUrls([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    resetForm();
    fetchData();
  };

  const handleFormCancel = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  // CRUD operations
  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      originalPrice: product.originalPrice || 0,
      sku: product.sku || '',
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId || '',
      featured: product.featured,
      inStock: product.inStock,
      sortOrder: product.sortOrder,
      variants: product.variants.length > 0 ? product.variants : [{ size: '', color: '', stock: 0, sleeveType: '' }],
    });
    
    // Set existing images as preview
    if (product.images && product.images.length > 0) {
      const imageUrls = product.images.map(img => 
        typeof img === 'string' ? img : img.url
      );
      setPreviewUrls(imageUrls);
    }
    
    setIsDialogOpen(true);
  };

  // Updated delete handler with better error handling
  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    console.log('🗑️ Starting delete process for product:', productId);

    try {
      const deleteUrl = `/api/admin/products/${productId}`;
      console.log('🔗 Delete URL:', deleteUrl);

      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Delete response status:', response.status);

      // Get response text first to handle both JSON and text responses
      const responseText = await response.text();
      console.log('📥 Delete response text (raw):', responseText);

      if (!response.ok) {
        console.error('❌ Delete request failed with status:', response.status);
        
        let errorMessage = `Delete failed (${response.status})`;
        
        if (responseText) {
          try {
            const errorData = JSON.parse(responseText);
            console.error('❌ Delete error data:', errorData);
            errorMessage = errorData.error || errorData.message || errorMessage;
            
            if (errorData.details) {
              console.error('❌ Error details:', errorData.details);
            }
            if (errorData.code) {
              console.error('❌ Error code:', errorData.code);
            }
          } catch (parseError) {
            console.error('❌ Could not parse error response:', parseError);
            errorMessage = `${errorMessage}: ${responseText}`;
          }
        }
        
        throw new Error(errorMessage);
      }

      // Try to parse success response
      let result = { success: true, message: 'Product deleted successfully' };
      if (responseText) {
        try {
          result = JSON.parse(responseText);
          console.log('✅ Delete success response:', result);
        } catch (parseError) {
          console.log('⚠️ Could not parse success response, but delete succeeded');
        }
      }
      
      toast.success(result.message || 'Product deleted successfully!');
      fetchData(); // Refresh the product list
      
    } catch (error) {
      console.error('❌ Delete operation failed:', error);
      
      let errorMessage = 'Failed to delete product';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        errorMessage = (error as any).message || (error as any).error || JSON.stringify(error);
      }
      
      console.error('❌ Final error message:', errorMessage);
      toast.error(errorMessage);
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a product name');
      return;
    }

    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }

    if (formData.price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setFormLoading(true);

    try {
      let imageUrls: string[] = [];

      // Upload new images if selected
      if (selectedFiles.length > 0) {
        setUploadingImages(true);
        imageUrls = await uploadImages(selectedFiles);
        setUploadingImages(false);
      }

      // Handle image logic based on whether we're editing or creating
      let allImageUrls: string[] = [];
      
      if (selectedProduct?.id) {
        // For editing: Use current preview URLs (which include both existing and new images)
        // This allows users to remove existing images and add new ones
        const currentImages = previewUrls.filter(url => {
          // Keep existing images that are still in preview
          return url && url.trim() !== '';
        });
        
        // Add newly uploaded images
        allImageUrls = [...currentImages.filter(url => !url.startsWith('blob:')), ...imageUrls];
      } else {
        // For new products, just use uploaded images
        allImageUrls = imageUrls;
      }

      const slug = generateSlug(formData.name);
      
      const submitData = {
        ...formData,
        slug,
        images: allImageUrls,
        variants: formData.variants.filter(variant => 
          variant.size || variant.color || variant.stock > 0
        ),
      };

      console.log('Submitting product data:', submitData);
      console.log('Final images:', allImageUrls);

      const url = selectedProduct?.id 
        ? `/api/admin/products/${selectedProduct.id}`
        : '/api/admin/products';
      
      const method = selectedProduct?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast.success(
          selectedProduct?.id 
            ? 'Product updated successfully!' 
            : 'Product created successfully!'
        );
        handleFormSuccess();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save product');
    } finally {
      setFormLoading(false);
      setUploadingImages(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setSelectedProduct(null);
              resetForm();
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price * (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleInputChange('price', value === '' ? 0 : parseFloat(value));
                    }}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="originalPrice">Original Price (₹)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.originalPrice || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleInputChange('originalPrice', value === '' ? 0 : parseFloat(value));
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleInputChange('sortOrder', value === '' ? 0 : parseInt(value));
                    }}
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => {
                      console.log('Category selected:', value);
                      handleInputChange('categoryId', value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
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
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Select
                    value={formData.subcategoryId}
                    onValueChange={(value) => {
                      console.log('Subcategory selected:', value);
                      handleInputChange('subcategoryId', value);
                    }}
                    disabled={!formData.categoryId || filteredSubcategories.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !formData.categoryId 
                          ? "Select category first" 
                          : filteredSubcategories.length === 0 
                            ? "No subcategories available"
                            : "Select subcategory"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSubcategories.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.categoryId && (
                    <p className="text-xs text-gray-500 mt-1">
                      {filteredSubcategories.length} subcategories available
                    </p>
                  )}
                </div>
              </div>

              {/* Switches */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => handleInputChange('featured', checked)}
                  />
                  <Label htmlFor="featured">Featured Product</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="inStock"
                    checked={formData.inStock}
                    onCheckedChange={(checked) => handleInputChange('inStock', checked)}
                  />
                  <Label htmlFor="inStock">In Stock</Label>
                </div>
              </div>

              {/* Images */}
              <div>
                <Label>Product Images</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImages}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingImages ? 'Uploading...' : selectedProduct ? 'Add More Images' : 'Upload Images'}
                  </Button>
                  
                  {previewUrls.length > 0 && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={removeAllImages}
                      disabled={uploadingImages}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove All Images
                    </Button>
                  )}
                </div>
                
                {selectedProduct && (
                  <p className="text-sm text-gray-500 mt-1">
                    Note: Removing images here will delete them from the product. Use "Add More Images" to keep existing images.
                  </p>
                )}
                
                {/* Image Previews */}
                {previewUrls.length > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Current Images ({previewUrls.length})</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={url}
                            alt={`Preview ${index + 1}`}
                            width={150}
                            height={150}
                            className="object-cover rounded border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                          <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Variants */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label>Product Variants</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Variant
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="grid grid-cols-2 md:grid-cols-5 gap-2 p-4 border rounded">
                      <div>
                        <Label>Size</Label>
                        <Input
                          value={variant.size}
                          onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                          placeholder="S, M, L, XL"
                        />
                      </div>
                      <div>
                        <Label>Color</Label>
                        <Input
                          value={variant.color}
                          onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                          placeholder="Red, Blue"
                        />
                      </div>
                      <div>
                        <Label>Stock</Label>
                        <Input
                          type="number"
                          min="0"
                          value={variant.stock || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleVariantChange(index, 'stock', value === '' ? 0 : parseInt(value));
                          }}
                        />
                      </div>
                      <div>
                        <Label>Sleeve Type</Label>
                        <Input
                          value={variant.sleeveType || ''}
                          onChange={(e) => handleVariantChange(index, 'sleeveType', e.target.value)}
                          placeholder="Short, Long"
                        />
                      </div>
                      <div className="flex items-end">
                        {formData.variants.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeVariant(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFormCancel}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading || uploadingImages}>
                  {formLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {selectedProduct ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    selectedProduct ? 'Update Product' : 'Create Product'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No products found</p>
              <p className="text-sm text-gray-400">Create your first product to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Image</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Category</th>
                    <th className="text-left p-2">Price</th>
                    <th className="text-left p-2">Stock</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        {product.images && product.images.length > 0 ? (
                          <Image
                            src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url}
                            alt={product.name}
                            width={50}
                            height={50}
                            className="object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="p-2">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.sku}</p>
                        </div>
                      </td>
                      <td className="p-2">
                        <div>
                          <p>{product.category.name}</p>
                          {product.subcategory && (
                            <p className="text-sm text-gray-500">{product.subcategory.name}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div>
                          <p className="font-medium">₹{product.price}</p>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <p className="text-sm text-gray-500 line-through">₹{product.originalPrice}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div>
                          <p>{product.variants.reduce((total, variant) => total + variant.stock, 0)} units</p>
                          <p className="text-sm text-gray-500">{product.variants.length} variants</p>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            product.inStock 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                          {product.featured && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}