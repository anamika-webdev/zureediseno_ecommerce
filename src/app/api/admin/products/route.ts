// src/app/api/admin/products/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
        message: error.message
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
      comparePrice,
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

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        categoryId,
        subcategoryId: subcategoryId || null,
        images: images || [],
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
        }
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create product',
        message: error.message
      },
      { status: 500 }
    )
  }
}