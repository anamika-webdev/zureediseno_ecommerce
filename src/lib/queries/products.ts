

import { prisma } from '@/lib/prisma';

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
        images: true, // This should now work with ProductImage relation
        variants: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return products;
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

    return product;
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

    return products;
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

    return products;
  } catch (error) {
    console.error('Error fetching products by category:', error);
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

    return products;
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
}