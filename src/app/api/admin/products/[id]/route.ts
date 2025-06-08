// src/app/api/admin/products/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params // Await the params Promise
    
    const product = await prisma.product.findUnique({
      where: { id },
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
          orderBy: {
            isPrimary: 'desc'
          }
        },
        variants: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error: any) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params // Await the params Promise
    const body = await request.json()
    const { 
      name, 
      description, 
      price, 
      originalPrice,
      categoryId,
      subcategoryId,
      featured,
      inStock
    } = body

    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      )
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Generate new slug if name changed
    let slug = existingProduct.slug
    if (name.trim() !== existingProduct.name) {
      slug = name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-')

      // Check if new slug already exists
      const slugExists = await prisma.product.findFirst({
        where: {
          slug,
          id: { not: id }
        }
      })

      if (slugExists) {
        slug = `${slug}-${Date.now()}`
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        price: parseFloat(price.toString()),
        originalPrice: originalPrice ? parseFloat(originalPrice.toString()) : null,
        categoryId,
        subcategoryId: subcategoryId || null,
        featured: Boolean(featured),
        inStock: Boolean(inStock)
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
        images: true,
        variants: true
      }
    })

    return NextResponse.json(product)
  } catch (error: any) {
    console.error('Error updating product:', error)
    
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params // Await the params Promise
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orderItems: true
          }
        }
      }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if product has associated orders
    if (existingProduct._count.orderItems > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product with existing orders. Consider marking it as out of stock instead.' },
        { status: 400 }
      )
    }

    // Delete related data first (due to foreign key constraints)
    await prisma.productVariant.deleteMany({
      where: { productId: id }
    })

    await prisma.productImage.deleteMany({
      where: { productId: id }
    })

    // Delete the product
    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({ 
      message: 'Product deleted successfully' 
    })
  } catch (error: any) {
    console.error('Error deleting product:', error)
    
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}