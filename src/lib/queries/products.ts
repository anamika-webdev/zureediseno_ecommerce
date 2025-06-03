// src/lib/queries/products.ts
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

// Helper function to convert Decimal to number
function convertPriceToNumber(price: Decimal | number | null): number | undefined {
  if (price === null || price === undefined) return undefined
  if (typeof price === 'number') return price
  return parseFloat(price.toString())
}

// Helper function to transform product data
function transformProduct(product: any) {
  return {
    ...product,
    price: convertPriceToNumber(product.price) || 0,
    originalPrice: convertPriceToNumber(product.originalPrice),
    comparePrice: convertPriceToNumber(product.comparePrice),
    image: product.images?.find((img: any) => img.isPrimary)?.url || 
           product.images?.[0]?.url || 
           '/assets/images/placeholder.jpg',
  }
}

export async function getProducts(category?: string, subcategory?: string) {
  try {
    const products = await prisma.product.findMany({
      where: {
        ...(category && {
          category: {
            slug: category
          }
        }),
        ...(subcategory && {
          subcategory: {
            slug: subcategory
          }
        })
      },
      include: {
        category: true,
        subcategory: true,
        images: true,
        variants: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return products.map(transformProduct);
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        subcategory: true,
        images: true,
        variants: true
      }
    });

    if (!product) return null;
    return transformProduct(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function getFeaturedProducts(limit: number = 8) {
  try {
    const products = await prisma.product.findMany({
      where: {
        featured: true,
        inStock: true
      },
      include: {
        category: true,
        subcategory: true,
        images: true,
        variants: true
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return products.map(transformProduct);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

export async function getProductsByCategory(categorySlug: string, limit?: number) {
  try {
    const products = await prisma.product.findMany({
      where: {
        category: {
          slug: categorySlug
        },
        inStock: true
      },
      include: {
        category: true,
        subcategory: true,
        images: true,
        variants: true
      },
      ...(limit && { take: limit }),
      orderBy: {
        createdAt: 'desc'
      }
    });

    return products.map(transformProduct);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
}

export async function getProductsBySubcategory(subcategorySlug: string, limit?: number) {
  try {
    const productsFromDb = await prisma.product.findMany({
      where: {
        subcategory: {
          slug: subcategorySlug
        },
        inStock: true
      },
      include: {
        category: true,
        subcategory: true,
        images: true,
        variants: true
      },
      ...(limit && { take: limit }),
      orderBy: {
        createdAt: 'desc'
      }
    });

    return productsFromDb.map(transformProduct);
  } catch (error) {
    console.error('Error fetching products by subcategory:', error);
    return [];
  }
}

export async function getRelatedProducts(productId: string, categoryId: string, limit: number = 4) {
  try {
    const products = await prisma.product.findMany({
      where: {
        categoryId: categoryId,
        id: {
          not: productId
        },
        inStock: true
      },
      include: {
        category: true,
        subcategory: true,
        images: true,
        variants: true
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return products.map(transformProduct);
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
}