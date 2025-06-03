// scripts/setup-tidb.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setupTiDBCloud() {
  try {
    console.log('🚀 Setting up TiDB Cloud database...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Connected to TiDB Cloud successfully')
    
    // Check if database exists and is accessible
    const result = await prisma.$queryRaw`SELECT VERSION() as version`
    console.log('📊 TiDB Version:', result[0].version)
    
    // Push schema to database
    console.log('📝 Applying database schema...')
    
    // You can run this manually: npx prisma db push
    // Or programmatically check if tables exist
    
    try {
      await prisma.$queryRaw`SELECT COUNT(*) as count FROM categories LIMIT 1`
      console.log('✅ Database schema already exists')
    } catch (error) {
      console.log('⚠️  Database schema not found. Please run: npx prisma db push')
    }
    
    // Seed initial data if needed
    const categoryCount = await prisma.category.count()
    
    if (categoryCount === 0) {
      console.log('🌱 Seeding initial data...')
      await seedInitialData()
    } else {
      console.log(`✅ Database already has ${categoryCount} categories`)
    }
    
    console.log('🎉 TiDB Cloud setup completed successfully!')
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

async function seedInitialData() {
  try {
    // Create categories
    const menCategory = await prisma.category.create({
      data: {
        name: 'Men',
        slug: 'men',
        description: 'Men\'s fashion collection',
      },
    })

    const womenCategory = await prisma.category.create({
      data: {
        name: 'Women',
        slug: 'women',
        description: 'Women\'s fashion collection',
      },
    })

    const kidsCategory = await prisma.category.create({
      data: {
        name: 'Kids',
        slug: 'kids',
        description: 'Kids\' fashion collection',
      },
    })

    console.log('✅ Categories created')

    // Create subcategories
    const subcategories = [
      { name: 'Shirts', slug: 'shirts', categoryId: menCategory.id },
      { name: 'T-Shirts', slug: 'tshirts', categoryId: menCategory.id },
      { name: 'Pants', slug: 'pants', categoryId: menCategory.id },
      { name: 'Dresses', slug: 'dresses', categoryId: womenCategory.id },
      { name: 'Tops', slug: 'tops', categoryId: womenCategory.id },
      { name: 'Skirts', slug: 'skirts', categoryId: womenCategory.id },
      { name: 'Boys', slug: 'boys', categoryId: kidsCategory.id },
      { name: 'Girls', slug: 'girls', categoryId: kidsCategory.id },
    ]

    for (const subcategory of subcategories) {
      await prisma.subcategory.create({ data: subcategory })
    }

    console.log('✅ Subcategories created')
    console.log('🌱 Initial data seeded successfully')
    
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  }
}

// Run setup
setupTiDBCloud()