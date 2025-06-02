// src/lib/queries/categories.ts
import { prisma } from '@/lib/prisma';

export const getAllCategories = async () => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: {
          orderBy: [
            { name: 'asc' }
          ]
        },
        _count: {
          select: {
            products: true,
            subcategories: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
};

export const getCategoryBySlug = async (slug: string) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        subcategories: {
          orderBy: {
            name: 'asc'
          }
        },
        products: {
          take: 10,
          include: {
            images: {
              orderBy: {
                isPrimary: 'desc'
              }
            }
          }
        },
        _count: {
          select: {
            products: true,
            subcategories: true
          }
        }
      }
    });

    return category;
  } catch (error) {
    console.error('Error fetching category by slug:', error);
    throw new Error('Failed to fetch category');
  }
};

export const getFeaturedCategories = async () => {
  try {
    // Since 'featured' field doesn't exist, return all categories
    // You can modify this logic based on your actual schema
    const categories = await prisma.category.findMany({
      include: {
        subcategories: {
          orderBy: {
            name: 'asc'
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      },
      take: 6 // Limit to 6 categories as "featured"
    });

    return categories;
  } catch (error) {
    console.error('Error fetching featured categories:', error);
    throw new Error('Failed to fetch featured categories');
  }
};

export const getCategoriesWithProducts = async () => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        products: {
          some: {}
        }
      },
      include: {
        subcategories: {
          orderBy: {
            name: 'asc'
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return categories;
  } catch (error) {
    console.error('Error fetching categories with products:', error);
    throw new Error('Failed to fetch categories with products');
  }
};