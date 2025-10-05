// src/app/api/admin/categories/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/admin/categories called');
    
    // Check authentication
    const user = await getCurrentAdmin();
    
    if (!user) {
      console.log('❌ No admin user authenticated');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      console.log('❌ User is not admin:', user.role);
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    console.log('✅ Admin authenticated:', user.email);

    // Fetch categories from database
    const categories = await prisma.category.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
      include: {
        _count: {
          select: {
            products: true,
            subcategories: true
          }
        }
      }
    });

    console.log('✅ Found', categories.length, 'categories');

    // Return categories array directly (simpler format)
    return NextResponse.json(categories);

  } catch (error) {
    console.error('❌ Categories API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📤 POST /api/admin/categories called');
    
    const user = await getCurrentAdmin();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const categoryData = await request.json();
    console.log('📝 Category data:', categoryData);

    if (!categoryData.name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = categoryData.slug || categoryData.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check if slug exists
    const existingCategory = await prisma.category.findFirst({
      where: { slug }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this slug already exists' },
        { status: 400 }
      );
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name: categoryData.name.trim(),
        slug: slug,
        description: categoryData.description?.trim() || null,
        image: categoryData.image?.trim() || null,
        featured: categoryData.featured || false,
        sortOrder: categoryData.sortOrder || 0
      }
    });

    console.log('✅ Category created:', category.id);

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      category
    });

  } catch (error) {
    console.error('❌ Error creating category:', error);
    
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}