// src/app/api/products/route.ts - Fixed with better subcategory filtering
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log('🔍 API Request - Fetching products...');
    console.log('📋 Parameters:', { category, subcategory, featured, limit });

    // Build where clause
    const where: any = {};

    // Category filter
    if (category) {
      where.category = {
        slug: category
      };
    }

    // Subcategory filter - IMPORTANT: This must be separate
    if (subcategory) {
      where.subcategory = {
        slug: subcategory
      };
    }

    // Featured filter
    if (featured === 'true') {
      where.featured = true;
    }

    console.log('🔎 Where clause:', JSON.stringify(where, null, 2));

    // First, let's check what we have in the database
    const totalProducts = await prisma.product.count();
    const categoryProducts = category ? await prisma.product.count({
      where: { category: { slug: category } }
    }) : 0;
    const subcategoryProducts = subcategory ? await prisma.product.count({
      where: { 
        category: { slug: category },
        subcategory: { slug: subcategory }
      }
    }) : 0;

    console.log('📊 Database stats:');
    console.log(`   Total products: ${totalProducts}`);
    console.log(`   Products in category "${category}": ${categoryProducts}`);
    console.log(`   Products in subcategory "${subcategory}": ${subcategoryProducts}`);

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

    console.log(`✅ Found ${products.length} products matching filters`);

    // Log first product for debugging
    if (products.length > 0) {
      console.log('📦 First product sample:');
      console.log(`   Name: ${products[0].name}`);
      console.log(`   Category: ${products[0].category?.name} (${products[0].category?.slug})`);
      console.log(`   Subcategory: ${products[0].subcategory?.name || 'NONE'} (${products[0].subcategory?.slug || 'NONE'})`);
    }

    // Transform the data to match frontend expectations
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
      } : null
    }));

    // Return response with metadata
    const response = {
      products: transformedProducts,
      category: products[0]?.category || null,
      subcategory: products[0]?.subcategory || null,
      total: products.length,
      filters: {
        category,
        subcategory,
        featured
      }
    };

    console.log('📤 Sending response with', response.products.length, 'products');

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : 'Unknown error',
        products: [],
        total: 0
      },
      { status: 500 }
    );
  }
}