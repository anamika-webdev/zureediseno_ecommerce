// src/app/dashboard/admin/products/page.tsx - Complete products management
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
  size: string;
  color: string;
  stock: number;
  sleeveType?: string;
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
  images: string[];
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
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

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

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [productsResponse, categoriesResponse, subcategoriesResponse] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/categories'),
        fetch('/api/admin/subcategories')
      ]);

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        console.log('Products API response:', productsData);
        // Handle both old and new API response formats
        if (productsData.success && Array.isArray(productsData.products)) {
          setProducts(productsData.products);
        } else if (Array.isArray(productsData)) {
          setProducts(productsData);
        } else {
          console.error('Products data is not an array:', productsData);
          setProducts([]);
        }
      } else {
        console.error('Failed to fetch products:', productsResponse.status);
        setProducts([]);
      }

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        console.log('Categories API response:', categoriesData);
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        } else if (categoriesData.success && Array.isArray(categoriesData.categories)) {
          setCategories(categoriesData.categories);
        } else {
          setCategories([]);
        }
      } else {
        setCategories([]);
      }

      if (subcategoriesResponse.ok) {
        const subcategoriesData = await subcategoriesResponse.json();
        console.log('Subcategories API response:', subcategoriesData);
        if (Array.isArray(subcategoriesData)) {
          setSubcategories(subcategoriesData);
        } else if (subcategoriesData.success && Array.isArray(subcategoriesData.subcategories)) {
          setSubcategories(subcategoriesData.subcategories);
        } else {
          setSubcategories([]);
        }
      } else {
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

  useEffect(() => {
    fetchData();
  }, []);

  // Filter subcategories when category changes
  useEffect(() => {
    if (formData.categoryId) {
      const filtered = subcategories.filter(sub => sub.categoryId === formData.categoryId);
      setFilteredSubcategories(filtered);
      
      // Reset subcategory if it doesn't belong to selected category
      if (formData.subcategoryId && !filtered.find(sub => sub.id === formData.subcategoryId)) {
        setFormData(prev => ({ ...prev, subcategoryId: '' }));
      }
    } else {
      setFilteredSubcategories([]);
      setFormData(prev => ({ ...prev, subcategoryId: '' }));
    }
  }, [formData.categoryId, subcategories]);

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
  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle variant changes
  const handleVariantChange = (index: number, field: keyof ProductVariant, value: any) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setFormData(prev => ({ ...prev, variants: updatedVariants }));
  };

  // Add new variant
  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { size: '', color: '', stock: 0, sleeveType: '' }]
    }));
  };

  // Remove variant
  const removeVariant = (index: number) => {
    if (formData.variants.length > 1) {
      const updatedVariants = formData.variants.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, variants: updatedVariants }));
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate files
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
      
      // Create preview URLs
      const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    
    // Cleanup preview URL
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Upload images
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

  // Reset form
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
      setPreviewUrls(product.images);
    }
    
    setIsDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Product deleted successfully!');
        fetchData();
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  // Handle form submission
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

      // Combine existing images (for edit) with new uploaded images
      const allImageUrls = selectedProduct?.id 
        ? [...(selectedProduct.images || []), ...imageUrls]
        : imageUrls;

      const slug = generateSlug(formData.name);
      
      const submitData = {
        ...formData,
        slug,
        images: allImageUrls,
        // Filter out empty variants
        variants: formData.variants.filter(variant => 
          variant.size || variant.color || variant.stock > 0
        ),
      };

      const url = selectedProduct?.id 
        ? `/api/admin/products/${selectedProduct.id}`
        : '/api/admin/products';
      
      const method = selectedProduct?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
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
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span className="text-lg">Loading products...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-gray-600 mt-2">Manage your products, variants, and inventory</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
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
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    placeholder="Enter product SKU"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter product description"
                  rows={4}
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="originalPrice">Original Price</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => handleInputChange('originalPrice', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
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

              {/* Category Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Select
                    value={formData.subcategoryId || undefined}
                    onValueChange={(value) => handleInputChange('subcategoryId', value || '')}
                    disabled={!formData.categoryId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subcategory (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSubcategories.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Product Images */}
              <div>
                <Label>Product Images</Label>
                <Card className="mt-2">
                  <CardContent className="p-4">
                    {previewUrls.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {previewUrls.map((url, index) => (
                          <div key={index} className="relative">
                            <img
                              src={url}
                              alt={`Product ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 h-6 w-6 p-0"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadingImages ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                          <span className="ml-2 text-gray-600">Uploading...</span>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600 mb-1">
                            Click to add product images
                          </p>
                          <p className="text-xs text-gray-500">
                            Supports: JPG, PNG, GIF (Max 5MB each)
                          </p>
                        </>
                      )}
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Product Variants */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Product Variants</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variant
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {formData.variants.map((variant, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <Label htmlFor={`size-${index}`}>Size</Label>
                            <Input
                              id={`size-${index}`}
                              value={variant.size}
                              onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                              placeholder="S, M, L, XL"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`color-${index}`}>Color</Label>
                            <Input
                              id={`color-${index}`}
                              value={variant.color}
                              onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                              placeholder="Red, Blue, Green"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`stock-${index}`}>Stock</Label>
                            <Input
                              id={`stock-${index}`}
                              type="number"
                              value={variant.stock}
                              onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value) || 0)}
                              placeholder="0"
                            />
                          </div>
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeVariant(index)}
                              disabled={formData.variants.length === 1}
                              className="w-full"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div className="flex flex-wrap gap-6">
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

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={formLoading || uploadingImages}
                  className="flex-1"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {selectedProduct ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      {selectedProduct ? 'Update Product' : 'Create Product'}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFormCancel}
                  disabled={formLoading || uploadingImages}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!Array.isArray(products) || products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found</p>
          <p className="text-gray-400">Create your first product to get started</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="truncate">{product.name}</span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {product.images && product.images.length > 0 && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">₹{product.price}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-blue-600">
                      {product.category.name}
                      {product.subcategory && ` > ${product.subcategory.name}`}
                    </p>
                    
                    {product.sku && (
                      <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Variants: {product.variants.length}</span>
                      <div className="flex gap-2">
                        {product.featured && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            Featured
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded ${
                          product.inStock 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
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