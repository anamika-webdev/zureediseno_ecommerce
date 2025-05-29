// src/app/api/admin/subcategories/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const subcategory = await prisma.subcategory.findUnique({
      where: { id: params.id },
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
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, categoryId, description } = body

    if (!name || !categoryId) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      )
    }

    const subcategory = await prisma.subcategory.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
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
    
    if (error.code === 'P2025') {
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
  { params }: { params: { id: string } }
) {
  try {
    // Check if subcategory has products
    const subcategory = await prisma.subcategory.findUnique({
      where: { id: params.id },
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
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Subcategory deleted successfully' })
  } catch (error) {
    console.error('Error deleting subcategory:', error)
    
    if (error.code === 'P2025') {
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