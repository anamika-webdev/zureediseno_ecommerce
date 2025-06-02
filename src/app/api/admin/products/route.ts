// src/app/api/admin/products/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface PrismaError extends Error {
  code?: string;
  meta?: any;
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        subcategory: {
          select: {
            id: true,
            name: true
          }
        },
        images: {
          select: {
            id: true,
            url: true,
            alt: true,
            isPrimary: true
          }
        },
        variants: {
          select: {
            id: true,
            size: true,
            color: true,
            stock: true,
            sleeveType: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      name, 
      description, 
      price, 
      originalPrice, // Changed from comparePrice to originalPrice
      comparePrice,   // Keep comparePrice for backward compatibility
      categoryId,
      subcategoryId,
      images,
      featured,
      inStock
    } = body

    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')

    // Use originalPrice if provided, otherwise use comparePrice for backward compatibility
    const priceValue = originalPrice || comparePrice;

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        price: parseFloat(price),
        originalPrice: priceValue ? parseFloat(priceValue) : null,
        categoryId,
        subcategoryId: subcategoryId || null,
        featured: featured || false,
        inStock: inStock !== false // default to true unless explicitly false
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        subcategory: {
          select: {
            id: true,
            name: true
          }
        },
        images: {
          select: {
            id: true,
            url: true,
            alt: true,
            isPrimary: true
          }
        },
        variants: {
          select: {
            id: true,
            size: true,
            color: true,
            stock: true,
            sleeveType: true
          }
        }
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    
    // Handle Prisma-specific errors with proper type checking
    const prismaError = error as PrismaError
    if (prismaError.code === 'P2002') {
      return NextResponse.json(
        { error: 'A product with this name or slug already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create product',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}