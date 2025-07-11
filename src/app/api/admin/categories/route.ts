// src/app/api/admin/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const categories = await prisma.category.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    return NextResponse.json(categories);

  } catch (error) {
    console.error('Error fetching categories:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const categoryData = await request.json();

    if (!categoryData.name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const slug = categoryData.slug || categoryData.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const category = await prisma.category.create({
      data: {
        name: categoryData.name,
        slug: slug,
        description: categoryData.description || null,
        image: categoryData.image || null,
        featured: categoryData.featured || false,
        sortOrder: categoryData.sortOrder || 0
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      category
    });

  } catch (error) {
    console.error('Error creating category:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create category',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}