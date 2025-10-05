// src/app/dashboard/admin/products/page.tsx - COMPLETE FINAL VERSION
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
  Upload, 
  X, 
  Search,
  Image as ImageIcon,
  Package
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Pagination } from '@/components/admin/Pagination';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

interface ProductVariant {
  id?: string;
  size: string;
  color: string;
  stock: number;
  sleeveType?: string;
  fit?: string;
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
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const { toast } = useToast();

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
    variants: [{ size: '', color: '', stock: 0, sleeveType: '', fit: '' }],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const productsResponse = await fetch(
        `/api/admin/products?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchQuery)}`,
        { credentials: 'include' }
      );
      const [categoriesResponse, subcategoriesResponse] = await Promise.all([
        fetch('/api/admin/categories', { credentials: 'include' }),
        fetch('/api/admin/subcategories', { credentials: 'include' })
      ]);

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        if (productsData.success && Array.isArray(productsData.products)) {
          setProducts(productsData.products);
          setTotalItems(productsData.pagination?.total || productsData.products.length);
        } else if (Array.isArray(productsData)) {
          setProducts(productsData);
          setTotalItems(productsData.length);
        } else {
          setProducts([]);
          setTotalItems(0);
        }
      }

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        let categoriesArray: Category[] = [];
        if (categoriesData.success && Array.isArray(categoriesData.categories)) {
          categoriesArray = categoriesData.categories;
        } else if (Array.isArray(categoriesData)) {
          categoriesArray = categoriesData;
        }
        setCategories(categoriesArray);
      }

      if (subcategoriesResponse.ok) {
        const subcategoriesData = await subcategoriesResponse.json();
        let subcategoriesArray: Subcategory[] = [];
        if (subcategoriesData.success && Array.isArray(subcategoriesData.subcategories)) {
          subcategoriesArray = subcategoriesData.subcategories;
        } else if (Array.isArray(subcategoriesData)) {
          subcategoriesArray = subcategoriesData;
        }
        setSubcategories(subcategoriesArray);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: 'Error', description: 'Failed to fetch data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [currentPage, itemsPerPage]);
  useEffect(() => {
    const timeoutId = setTimeout(() => { setCurrentPage(1); fetchData(); }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    if (formData.categoryId && subcategories.length > 0) {
      const filtered = subcategories.filter(sub => sub.categoryId === formData.categoryId);
      setFilteredSubcategories(filtered);
      if (formData.subcategoryId && !filtered.find(sub => sub.id === formData.subcategoryId)) {
        setFormData(prev => ({ ...prev, subcategoryId: '' }));
      }
    } else {
      setFilteredSubcategories([]);
      setFormData(prev => ({ ...prev, subcategoryId: '' }));
    }
  }, [formData.categoryId, subcategories]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setFormData(prev => ({ ...prev, variants: updatedVariants }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { size: '', color: '', stock: 0, sleeveType: '', fit: '' }]
    }));
  };

  const removeVariant = (index: number) => {
    if (formData.variants.length > 1) {
      const updatedVariants = formData.variants.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, variants: updatedVariants }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (selectedFiles.length === 0) return [];
    setUploadingImages(true);
    const uploadedUrls: string[] = [];
    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/upload', { method: 'POST', body: formData });
        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
        }
      }
      return uploadedUrls;
    } catch (error) {
      toast({ title: 'Upload Error', description: 'Failed to upload some images', variant: 'destructive' });
      return uploadedUrls;
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId) {
      toast({ title: 'Validation Error', description: 'Product name and category are required', variant: 'destructive' });
      return;
    }
    setFormLoading(true);
    try {
      const imageUrls = await uploadImages();
      const productData = {
        ...formData,
        images: imageUrls.map((url, index) => ({ url, alt: formData.name, isPrimary: index === 0 })),
        variants: formData.variants.filter(v => v.size || v.color || v.stock > 0 || v.sleeveType || v.fit),
      };
      const url = selectedProduct ? `/api/admin/products/${selectedProduct.id}` : '/api/admin/products';
      const method = selectedProduct ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(productData),
      });
      if (response.ok) {
        toast({ title: 'Success', description: `Product ${selectedProduct ? 'updated' : 'created'} successfully` });
        setIsDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save product');
      }
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to save product', variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  };

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
      variants: product.variants.length > 0 ? product.variants : [{ size: '', color: '', stock: 0, sleeveType: '', fit: '' }],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await fetch(`/api/admin/products/${id}`, { method: 'DELETE', credentials: 'include' });
      if (response.ok) {
        toast({ title: 'Success', description: 'Product deleted successfully' });
        fetchData();
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete product', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', description: '', price: 0, originalPrice: 0, sku: '', categoryId: '', subcategoryId: '',
      featured: false, inStock: true, sortOrder: 0, variants: [{ size: '', color: '', stock: 0, sleeveType: '', fit: '' }],
    });
    setSelectedProduct(null);
    setSelectedFiles([]);
    setPreviewUrls([]);
  };

  const handleFormCancel = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading products...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="w-8 h-8" />
            Products Management
          </h1>
          <p className="text-gray-500 mt-1">Manage your product catalog ({totalItems} total products)</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Enter product name" required />
                </div>
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" value={formData.sku} onChange={(e) => handleInputChange('sku', e.target.value)} placeholder="Enter SKU" />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Enter product description" rows={4} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)} placeholder="0.00" />
                </div>
                <div>
                  <Label htmlFor="originalPrice">Original Price</Label>
                  <Input id="originalPrice" type="number" step="0.01" value={formData.originalPrice} onChange={(e) => handleInputChange('originalPrice', parseFloat(e.target.value) || 0)} placeholder="0.00" />
                </div>
                <div>
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input id="sortOrder" type="number" value={formData.sortOrder} onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)} placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="categoryId">Category *</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subcategoryId">Subcategory</Label>
                  <Select value={formData.subcategoryId} onValueChange={(value) => handleInputChange('subcategoryId', value)} disabled={!formData.categoryId || filteredSubcategories.length === 0}>
                    <SelectTrigger>
                      <SelectValue placeholder={!formData.categoryId ? "Select category first" : filteredSubcategories.length === 0 ? "No subcategories available" : "Select subcategory"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSubcategories.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>{subcategory.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="featured" checked={formData.featured} onCheckedChange={(checked) => handleInputChange('featured', checked)} />
                  <Label htmlFor="featured">Featured Product</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="inStock" checked={formData.inStock} onCheckedChange={(checked) => handleInputChange('inStock', checked)} />
                  <Label htmlFor="inStock">In Stock</Label>
                </div>
              </div>
              <div>
                <Label>Product Images</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" multiple className="hidden" />
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadingImages}>
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingImages ? 'Uploading...' : selectedProduct ? 'Add More Images' : 'Upload Images'}
                  </Button>
                </div>
                {previewUrls.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img src={url} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded" />
                        <Button type="button" variant="destructive" size="sm" className="absolute top-1 right-1" onClick={() => removeImage(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Product Variants</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                    <Plus className="w-4 h-4 mr-1" />Add Variant
                  </Button>
                </div>
                <div className="space-y-3">
                  {formData.variants.map((variant, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                          <div>
                            <Label className="text-xs font-medium">Size</Label>
                            <Input 
                              value={variant.size} 
                              onChange={(e) => handleVariantChange(index, 'size', e.target.value)} 
                              placeholder="S, M, L, XL"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-medium">Color</Label>
                            <Input 
                              value={variant.color} 
                              onChange={(e) => handleVariantChange(index, 'color', e.target.value)} 
                              placeholder="Blue, Red"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-medium">Sleeve Type</Label>
                            <Input 
                              value={variant.sleeveType || ''} 
                              onChange={(e) => handleVariantChange(index, 'sleeveType', e.target.value)} 
                              placeholder="Full, Half"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-medium">Fit</Label>
                            <Input 
                              value={variant.fit || ''} 
                              onChange={(e) => handleVariantChange(index, 'fit', e.target.value)} 
                              placeholder="Regular, Slim"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-medium">Stock</Label>
                            <Input 
                              type="number" 
                              value={variant.stock} 
                              onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value) || 0)} 
                              placeholder="0"
                              className="mt-1"
                            />
                          </div>
                          <div className="flex items-end">
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => removeVariant(index)} 
                              disabled={formData.variants.length === 1}
                              className="w-full"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleFormCancel}>Cancel</Button>
                <Button type="submit" disabled={formLoading || uploadingImages}>
                  {formLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>) : (<>{selectedProduct ? 'Update Product' : 'Create Product'}</>)}
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
              <Input type="text" placeholder="Search products by name, SKU, or category..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="itemsPerPage" className="whitespace-nowrap text-sm">Items per page:</Label>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => { setItemsPerPage(Number(value)); setCurrentPage(1); }}>
                <SelectTrigger id="itemsPerPage" className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">{searchQuery ? 'No products found matching your search.' : 'No products found. Create your first product to get started.'}</p>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-16 h-16 relative bg-gray-100 rounded overflow-hidden">
                            {product.images && product.images.length > 0 ? (
                              <Image src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url} alt={product.name} fill className="object-cover" sizes="64px" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-gray-300" /></div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{product.name}</span>
                            {product.description && (<span className="text-xs text-gray-500 line-clamp-1">{product.description}</span>)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm text-blue-600 font-medium">{product.category.name}</span>
                            {product.subcategory && (<span className="text-xs text-gray-500">{product.subcategory.name}</span>)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">${product.price.toFixed(2)}</span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-xs text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500 font-mono">{product.sku || '-'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            {product.variants && product.variants.length > 0 ? (
                              <>
                                <span className="text-sm text-gray-900">{product.variants.reduce((sum, v) => sum + v.stock, 0)} units</span>
                                <span className="text-xs text-gray-500">{product.variants.length} variants</span>
                              </>
                            ) : (
                              <span className="text-sm text-gray-500">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
                            </span>
                            {product.featured && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">⭐ Featured</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(product)} className="h-8 w-8 p-0" title="Edit">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(product.id)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" title="Delete">
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