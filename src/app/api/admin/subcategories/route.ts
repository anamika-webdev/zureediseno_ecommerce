// src/app/api/admin/subcategories/route.ts - Fixed version
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const user = await getCurrentAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';

    // Build where clause for filtering
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Get total count for pagination
    const total = await prisma.subcategory.count({ where });

    // Fetch subcategories
    const subcategories = await prisma.subcategory.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        products: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    });

    // Transform subcategories to include computed fields
    const transformedSubcategories = subcategories.map(subcategory => ({
      ...subcategory,
      productCount: subcategory.products.length
    }));

    return NextResponse.json({
      success: true,
      subcategories: transformedSubcategories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching admin subcategories:', error);
    
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
    // Check admin authentication
    const user = await getCurrentAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const subcategoryData = await request.json();

    // Validate required fields
    if (!subcategoryData.name || !subcategoryData.categoryId) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = slugify(subcategoryData.name);

    // Check if slug already exists
    const existingSubcategory = await prisma.subcategory.findUnique({
      where: { slug }
    });

    if (existingSubcategory) {
      return NextResponse.json(
        { error: 'A subcategory with this name already exists' },
        { status: 400 }
      );
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: subcategoryData.categoryId }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 400 }
      );
    }

    // Create the subcategory
    const subcategory = await prisma.subcategory.create({
      data: {
        name: subcategoryData.name,
        slug,
        description: subcategoryData.description || null,
        categoryId: subcategoryData.categoryId,
        featured: subcategoryData.featured || false,
        sortOrder: subcategoryData.sortOrder || 0
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Subcategory created successfully',
      subcategory: {
        id: subcategory.id,
        name: subcategory.name,
        slug: subcategory.slug,
        category: subcategory.category
      }
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