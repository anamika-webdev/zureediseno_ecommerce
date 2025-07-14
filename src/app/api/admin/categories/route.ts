// src/app/api/admin/categories/route.ts - EMERGENCY FIX VERSION
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Categories API called - starting...');
    
    // Test admin auth first
    let user;
    try {
      user = await getCurrentAdmin();
      console.log('👤 Admin auth result:', user ? `${user.email} (${user.role})` : 'null');
    } catch (authError) {
      console.error('❌ Admin auth error:', authError);
      return NextResponse.json(
        { error: 'Authentication failed', details: authError instanceof Error ? authError.message : 'Auth error' },
        { status: 401 }
      );
    }
    
    if (!user) {
      console.log('❌ No admin user found');
      return NextResponse.json(
        { error: 'Unauthorized - No admin session' },
        { status: 401 }
      );
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      console.log('❌ User role not admin:', user.role);
      return NextResponse.json(
        { error: `Forbidden - Role ${user.role} not allowed` },
        { status: 403 }
      );
    }

    console.log('✅ Admin authenticated successfully');

    // Test database connection
    let categories;
    try {
      console.log('🔍 Attempting to fetch categories from database...');
      
      categories = await prisma.category.findMany({
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
      
      console.log('📊 Database query successful, found', categories.length, 'categories');
      
    } catch (dbError) {
      console.error('❌ Database error:', dbError);
      return NextResponse.json(
        { error: 'Database error', details: dbError instanceof Error ? dbError.message : 'DB error' },
        { status: 500 }
      );
    }

    // Transform data safely
    try {
      const cleanCategories = categories.map(category => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        featured: category.featured,
        sortOrder: category.sortOrder,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
        productCount: category._count.products
      }));

      console.log('✅ Categories transformed successfully');
      console.log('📤 Returning', cleanCategories.length, 'categories');

      return NextResponse.json(cleanCategories);
      
    } catch (transformError) {
      console.error('❌ Transform error:', transformError);
      return NextResponse.json(
        { error: 'Data transform error', details: transformError instanceof Error ? transformError.message : 'Transform error' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ General categories API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Creating new category');
    
    const user = await getCurrentAdmin();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const categoryData = await request.json();
    console.log('📝 Category data received:', categoryData);

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

    // Check if slug already exists
    const existingCategory = await prisma.category.findFirst({
      where: { slug }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this slug already exists' },
        { status: 400 }
      );
    }

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
      { 
        error: 'Failed to create category',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}