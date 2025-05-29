import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Get counts
    const categoryCount = await prisma.category.count()
    const subcategoryCount = await prisma.subcategory.count()
    const productCount = await prisma.product.count()
    
    return NextResponse.json({
      success: true,
      message: 'API is working!',
      database: 'Connected',
      counts: {
        categories: categoryCount,
        subcategories: subcategoryCount,
        products: productCount
      },
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
