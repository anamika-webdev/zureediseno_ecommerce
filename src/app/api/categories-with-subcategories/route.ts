// src/app/api/categories-with-subcategories/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: {
          orderBy: [
            { sortOrder: 'asc' },
            { name: 'asc' }
          ]
        },
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    // Transform data to match the expected frontend format
    const transformedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      url: category.slug, // Make sure to use slug as url
      image: category.image, // This should contain the full image URL
      featured: category.featured,
      slug: category.slug,
      subcategories: category.subcategories?.map(sub => ({
        id: sub.id,
        name: sub.name,
        url: sub.slug,
        image: (sub as any).image || null, // Handle missing image field with type assertion
        featured: (sub as any).featured || false
      })) || [],
      _count: category._count
    }));

    return NextResponse.json(transformedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}