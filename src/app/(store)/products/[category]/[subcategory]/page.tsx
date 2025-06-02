// src/app/(store)/products/[category]/[subcategory]/page.tsx
import { getProductsBySubcategory } from '@/lib/queries/products'
import ProductGrid from '@/components/ProductGrid'
import { notFound } from 'next/navigation'

interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
  productId: string;
  createdAt: Date;
}

interface ProductVariant {
  id: string;
  size: string;
  color: string;
  stock: number;
  sleeveType?: string;
  productId: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  categoryId: string;
}

interface DatabaseProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  originalPrice?: number | null;
  comparePrice?: number | null;
  sku: string | null;
  inStock: boolean;
  featured: boolean;
  images: ProductImage[];
  variants?: ProductVariant[];
  category: Category;
  subcategory?: Subcategory | null;
  categoryId: string;
  subcategoryId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Transform function to convert database product to display format
function transformProduct(dbProduct: DatabaseProduct) {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    slug: dbProduct.slug,
    price: dbProduct.price,
    originalPrice: dbProduct.originalPrice || dbProduct.comparePrice || undefined,
    images: dbProduct.images.map(img => ({
      id: img.id,
      url: img.url,
      alt: img.alt || dbProduct.name,
      isPrimary: img.isPrimary
    })),
    variants: dbProduct.variants ? dbProduct.variants.map(variant => ({
      id: variant.id,
      size: variant.size,
      color: variant.color,
      stock: variant.stock,
      sleeveType: variant.sleeveType
    })) : [],
    inStock: dbProduct.inStock,
    featured: dbProduct.featured
  };
}

interface SubcategoryPageProps {
  params: Promise<{
    category: string
    subcategory: string
  }>
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  try {
    // Await the params Promise in Next.js 15
    const { category, subcategory } = await params;
    
    const products = await getProductsBySubcategory(subcategory) as DatabaseProduct[]
    
    if (!products || products.length === 0) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">
              {category} / {subcategory}
            </h1>
            <p className="text-gray-600">No products found in this subcategory.</p>
          </div>
        </div>
      )
    }

    // Transform products to the expected format
    const transformedProducts = products.map(transformProduct);

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {products[0]?.subcategory?.name || subcategory}
          </h1>
          <p className="text-gray-600">
            {products.length} product{products.length !== 1 ? 's' : ''} found
          </p>
        </div>
        
        <ProductGrid products={transformedProducts} />
      </div>
    )
  } catch (error) {
    console.error('Error loading subcategory page:', error)
    notFound()
  }
}