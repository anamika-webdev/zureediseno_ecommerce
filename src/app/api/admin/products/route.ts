// src/app/api/admin/products/route.ts - Fixed to use Prisma
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    console.log('🔍 Admin fetching products with Prisma...');

    // Build where clause for filtering
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    // Get total count for pagination
    const total = await prisma.product.count({ where });

    // Fetch products with pagination
    const products = await prisma.product.findMany({
      where,
      include: {
        images: {
          orderBy: { isPrimary: 'desc' }
        },
        variants: {
          orderBy: [{ size: 'asc' }, { color: 'asc' }]
        },
        category: {
          select: { id: true, name: true, slug: true }
        },
        subcategory: {
          select: { id: true, name: true, slug: true }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    });

    console.log('📦 Found products for admin:', products.length);

    // Transform data for frontend
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price),
      originalPrice: product.originalPrice ? 
        (typeof product.originalPrice === 'string' ? parseFloat(product.originalPrice) : Number(product.originalPrice)) 
        : null,
      sku: product.sku,
      inStock: product.inStock,
      featured: product.featured,
      sortOrder: product.sortOrder || 0,
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId,
      images: product.images.map(img => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        isPrimary: img.isPrimary
      })),
      variants: product.variants.map(variant => ({
        id: variant.id,
        size: variant.size,
        color: variant.color,
        stock: variant.stock,
        sleeveType: variant.sleeveType,
        sku: variant.sku
      })),
      category: product.category,
      subcategory: product.subcategory,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }));

    return NextResponse.json({
      success: true,
      products: transformedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Error fetching admin products:', error);
    
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
    // Check authentication and admin role
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

    const productData = await request.json();

    if (!productData.name || !productData.categoryId || !productData.price) {
      return NextResponse.json(
        { error: 'Name, category, and price are required' },
        { status: 400 }
      );
    }

    console.log('🆕 Admin creating product:', productData.name);

    // Generate slug if not provided
    const slug = productData.slug || productData.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Create product with all related data
    const product = await prisma.product.create({
      data: {
        name: productData.name,
        slug: slug,
        description: productData.description || null,
        price: productData.price,
        originalPrice: productData.originalPrice || null,
        sku: productData.sku || null,
        categoryId: productData.categoryId,
        subcategoryId: productData.subcategoryId || null,
        inStock: productData.inStock !== false,
        featured: productData.featured || false,
        sortOrder: productData.sortOrder || 0,
        
        // Create images
        images: productData.images && productData.images.length > 0 ? {
          create: productData.images.map((image: any, index: number) => ({
            url: typeof image === 'string' ? image : image.url,
            alt: typeof image === 'string' ? productData.name : (image.alt || productData.name),
            isPrimary: index === 0
          }))
        } : undefined,
        
        // Create variants
        variants: productData.variants && productData.variants.length > 0 ? {
          create: productData.variants
            .filter((variant: any) => variant.size || variant.color || variant.stock > 0)
            .map((variant: any) => ({
              size: variant.size || '',
              color: variant.color || '',
              stock: variant.stock || 0,
              sleeveType: variant.sleeveType || null,
              sku: variant.sku || null
            }))
        } : undefined
      },
      include: {
        images: true,
        variants: true,
        category: true,
        subcategory: true
      }
    });

    console.log('✅ Admin product created successfully:', product.id);

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug
      }
    });

  } catch (error) {
    console.error('❌ Error creating product:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create product',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}