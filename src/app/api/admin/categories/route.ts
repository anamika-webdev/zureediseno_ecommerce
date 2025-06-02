// src/app/api/admin/categories/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface PrismaError extends Error {
  code?: string;
  meta?: any;
}

export async function GET() {
  try {
    console.log('📍 API: Fetching categories...')
    
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`✅ API: Found ${categories.length} categories`)
    return NextResponse.json(categories)
  } catch (error) {
    console.error('❌ API Error fetching categories:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch categories',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log('📍 API: Creating new category...')
    
    const body = await request.json()
    console.log('📝 Request body:', body)
    
    const { name, slug, description } = body

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      console.log('❌ Validation failed: Invalid name')
      return NextResponse.json(
        { error: 'Category name is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    // Generate slug if not provided
    const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')

    // Check if category with same name already exists (case-insensitive comparison)
    const existingCategories = await prisma.category.findMany({
      where: {
        OR: [
          { name: name.trim() },
          { slug: categorySlug }
        ]
      }
    })

    // Manual case-insensitive check
    const nameExists = existingCategories.some(cat => 
      cat.name.toLowerCase() === name.trim().toLowerCase()
    )

    const slugExists = existingCategories.some(cat => 
      cat.slug?.toLowerCase() === categorySlug.toLowerCase()
    )

    if (nameExists) {
      console.log('❌ Category already exists:', name)
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 400 }
      )
    }

    if (slugExists) {
      console.log('❌ Category slug already exists:', categorySlug)
      return NextResponse.json(
        { error: 'A category with this URL slug already exists' },
        { status: 400 }
      )
    }

    // Create the category
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: categorySlug,
        description: description?.trim() || null
      }
    })

    console.log('✅ Category created successfully:', category.id)
    return NextResponse.json(category, { status: 201 })

  } catch (error) {
    console.error('❌ API Error creating category:', error)
    
    // Handle Prisma-specific errors with proper type checking
    const prismaError = error as PrismaError
    if (prismaError.code === 'P2002') {
      return NextResponse.json(
        { error: 'A category with this name or slug already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create category',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}