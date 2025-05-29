// src/app/api/admin/subcategories/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const subcategories = await prisma.subcategory.findMany({
      include: {
        category: {
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

    return NextResponse.json(subcategories)
  } catch (error) {
    console.error('Error fetching subcategories:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch subcategories',
        message: error.message
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, categoryId, description } = body

    if (!name || !categoryId) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      )
    }

    const subcategory = await prisma.subcategory.create({
      data: {
        name: name.trim(),
        categoryId,
        description: description?.trim() || null
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(subcategory)
  } catch (error) {
    console.error('Error creating subcategory:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create subcategory',
        message: error.message
      },
      { status: 500 }
    )
  }
}