const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn']
})

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Test categories table
    console.log('🔍 Testing categories table...')
    const categoryCount = await prisma.category.count()
    console.log(`📊 Categories count: ${categoryCount}`)
    
    // Test subcategories table
    console.log('🔍 Testing subcategories table...')
    const subcategoryCount = await prisma.subcategory.count()
    console.log(`📊 Subcategories count: ${subcategoryCount}`)
    
    // Test products table
    console.log('🔍 Testing products table...')
    const productCount = await prisma.product.count()
    console.log(`📊 Products count: ${productCount}`)
    
    // Test simple queries
    console.log('🔍 Testing simple queries...')
    const categories = await prisma.category.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' }
    })
    console.log(`✅ Sample categories:`, categories.map(c => c.name))
    
    console.log('🎉 All database tests passed!')
    
  } catch (error) {
    console.error('❌ Database test failed:')
    console.error('Error:', error.message)
    console.error('Code:', error.code)
    console.error('Meta:', error.meta)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()