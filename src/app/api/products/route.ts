// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');

    console.log('🔍 API called with:', { category, subcategory });

    const whereClause: any = {};

    if (category) {
      // Find category by slug
      const categoryRecord = await prisma.category.findUnique({
        where: { slug: category }
      });

      if (categoryRecord) {
        whereClause.categoryId = categoryRecord.id;
      }
    }

    if (subcategory) {
      // Find subcategory by slug
      const subcategoryRecord = await prisma.subcategory.findUnique({
        where: { slug: subcategory }
      });

      if (subcategoryRecord) {
        whereClause.subcategoryId = subcategoryRecord.id;
      }
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        images: {
          orderBy: {
            isPrimary: 'desc'
          }
        },
        variants: {
          where: {
            stock: {
              gt: 0
            }
          }
        },
        category: true,
        subcategory: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('📦 Found products:', products.length);

    // Transform the data to ensure proper structure
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      originalPrice: product.originalPrice,
      sku: product.sku,
      inStock: product.inStock,
      featured: product.featured,
      images: product.images || [],
      variants: product.variants || [],
      category: product.category,
      subcategory: product.subcategory
    }));

    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}