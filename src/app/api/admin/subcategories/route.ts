// src/app/api/admin/subcategories/route.ts
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

    const subcategories = await prisma.subcategory.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: { products: true }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json(subcategories);

  } catch (error) {
    console.error('Error fetching subcategories:', error);
    
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

    const subcategoryData = await request.json();

    if (!subcategoryData.name || !subcategoryData.categoryId) {
      return NextResponse.json(
        { error: 'Subcategory name and category are required' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const slug = subcategoryData.slug || subcategoryData.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const subcategory = await prisma.subcategory.create({
      data: {
        name: subcategoryData.name,
        slug: slug,
        description: subcategoryData.description || null,
        categoryId: subcategoryData.categoryId,
        featured: subcategoryData.featured || false,
        sortOrder: subcategoryData.sortOrder || 0
      },
      include: {
        category: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Subcategory created successfully',
      subcategory
    });

  } catch (error) {
    console.error('Error creating subcategory:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create subcategory',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}