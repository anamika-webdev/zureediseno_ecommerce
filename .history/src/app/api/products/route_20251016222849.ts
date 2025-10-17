// src/app/api/products/route.ts - Fixed with proper response format
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log('🔍 Fetching products with Prisma...');
    console.log('Filters:', { category, subcategory, featured, limit });

    // Build where clause
    const where: any = {};

    if (category) {
      where.category = {
        slug: category
      };
    }

    if (subcategory) {
      where.subcategory = {
        slug: subcategory
      };
    }

    if (featured === 'true') {
      where.featured = true;
    }

    console.log('Where clause:', JSON.stringify(where, null, 2));

    // Fetch products with all related data
    const products = await prisma.product.findMany({
      where,
      include: {
        images: {
          orderBy: [
            { isPrimary: 'desc' },
            { createdAt: 'asc' }
          ]
        },
        variants: {
          orderBy: [
            { size: 'asc' },
            { color: 'asc' }
          ]
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true
          }
        },
        subcategory: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true
          }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      take: limit
    });

    console.log('📦 Found products:', products.length);
    
    // Log first product details for debugging
    if (products.length > 0) {
      console.log('Sample product:', {
        name: products[0].name,
        category: products[0].category?.name,
        subcategory: products[0].subcategory?.name || 'NO SUBCATEGORY'
      });
    } else {
      console.log('⚠️ No products found with filters:', { category, subcategory });
      
      // Check if products exist without subcategory filter
      if (subcategory && category) {
        const categoryOnly = await prisma.product.findMany({
          where: {
            category: { slug: category }
          },
          include: {
            subcategory: {
              select: {
                slug: true
              }
            }
          },
          take: 5
        });
        
        console.log('Products in category (without subcategory filter):', categoryOnly.length);
        if (categoryOnly.length > 0) {
          console.log('Sample subcategories:', categoryOnly.map(p => p.subcategory?.slug || 'null'));
        }
      }
    }

    // Transform the data to match frontend expectations
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price),
      originalPrice: product.originalPrice ? (typeof product.originalPrice === 'string' ? parseFloat(product.originalPrice) : Number(product.originalPrice)) : null,
      sku: product.sku,
      inStock: product.inStock,
      featured: product.featured,
      sortOrder: product.sortOrder || 0,
      images: product.images.map(img => ({
        id: img.id,
        url: img.url,
        alt: img.alt || product.name,
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
      category: product.category ? {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
        description: product.category.description
      } : null,
      subcategory: product.subcategory ? {
        id: product.subcategory.id,
        name: product.subcategory.name,
        slug: product.subcategory.slug,
        description: product.subcategory.description
      } : null,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }));

    console.log('✅ Transformed products for frontend');

    // IMPORTANT: Return format that matches what shop page expects
    return NextResponse.json({
      products: transformedProducts,
      category: products.length > 0 ? products[0].category : null,
      subcategory: products.length > 0 ? products[0].subcategory : null,
      total: transformedProducts.length,
      success: true
    });

  } catch (error) {
    console.error('❌ Error fetching products:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to fetch products from database',
        products: [],
        total: 0
      },
      { status: 500 }
    );
  }
}

// POST endpoint for creating products (admin)
export async function POST(request: NextRequest) {
  try {
    const productData = await request.json();

    if (!productData.name || !productData.categoryId || !productData.price) {
      return NextResponse.json(
        { error: 'Name, category, and price are required' },
        { status: 400 }
      );
    }

    console.log('🆕 Creating product with Prisma:', productData.name);

    // Generate slug if not provided
    const slug = productData.slug || productData.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Create product with related data
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
        
        // Create images if provided
        images: productData.images && productData.images.length > 0 ? {
          create: productData.images.map((image: any, index: number) => ({
            url: typeof image === 'string' ? image : image.url,
            alt: typeof image === 'string' ? productData.name : (image.alt || productData.name),
            isPrimary: index === 0 // First image is primary
          }))
        } : undefined,
        
        // Create variants if provided
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

    console.log('✅ Product created successfully:', product.id);

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