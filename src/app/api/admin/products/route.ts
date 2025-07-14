// src/app/api/admin/products/route.ts - Fixed version
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/adminAuth'; // FIXED: Use getCurrentAdmin instead of getCurrentUser
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    // FIXED: Check admin authentication
    const user = await getCurrentAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // FIXED: Admin check is built into getCurrentAdmin()
    if (!user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const subcategoryId = searchParams.get('subcategoryId') || '';
    const featured = searchParams.get('featured');
    const inStock = searchParams.get('inStock');

    // Build where clause for filtering
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (subcategoryId) {
      where.subcategoryId = subcategoryId;
    }

    if (featured !== null && featured !== '') {
      where.featured = featured === 'true';
    }

    if (inStock !== null && inStock !== '') {
      where.inStock = inStock === 'true';
    }

    // Get total count for pagination
    const total = await prisma.product.count({ where });

    // Fetch products with related data
    const products = await prisma.product.findMany({
      where,
      include: {
        images: {
          orderBy: { isPrimary: 'desc' }
        },
        variants: true,
        category: {
          select: { id: true, name: true }
        },
        subcategory: {
          select: { id: true, name: true }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    });

    // Transform the data to ensure proper types
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: typeof product.price === 'string' ? 
        parseFloat(product.price) : Number(product.price),
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
    // FIXED: Check admin authentication
    const user = await getCurrentAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const productData = await request.json();

    // Generate slug from name
    const slug = slugify(productData.name);

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'A product with this name already exists' },
        { status: 400 }
      );
    }

    // Create the product
    const product = await prisma.product.create({
      data: {
        name: productData.name,
        slug,
        description: productData.description || null,
        price: parseFloat(productData.price),
        originalPrice: productData.originalPrice ? parseFloat(productData.originalPrice) : null,
        sku: productData.sku || null,
        categoryId: productData.categoryId,
        subcategoryId: productData.subcategoryId || null,
        featured: productData.featured || false,
        inStock: productData.inStock !== undefined ? productData.inStock : true,
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