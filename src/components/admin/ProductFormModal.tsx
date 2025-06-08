// src/components/admin/ProductFormModal.tsx - Fixed TypeScript issues
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Upload, 
  X, 
  Plus, 
  Minus, 
  Image as ImageIcon, 
  Star,
  GripVertical,
  Trash2,
  Edit3
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

// Fixed ProductImage interface with required order property
interface ProductImage {
  id?: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number; // This was missing and causing the error
}

// Fixed ProductVariant interface
interface ProductVariant {
  id?: string;
  size: string;
  color: string;
  stock: number;
  sku?: string;
  sleeveType?: string;
}

// Fixed ProductFormData interface to match expected structure
interface ProductFormData {
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  originalPrice?: number;
  sku?: string;
  categoryId: string;
  subcategoryId?: string;
  featured: boolean;
  inStock: boolean;
  sortOrder: number;
  images: ProductImage[];
  variants: ProductVariant[];
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: ProductFormData | null;
}

export default function ProductFormModal({
  isOpen,
  onClose,
  onSuccess,
  product
}: ProductFormModalProps) {
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
    images: [],
    variants: [{ size: '', color: '', stock: 0, sleeveType: '' }],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Available options
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const colorOptions = ['White', 'Black', 'Navy', 'Blue', 'Red', 'Green', 'Yellow', 'Purple', 'Pink', 'Orange', 'Brown', 'Gray', 'Beige'];
  const sleeveOptions = ['Short Sleeve', 'Full Sleeve', '3/4 Sleeve'];

  // Load categories and subcategories
  useEffect(() => {
    if (isOpen) {
      loadCategoriesAndSubcategories();
    }
  }, [isOpen]);

  // Update form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        subcategoryId: product.subcategoryId || '',
        images: Array.isArray(product.images) ? product.images : [],
        variants: Array.isArray(product.variants) && product.variants.length > 0 
          ? product.variants 
          : [{ size: '', color: '', stock: 0, sleeveType: '' }],
      });
    } else {
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
        images: [],
        variants: [{ size: '', color: '', stock: 0, sleeveType: '' }],
      });
    }
  }, [product]);

  // Filter subcategories when category changes
  useEffect(() => {
    if (formData.categoryId && Array.isArray(subcategories) && subcategories.length > 0) {
      const filtered = subcategories.filter(sub => sub.categoryId === formData.categoryId);
      setFilteredSubcategories(filtered);
      
      // Reset subcategory if it doesn't belong to the selected category
      if (formData.subcategoryId && !filtered.find(sub => sub.id === formData.subcategoryId)) {
        setFormData(prev => ({ ...prev, subcategoryId: '' }));
      }
    } else {
      setFilteredSubcategories([]);
      setFormData(prev => ({ ...prev, subcategoryId: '' }));
    }
  }, [formData.categoryId, subcategories]);

  const loadCategoriesAndSubcategories = async () => {
    try {
      setLoadingData(true);
      
      const [categoriesResponse, subcategoriesResponse] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/subcategories')
      ]);

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } else {
        setCategories([]);
      }

      if (subcategoriesResponse.ok) {
        const subcategoriesData = await subcategoriesResponse.json();
        setSubcategories(Array.isArray(subcategoriesData) ? subcategoriesData : []);
      } else {
        setSubcategories([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load categories and subcategories');
      setCategories([]);
      setSubcategories([]);
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (files: FileList) => {
    if (!files.length) return;

    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);

        const response = await fetch('/api/images', {
          method: 'POST',
          body: formDataUpload,
        });

        if (response.ok) {
          const data = await response.json();
          return {
            url: data.imageUrl,
            alt: file.name,
            isPrimary: false,
            order: 0,
          };
        }
        throw new Error('Failed to upload image');
      });

      const uploadedImages = await Promise.all(uploadPromises);
      
      setFormData(prev => {
        const currentImages = Array.isArray(prev.images) ? prev.images : [];
        const newImages = [...currentImages, ...uploadedImages];
        return {
          ...prev,
          images: newImages.map((img, index) => ({
            ...img,
            order: index,
            isPrimary: index === 0 && currentImages.length === 0
          }))
        };
      });

      toast.success(`${uploadedImages.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleImageRemove = (index: number) => {
    setFormData(prev => {
      const currentImages = Array.isArray(prev.images) ? prev.images : [];
      const newImages = currentImages.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages.map((img, i) => ({
          ...img,
          order: i,
          isPrimary: i === 0 && newImages.length > 0
        }))
      };
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    setFormData(prev => {
      const currentImages = Array.isArray(prev.images) ? prev.images : [];
      return {
        ...prev,
        images: currentImages.map((img, i) => ({
          ...img,
          isPrimary: i === index
        }))
      };
    });
  };

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: any) => {
    setFormData(prev => {
      const currentVariants = Array.isArray(prev.variants) ? prev.variants : [];
      return {
        ...prev,
        variants: currentVariants.map((variant, i) => 
          i === index ? { ...variant, [field]: value } : variant
        )
      };
    });
  };

  const addVariant = () => {
    setFormData(prev => {
      const currentVariants = Array.isArray(prev.variants) ? prev.variants : [];
      return {
        ...prev,
        variants: [...currentVariants, { size: '', color: '', stock: 0, sleeveType: '' }]
      };
    });
  };

  const removeVariant = (index: number) => {
    setFormData(prev => {
      const currentVariants = Array.isArray(prev.variants) ? prev.variants : [];
      if (currentVariants.length > 1) {
        return {
          ...prev,
          variants: currentVariants.filter((_, i) => i !== index)
        };
      }
      return prev;
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.categoryId || formData.price <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const currentImages = Array.isArray(formData.images) ? formData.images : [];
    if (currentImages.length === 0) {
      toast.error('Please upload at least one product image');
      return;
    }

    // Validate and filter variants
    const currentVariants = Array.isArray(formData.variants) ? formData.variants : [];
    const validVariants = currentVariants.filter(v => 
      v.size && 
      v.color && 
      v.stock >= 0
    );

    if (validVariants.length === 0) {
      toast.error('Please add at least one valid variant with size and color');
      return;
    }

    setLoading(true);

    try {
      const slug = formData.slug || generateSlug(formData.name);
      
      const submitData = {
        ...formData,
        slug,
        variants: validVariants,
        subcategoryId: formData.subcategoryId || null
      };

      const url = product?.id 
        ? `/api/admin/products/${product.id}`
        : '/api/admin/products';
      
      const method = product?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast.success(product?.id ? 'Product updated successfully' : 'Product created successfully');
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product?.id ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>

        {loadingData ? (
          <div className="text-center py-8">
            <div className="text-lg">Loading...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku || ''}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      placeholder="Product SKU"
                    />
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter product description"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Pricing</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Original Price (₹)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.originalPrice || ''}
                      onChange={(e) => handleInputChange('originalPrice', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sortOrder">Display Order</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      min="0"
                      value={formData.sortOrder}
                      onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category & Classification */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Category & Classification</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => handleInputChange('categoryId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(categories) && categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <Select
                      value={formData.subcategoryId || ''}
                      onValueChange={(value) => handleInputChange('subcategoryId', value)}
                      disabled={!formData.categoryId || !Array.isArray(filteredSubcategories) || filteredSubcategories.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subcategory (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No subcategory</SelectItem>
                        {Array.isArray(filteredSubcategories) && filteredSubcategories.map((subcategory) => (
                          <SelectItem key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="featured">Featured Product</Label>
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => handleInputChange('featured', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="inStock">In Stock</Label>
                    <Switch
                      id="inStock"
                      checked={formData.inStock}
                      onCheckedChange={(checked) => handleInputChange('inStock', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Product Images</h3>
                
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Upload product images
                          </span>
                          <span className="mt-1 block text-sm text-gray-500">
                            PNG, JPG, GIF up to 10MB each
                          </span>
                        </label>
                        <input
                          id="image-upload"
                          type="file"
                          className="hidden"
                          multiple
                          accept="image/*"
                          onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                          disabled={uploadingImages}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-3"
                        onClick={() => document.getElementById('image-upload')?.click()}
                        disabled={uploadingImages}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadingImages ? 'Uploading...' : 'Choose Images'}
                      </Button>
                    </div>
                  </div>

                  {Array.isArray(formData.images) && formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square relative border rounded-lg overflow-hidden">
                            <img
                              src={image.url}
                              alt={image.alt}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleSetPrimaryImage(index)}
                                >
                                  <Star className="w-4 h-4" />
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleImageRemove(index)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          {image.isPrimary && (
                            <Badge className="absolute -top-2 -right-2">Primary</Badge>
                          )}
                          <div className="absolute -top-2 -left-2 bg-gray-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Product Variants */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Product Variants</h3>
                  <Button type="button" onClick={addVariant} size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Variant
                  </Button>
                </div>

                <div className="space-y-4">
                  {Array.isArray(formData.variants) && formData.variants.map((variant, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Variant {index + 1}</h4>
                        {formData.variants.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeVariant(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div className="space-y-2">
                          <Label>Size *</Label>
                          <Select
                            value={variant.size}
                            onValueChange={(value) => handleVariantChange(index, 'size', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Select size</SelectItem>
                              {sizeOptions.map((size) => (
                                <SelectItem key={size} value={size}>
                                  {size}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Color *</Label>
                          <Select
                            value={variant.color}
                            onValueChange={(value) => handleVariantChange(index, 'color', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Color" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Select color</SelectItem>
                              {colorOptions.map((color) => (
                                <SelectItem key={color} value={color}>
                                  {color}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Sleeve Type</Label>
                          <Select
                            value={variant.sleeveType || ''}
                            onValueChange={(value) => handleVariantChange(index, 'sleeveType', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sleeve" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">No sleeve type</SelectItem>
                              {sleeveOptions.map((sleeve) => (
                                <SelectItem key={sleeve} value={sleeve}>
                                  {sleeve}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Stock *</Label>
                          <Input
                            type="number"
                            min="0"
                            value={variant.stock}
                            onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value) || 0)}
                            placeholder="0"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Variant SKU</Label>
                          <Input
                            value={variant.sku || ''}
                            onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                            placeholder="SKU"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={loading || uploadingImages}>
                {loading ? 'Saving...' : (product?.id ? 'Update Product' : 'Create Product')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}