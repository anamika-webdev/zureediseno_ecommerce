// src/lib/queries/subcategories.ts
import { prisma } from '@/lib/prisma';

export const getAllSubCategories = async () => {
  try {
    const subcategories = await prisma.subcategory.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: [
        { name: 'asc' }
      ]
    });

    return subcategories;
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    throw new Error('Failed to fetch subcategories');
  }
};

export const getSubCategoriesByCategory = async (categoryId: string) => {
  try {
    const subcategories = await prisma.subcategory.findMany({
      where: {
        categoryId: categoryId
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return subcategories;
  } catch (error) {
    console.error('Error fetching subcategories by category:', error);
    throw new Error('Failed to fetch subcategories by category');
  }
};

export const getSubCategoryBySlug = async (slug: string) => {
  try {
    const subcategory = await prisma.subcategory.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
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
            products: true
          }
        }
      }
    });

    return subcategory;
  } catch (error) {
    console.error('Error fetching subcategory by slug:', error);
    throw new Error('Failed to fetch subcategory');
  }
};

export const getSubCategoriesWithProducts = async () => {
  try {
    const subcategories = await prisma.subcategory.findMany({
      where: {
        products: {
          some: {}
        }
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
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

    return subcategories;
  } catch (error) {
    console.error('Error fetching subcategories with products:', error);
    throw new Error('Failed to fetch subcategories with products');
  }
};