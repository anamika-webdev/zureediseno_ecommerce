// src/app/api/products/[slug]/route.ts - Fixed with category/subcategory data
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    console.log('🔍 Fetching product with slug:', slug);
    
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true  // ✅ CRITICAL: Include slug for fit detection
          }
        },
        subcategory: {
          select: {
            id: true,
            name: true,
            slug: true  // ✅ CRITICAL: Include slug for fit detection
          }
        },
        images: {
          orderBy: {
            isPrimary: 'desc'
          },
          select: {
            id: true,
            url: true,
            alt: true,
            isPrimary: true
          }
        },
        variants: {
          orderBy: [
            { size: 'asc' },
            { color: 'asc' }
          ]
          // ✅ Select all fields - fit will be included if it exists in schema
        }
      }
    });

    if (!product) {
      console.log('❌ Product not found:', slug);
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    console.log('✅ Product found:', product.name);
    console.log('📁 Category:', product.category?.slug);
    console.log('📂 Subcategory:', product.subcategory?.slug);
    console.log('🎨 Variants:', product.variants.length);
    console.log('🖼️  Images:', product.images.length);
    
    // Log first variant to check fit field
    if (product.variants.length > 0) {
      console.log('🔍 First variant:', {
        size: product.variants[0].size,
        color: product.variants[0].color,
        fit: (product.variants[0] as any).fit,  // ✅ Cast to any for fit field
        stock: product.variants[0].stock
      });
    }

    // Transform for frontend
    const transformedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: Number(product.price),
      originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
      sku: product.sku,
      inStock: product.inStock,
      featured: product.featured,
      category: product.category,      // ✅ Include full category object
      subcategory: product.subcategory, // ✅ Include full subcategory object
      images: product.images,
      variants: product.variants.map(v => ({
        id: v.id,
        size: v.size,
        color: v.color,
        sleeveType: v.sleeveType,
        fit: (v as any).fit,  // ✅ Cast to any for fit field
        stock: v.stock,
        sku: v.sku
      })),
      sortOrder: product.sortOrder,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };

    return NextResponse.json(transformedProduct);

  } catch (error) {
    console.error('❌ Error fetching product:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch product',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}