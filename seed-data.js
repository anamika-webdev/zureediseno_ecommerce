const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedData() {
  try {
    console.log('🌱 Seeding database with sample data...')
    
    // Create sample categories
    const electronicsCategory = await prisma.category.create({
      data: {
        name: 'Electronics',
        url: 'electronics',
        featured: true,
        sortOrder: 1
      }
    })
    
    const clothingCategory = await prisma.category.create({
      data: {
        name: 'Clothing',
        url: 'clothing',
        featured: false,
        sortOrder: 2
      }
    })
    
    console.log('✅ Categories created')
    
    // Create sample subcategories
    const phonesSubcategory = await prisma.subcategory.create({
      data: {
        name: 'Smartphones',
        url: 'smartphones',
        categoryId: electronicsCategory.id,
        featured: true,
        sortOrder: 1
      }
    })
    
    const laptopsSubcategory = await prisma.subcategory.create({
      data: {
        name: 'Laptops',
        url: 'laptops',
        categoryId: electronicsCategory.id,
        featured: false,
        sortOrder: 2
      }
    })
    
    const tshirtsSubcategory = await prisma.subcategory.create({
      data: {
        name: 'T-Shirts',
        url: 't-shirts',
        categoryId: clothingCategory.id,
        featured: false,
        sortOrder: 1
      }
    })
    
    console.log('✅ Subcategories created')
    
    // Create sample products
    const product1 = await prisma.product.create({
      data: {
        name: 'iPhone 15 Pro',
        slug: 'iphone-15-pro',
        description: 'Latest iPhone with advanced features',
        price: 999.99,
        comparePrice: 1099.99,
        categoryId: electronicsCategory.id,
        subcategoryId: phonesSubcategory.id,
        featured: true,
        inStock: true,
        images: JSON.stringify([
          'https://via.placeholder.com/400x400/000/fff?text=iPhone+15+Pro'
        ])
      }
    })
    
    const product2 = await prisma.product.create({
      data: {
        name: 'MacBook Pro 16"',
        slug: 'macbook-pro-16',
        description: 'Powerful laptop for professionals',
        price: 2499.99,
        categoryId: electronicsCategory.id,
        subcategoryId: laptopsSubcategory.id,
        featured: true,
        inStock: true,
        images: JSON.stringify([
          'https://via.placeholder.com/400x400/333/fff?text=MacBook+Pro'
        ])
      }
    })
    
    const product3 = await prisma.product.create({
      data: {
        name: 'Cotton T-Shirt',
        slug: 'cotton-t-shirt',
        description: 'Comfortable cotton t-shirt',
        price: 29.99,
        comparePrice: 39.99,
        categoryId: clothingCategory.id,
        subcategoryId: tshirtsSubcategory.id,
        featured: false,
        inStock: true,
        images: JSON.stringify([
          'https://via.placeholder.com/400x400/666/fff?text=T-Shirt'
        ])
      }
    })
    
    console.log('✅ Products created')
    
    // Print summary
    const categoryCount = await prisma.category.count()
    const subcategoryCount = await prisma.subcategory.count()
    const productCount = await prisma.product.count()
    
    console.log('\n📊 Database Summary:')
    console.log(`Categories: ${categoryCount}`)
    console.log(`Subcategories: ${subcategoryCount}`)
    console.log(`Products: ${productCount}`)
    
    console.log('\n🎉 Database seeded successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedData()
