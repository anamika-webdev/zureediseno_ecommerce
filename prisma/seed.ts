import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create categories
  const menCategory = await prisma.category.create({
    data: {
      name: 'Men',
      slug: 'men',
      description: 'Men\'s clothing and accessories'
    }
  })

  const womenCategory = await prisma.category.create({
    data: {
      name: 'Women',
      slug: 'women',
      description: 'Women\'s clothing and accessories'
    }
  })

  const kidsCategory = await prisma.category.create({
    data: {
      name: 'Kids',
      slug: 'kids',
      description: 'Children\'s clothing'
    }
  })

  // Create subcategories
  await prisma.subcategory.createMany({
    data: [
      { name: 'Shirts', slug: 'shirts', categoryId: menCategory.id },
      { name: 'Pants', slug: 'pants', categoryId: menCategory.id },
      { name: 'Dresses', slug: 'dresses', categoryId: womenCategory.id },
      { name: 'Tops', slug: 'tops', categoryId: womenCategory.id },
      { name: 'T-Shirts', slug: 't-shirts', categoryId: kidsCategory.id },
    ]
  })

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })