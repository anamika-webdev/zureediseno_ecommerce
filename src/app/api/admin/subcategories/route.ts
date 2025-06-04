// src/app/api/admin/subcategories/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface PrismaError extends Error {
  code?: string;
  meta?: any;
}

export async function GET() {
  try {
    const subcategories = await prisma.subcategory.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { 
          category: {
            sortOrder: 'asc'
          }
        },
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(subcategories)
  } catch (error) {
    console.error('Error fetching subcategories:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch subcategories',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, categoryId, description, slug, sortOrder } = body

    if (!name || !categoryId) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      )
    }

    // Generate slug if not provided
    const subcategorySlug = slug || name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')

    // If no sortOrder provided, get the next available sort order for this category
    let finalSortOrder = sortOrder ?? 0;
    if (finalSortOrder === 0) {
      const maxSortOrder = await prisma.subcategory.aggregate({
        where: {
          categoryId: categoryId
        },
        _max: {
          sortOrder: true
        }
      });
      finalSortOrder = (maxSortOrder._max.sortOrder || 0) + 1;
    }

    // Check if slug already exists
    const existingSubcategory = await prisma.subcategory.findFirst({
      where: {
        slug: subcategorySlug
      }
    })

    if (existingSubcategory) {
      return NextResponse.json(
        { error: 'A subcategory with this URL slug already exists' },
        { status: 400 }
      )
    }

    const subcategory = await prisma.subcategory.create({
      data: {
        name: name.trim(),
        slug: subcategorySlug,
        categoryId,
        description: description?.trim() || null,
        sortOrder: finalSortOrder
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(subcategory)
  } catch (error) {
    console.error('Error creating subcategory:', error)
    
    // Handle Prisma-specific errors with proper type checking
    const prismaError = error as PrismaError
    if (prismaError.code === 'P2002') {
      return NextResponse.json(
        { error: 'A subcategory with this name or slug already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create subcategory',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}