import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔍 Subcategories API: Starting request...')
    
    // Test database connection first
    await prisma.$connect()
    console.log('✅ Subcategories API: Database connected')
    
    // Simple query with basic include
    const subcategories = await prisma.subcategory.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    })
    
    console.log(`✅ Subcategories API: Found ${subcategories.length} subcategories`)
    return NextResponse.json(subcategories)
    
  } catch (error: any) {
    console.error('❌ Subcategories API Error:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch subcategories',
        details: error.message,
        code: error.code 
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Subcategories API POST: Starting...')
    
    const body = await request.json()
    console.log('📝 Subcategories API POST: Body received:', body)
    
    const { name, url, categoryId, featured = false, sortOrder = 0 } = body

    if (!name || !url || !categoryId) {
      return NextResponse.json({ error: 'Name, URL, and Category are required' }, { status: 400 })
    }

    const subcategory = await prisma.subcategory.create({
      data: {
        name: name.trim(),
        url: url.trim().toLowerCase(),
        categoryId,
        featured: Boolean(featured),
        sortOrder: Number(sortOrder) || 0
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

    console.log('✅ Subcategories API POST: Created subcategory:', subcategory.id)
    return NextResponse.json(subcategory, { status: 201 })
    
  } catch (error: any) {
    console.error('❌ Subcategories API POST Error:', error)
    return NextResponse.json(
      { error: 'Failed to create subcategory', details: error.message }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, url, categoryId, featured, sortOrder } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (url !== undefined) updateData.url = url.trim().toLowerCase()
    if (categoryId !== undefined) updateData.categoryId = categoryId
    if (featured !== undefined) updateData.featured = Boolean(featured)
    if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder) || 0

    const subcategory = await prisma.subcategory.update({
      where: { id },
      data: updateData,
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
  } catch (error: any) {
    console.error('❌ Subcategories API PUT Error:', error)
    return NextResponse.json(
      { error: 'Failed to update subcategory', details: error.message }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await prisma.subcategory.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Subcategory deleted successfully' })
  } catch (error: any) {
    console.error('❌ Subcategories API DELETE Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete subcategory', details: error.message }, 
      { status: 500 }
    )
  }
}