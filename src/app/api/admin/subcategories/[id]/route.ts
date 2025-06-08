// src/app/api/admin/subcategories/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface PrismaError extends Error {
  code?: string;
  meta?: any;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params // Await the params Promise
    
    const subcategory = await prisma.subcategory.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        products: {
          take: 5,
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    if (!subcategory) {
      return NextResponse.json(
        { error: 'Subcategory not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(subcategory)
  } catch (error) {
    console.error('Error fetching subcategory:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subcategory' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params // Await the params Promise
    const body = await request.json()
    const { name, categoryId, description, slug } = body

    if (!name || !categoryId) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      )
    }

    // Generate slug if not provided
    const subcategorySlug = slug || name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')

    // Check if slug already exists for other subcategories
    const existingSubcategory = await prisma.subcategory.findFirst({
      where: {
        slug: subcategorySlug,
        NOT: {
          id
        }
      }
    })

    if (existingSubcategory) {
      return NextResponse.json(
        { error: 'A subcategory with this URL slug already exists' },
        { status: 400 }
      )
    }

    const subcategory = await prisma.subcategory.update({
      where: { id },
      data: {
        name: name.trim(),
        slug: subcategorySlug,
        categoryId,
        description: description?.trim() || null
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
    console.error('Error updating subcategory:', error)
    
    // Handle specific Prisma errors with proper type checking
    const prismaError = error as PrismaError
    if (prismaError.code === 'P2025') {
      return NextResponse.json(
        { error: 'Subcategory not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update subcategory' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params // Await the params Promise
    
    // Check if subcategory has products
    const subcategory = await prisma.subcategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    if (!subcategory) {
      return NextResponse.json(
        { error: 'Subcategory not found' },
        { status: 404 }
      )
    }

    if (subcategory._count.products > 0) {
      return NextResponse.json(
        { error: 'Cannot delete subcategory with products. Move or delete products first.' },
        { status: 400 }
      )
    }

    await prisma.subcategory.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Subcategory deleted successfully' })
  } catch (error) {
    console.error('Error deleting subcategory:', error)
    
    // Handle specific Prisma errors with proper type checking
    const prismaError = error as PrismaError
    if (prismaError.code === 'P2025') {
      return NextResponse.json(
        { error: 'Subcategory not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete subcategory' },
      { status: 500 }
    )
  }
}