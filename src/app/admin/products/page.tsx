"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string;
  stock: number;
  categoryId: string;
  subCategoryId: string | null;
  category: { name: string };
  subCategory: { name: string } | null;
};

type Category = {
  id: string;
  name: string;
  subCategories: SubCategory[];
};

type SubCategory = {
  id: string;
  name: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: null as File | null,
    stock: "",
    categoryId: "",
    subCategoryId: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productResponse = await fetch("/api/products");
        if (!productResponse.ok) throw new Error("Failed to fetch products");
        const productData = await productResponse.json();
        setProducts(productData);

        const categoryResponse = await fetch("/api/categories");
        if (!categoryResponse.ok) throw new Error("Failed to fetch categories");
        const categoryData = await categoryResponse.json();
        setCategories(categoryData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, files } = e.target as any;
    if (type === "file") {
      setFormData({ ...formData, image: files?.[0] || null });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddProduct = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("stock", formData.stock);
      formDataToSend.append("categoryId", formData.categoryId);
      formDataToSend.append("subCategoryId", formData.subCategoryId);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const response = await fetch("/api/products", {
        method: "POST",
        body: formDataToSend,
      });
      if (!response.ok) throw new Error("Failed to add product");
      const newProduct = await response.json();
      setProducts([...products, newProduct]);
      setIsAddDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        price: "",
        image: null,
        stock: "",
        categoryId: "",
        subCategoryId: "",
      });
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditProductId(product.id);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      image: null,
      stock: product.stock.toString(),
      categoryId: product.categoryId,
      subCategoryId: product.subCategoryId || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    // Note: For simplicity, this example doesn't handle file updates for editing.
    // You can extend this to handle file uploads similarly to the POST method.
    try {
      const response = await fetch(`/api/products/${editProductId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          categoryId: formData.categoryId,
          subCategoryId: formData.subCategoryId || null,
        }),
      });
      if (!response.ok) throw new Error("Failed to update product");
      const updatedProduct = await response.json();
      setProducts(
        products.map((p) => (p.id === editProductId ? { ...p, ...updatedProduct } : p))
      );
      setIsEditDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        price: "",
        image: null,
        stock: "",
        categoryId: "",
        subCategoryId: "",
      });
      setEditProductId(null);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete product");
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Products</h1>

      {/* Add Product Button */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mb-6">Add New Product</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="image">Image File</Label>
              <Input id="image" name="image" type="file" accept="image/*" onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="categoryId">Category</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
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
            {formData.categoryId && (
              <div>
                <Label htmlFor="subCategoryId">Subcategory</Label>
                <Select
                  onValueChange={(value) => setFormData({ ...formData, subCategoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {categories
                      .find((cat) => cat.id === formData.categoryId)
                      ?.subCategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={handleAddProduct}>Add Product</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.length > 0 ? (
          products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{product.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover mb-4"
                  onError={(e) => {
                    e.currentTarget.src = "/assets/images/placeholder.jpg";
                  }}
                />
                <p className="text-sm text-gray-600">Price: ${${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price || 0).toFixed(2)}}</p>
                <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                <p className="text-sm text-gray-600">Category: {product.category.name}</p>
                {product.subCategory && (
                  <p className="text-sm text-gray-600">Subcategory: {product.subCategory.name}</p>
                )}
              </CardContent>
              <CardFooter className="flex space-x-2">
                <Button onClick={() => handleEditProduct(product)}>Edit</Button>
                <Button variant="destructive" onClick={() => handleDeleteProduct(product.id)}>
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <p>No products found.</p>
        )}
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="categoryId">Category</Label>
              <Select
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                value={formData.categoryId}
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
            {formData.categoryId && (
              <div>
                <Label htmlFor="subCategoryId">Subcategory</Label>
                <Select
                  onValueChange={(value) => setFormData({ ...formData, subCategoryId: value })}
                  value={formData.subCategoryId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {categories
                      .find((cat) => cat.id === formData.categoryId)
                      ?.subCategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={handleUpdateProduct}>Update Product</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}