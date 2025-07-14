// File: src/app/api/categories-with-subcategories/route.ts
// UPDATE THIS ROUTE TO PROPERLY RETURN IMAGE URLS

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

    // ✅ FIXED: Properly transform data with full image URLs
    const transformedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      url: category.slug,
      // ✅ ENSURE IMAGE URL IS COMPLETE
      image: category.image ? 
        (category.image.startsWith('/') ? category.image : `/${category.image}`) : 
        null,
      featured: category.featured,
      slug: category.slug,
      subcategories: category.subcategories?.map(sub => ({
        id: sub.id,
        name: sub.name,
        url: sub.slug,
        // ✅ HANDLE SUBCATEGORY IMAGES TOO
        image: (sub as any).image ? 
          ((sub as any).image.startsWith('/') ? (sub as any).image : `/${(sub as any).image}`) : 
          null,
        featured: (sub as any).featured || false
      })) || [],
      _count: category._count
    }));

    // ✅ ADD LOGGING TO DEBUG IMAGE ISSUES
    console.log('Categories with images:', transformedCategories.map(cat => ({
      name: cat.name,
      image: cat.image,
      hasImage: !!cat.image
    })));

    return NextResponse.json(transformedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}