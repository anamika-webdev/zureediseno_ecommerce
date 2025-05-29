import { prisma } from '@/lib/prisma'

export async function getSubcategories() {
  try {
    const subcategories = await prisma.subcategory.findMany({
      include: {
        category: true,
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
    
    return subcategories
  } catch (error) {
    console.error('Error fetching subcategories:', error)
    return []
  }
}

export async function getSubcategoriesByCategory(categoryId: string) {
  try {
    const subcategories = await prisma.subcategory.findMany({
      where: { categoryId },
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
    
    return subcategories
  } catch (error) {
    console.error('Error fetching subcategories by category:', error)
    return []
  }
}

export async function getSubcategoryByUrl(url: string) {
  try {
    const subcategory = await prisma.subcategory.findUnique({
      where: { url },
      include: {
        category: true,
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
    
    return subcategory
  } catch (error) {
    console.error('Error fetching subcategory by URL:', error)
    return null
  }
}