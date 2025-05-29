// src/app/api/admin/categories/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('📍 API: Fetching categories...')
    
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
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
        details: error.message
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
    
    const { name, description } = body

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      console.log('❌ Validation failed: Invalid name')
      return NextResponse.json(
        { error: 'Category name is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    // Check if category with same name already exists
    const existingCategory = await prisma.category.findFirst({
      where: { 
        name: {
          equals: name.trim(),
          mode: 'insensitive'  // Case-insensitive check
        }
      }
    })

    if (existingCategory) {
      console.log('❌ Category already exists:', name)
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 400 }
      )
    }

    // Create the category
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null
      }
    })

    console.log('✅ Category created successfully:', category.id)
    return NextResponse.json(category, { status: 201 })

  } catch (error) {
    console.error('❌ API Error creating category:', error)
    
    // Handle Prisma-specific errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create category',
        details: error.message
      },
      { status: 500 }
    )
  }
}