// src/app/api/products/related/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const categoryId = searchParams.get('categoryId');

    if (!productId || !categoryId) {
      return NextResponse.json(
        { error: 'Product ID and Category ID are required' },
        { status: 400 }
      );
    }

    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: categoryId,
        id: {
          not: productId
        },
        inStock: true
      },
      include: {
        images: {
          orderBy: {
            isPrimary: 'desc'
          }
        }
      },
      take: 4,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(relatedProducts);
  } catch (error) {
    console.error('Error fetching related products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related products' },
      { status: 500 }
    );
  }
}