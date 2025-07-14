// src/app/api/admin/categories/[id]/route.ts - COMPLETE WORKING VERSION
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/adminAuth'
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
    const { id } = await params
    console.log('📥 GET category:', id);
    
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        subcategories: {
          select: {
            id: true,
            name: true,
            slug: true,
            sortOrder: true
          },
          orderBy: [
            { sortOrder: 'asc' },
            { name: 'asc' }
          ]
        },
        products: {
          take: 5,
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            products: true,
            subcategories: true
          }
        }
      }
    })

    if (!category) {
      console.log('❌ Category not found:', id);
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    console.log('✅ Category found:', category.name);
    return NextResponse.json(category)
  } catch (error) {
    console.error('❌ GET category error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('📝 PUT category:', id);
    
    const user = await getCurrentAdmin()
    
    if (!user) {
      console.log('❌ Unauthorized PUT attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      console.log('❌ Non-admin PUT attempt:', user.role);
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, slug, description, image, featured, sortOrder } = body

    console.log('📝 Update data:', { name, image: image ? 'Has image' : 'No image' });

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Generate slug if not provided
    const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')

    // Check if slug already exists for other categories
    const existingCategory = await prisma.category.findFirst({
      where: {
        slug: categorySlug,
        NOT: {
          id
        }
      }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this slug already exists' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = {
      name: name.trim(),
      slug: categorySlug,
      description: description?.trim() || null,
      image: image?.trim() || null,
      featured: Boolean(featured),
      updatedAt: new Date()
    }

    if (typeof sortOrder === 'number') {
      updateData.sortOrder = sortOrder
    }

    console.log('💾 Updating category with:', updateData);

    const category = await prisma.category.update({
      where: { id },
      data: updateData
    })

    console.log('✅ Category updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      category
    })
  } catch (error) {
    console.error('❌ PUT category error:', error)
    
    const prismaError = error as PrismaError
    if (prismaError.code === 'P2025') {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('🗑️ DELETE category request:', id);
    
    const user = await getCurrentAdmin()
    
    if (!user) {
      console.log('❌ Unauthorized DELETE attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      console.log('❌ Non-admin DELETE attempt:', user.role);
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    console.log('✅ Admin authenticated for delete');
    
    // Check if category exists and has products or subcategories
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            subcategories: true
          }
        }
      }
    })

    if (!category) {
      console.log('❌ Category not found for delete:', id);
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    console.log('📊 Category stats:', { 
      products: category._count.products, 
      subcategories: category._count.subcategories 
    });

    if (category._count.products > 0) {
      console.log('❌ Cannot delete - has products:', category._count.products);
      return NextResponse.json(
        { error: `Cannot delete category with ${category._count.products} products. Move or delete products first.` },
        { status: 400 }
      )
    }

    if (category._count.subcategories > 0) {
      console.log('❌ Cannot delete - has subcategories:', category._count.subcategories);
      return NextResponse.json(
        { error: `Cannot delete category with ${category._count.subcategories} subcategories. Delete subcategories first.` },
        { status: 400 }
      )
    }

    console.log('✅ Safe to delete category');

    await prisma.category.delete({
      where: { id }
    })

    console.log('✅ Category deleted successfully');

    return NextResponse.json({ 
      success: true,
      message: 'Category deleted successfully' 
    })
  } catch (error) {
    console.error('❌ DELETE category error:', error)
    
    const prismaError = error as PrismaError
    if (prismaError.code === 'P2025') {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}