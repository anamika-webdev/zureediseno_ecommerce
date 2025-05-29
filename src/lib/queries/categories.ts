import { prisma } from '@/lib/prisma'

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: {
          orderBy: [
            { sortOrder: 'asc' },
            { name: 'asc' }
          ]
        },
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    })
    
    return categories
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export async function getCategoryByUrl(url: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { url },
      include: {
        subcategories: {
          orderBy: [
            { sortOrder: 'asc' },
            { name: 'asc' }
          ]
        },
        products: {
          include: {
            category: true,
            subcategory: true
          },
          orderBy: [
            { featured: 'desc' },
            { createdAt: 'desc' }
          ]
        }
      }
    })
    
    return category
  } catch (error) {
    console.error('Error fetching category by URL:', error)
    return null
  }
}

export async function getFeaturedCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: { featured: true },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    })
    
    return categories
  } catch (error) {
    console.error('Error fetching featured categories:', error)
    return []
  }
}