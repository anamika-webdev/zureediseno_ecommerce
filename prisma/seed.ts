// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Check if data already exists
  const existingCategories = await prisma.category.count();
  if (existingCategories > 0) {
    console.log('📊 Data already exists. Clearing database first...');
    
    // Clear existing data in correct order (due to foreign key constraints)
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.subcategory.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('🗑️ Existing data cleared');
  }

  // Create categories
  const menCategory = await prisma.category.create({
    data: {
      name: 'Men',
      slug: 'men',
      description: 'Men\'s fashion collection',
    },
  });

 /* const womenCategory = await prisma.category.create({
    data: {
      name: 'Women',
      slug: 'women',
      description: 'Women\'s fashion collection',
    },
  });*/

  console.log('✅ Categories created');

  // Create subcategories for Men
  const shirtsSubcategory = await prisma.subcategory.create({
    data: {
      name: 'Shirts',
      slug: 'shirts',
      categoryId: menCategory.id,
    },
  });

  const pantsSubcategory = await prisma.subcategory.create({
    data: {
      name: 'Pants',
      slug: 'pants',
      categoryId: menCategory.id,
    },
  });

  const tshirtsSubcategory = await prisma.subcategory.create({
    data: {
      name: 'T-Shirts',
      slug: 'tshirts',
      categoryId: menCategory.id,
    },
  });

  // Create subcategories for Women
  const womenShirtsSubcategory = await prisma.subcategory.create({
    data: {
      name: 'Shirts',
      slug: 'women-shirts',
      categoryId: womenCategory.id,
    },
  });

  const dressesSubcategory = await prisma.subcategory.create({
    data: {
      name: 'Dresses',
      slug: 'dresses',
      categoryId: womenCategory.id,
    },
  });

  console.log('✅ Subcategories created');

  // Create sample products - ONLY Classic White Shirt
  const product1 = await prisma.product.create({
    data: {
      name: 'Classic White Shirt',
      slug: 'classic-white-shirt',
      description: 'A timeless white shirt perfect for any occasion. Made from premium cotton with a comfortable fit.',
      price: 1499,
      originalPrice: 1699,
      sku: 'CWS001',
      featured: true,
      categoryId: menCategory.id,
      subcategoryId: shirtsSubcategory.id,
    },
  });

  // ========== COMMENTED OUT - OTHER PRODUCTS ==========
  /*
  const product2 = await prisma.product.create({
    data: {
      name: 'Premium Cotton T-Shirt',
      slug: 'premium-cotton-tshirt',
      description: 'Soft and comfortable premium cotton t-shirt for everyday wear. Available in multiple colors.',
      price: 1999,
      originalPrice: 2499,
      sku: 'PCT001',
      featured: true,
      categoryId: menCategory.id,
      subcategoryId: tshirtsSubcategory.id,
    },
  });

  const product3 = await prisma.product.create({
    data: {
      name: 'Formal Black Shirt',
      slug: 'formal-black-shirt',
      description: 'Elegant black formal shirt perfect for office and special occasions.',
      price: 3499,
      originalPrice: 4299,
      sku: 'FBS001',
      featured: false,
      categoryId: menCategory.id,
      subcategoryId: shirtsSubcategory.id,
    },
  });

  const product4 = await prisma.product.create({
    data: {
      name: 'Casual Denim Shirt',
      slug: 'casual-denim-shirt',
      description: 'Stylish denim shirt for casual outings. Comfortable and trendy.',
      price: 2799,
      sku: 'CDS001',
      featured: false,
      categoryId: menCategory.id,
      subcategoryId: shirtsSubcategory.id,
    },
  });

  const product5 = await prisma.product.create({
    data: {
      name: 'Women\'s Floral Dress',
      slug: 'womens-floral-dress',
      description: 'Beautiful floral dress for women. Perfect for summer occasions.',
      price: 3999,
      originalPrice: 4999,
      sku: 'WFD001',
      featured: true,
      categoryId: womenCategory.id,
      subcategoryId: dressesSubcategory.id,
    },
  });
  */

  console.log('✅ Products created');

  // Add product images - ONLY for Classic White Shirt
  await prisma.productImage.createMany({
    data: [
      // Product 1 images - Classic White Shirt
      {
        url: '/uploads/WHITE SHIRT WITH POCKET-photoshoot/White_Shirt (3).jpg',
        alt: 'Classic White Shirt - Front View',
        isPrimary: true,
        productId: product1.id,
      },
      {
        url: '/uploads/WHITE SHIRT WITH POCKET-photoshoot/White_Shirt (5).jpg',
        alt: 'Classic White Shirt - Side View',
        isPrimary: false,
        productId: product1.id,
      },
      {
        url: '/uploads/WHITE SHIRT WITH POCKET-photoshoot/White_Shirt (1).jpg',
        alt: 'Classic White Shirt - Back View',
        isPrimary: false,
        productId: product1.id,
      },
      {
        url: '/uploads/WHITE SHIRT WITH POCKET-photoshoot/White_Shirt (2).jpg',
        alt: 'Classic White Shirt - Detail View',
        isPrimary: false,
        productId: product1.id,
      },
      
      // ========== COMMENTED OUT - OTHER PRODUCT IMAGES ==========
      /*
      // Product 2 images
      {
        url: '/uploads/lavender--photoshoot/Lavender_Shirt (4).jpg',
        alt: 'Premium Cotton T-Shirt - Front View',
        isPrimary: true,
        productId: product2.id,
      },
      {
        url: '/uploads/lavender--photoshoot/Lavender_Shirt (2).jpg',
        alt: 'Premium Cotton T-Shirt - Back View',
        isPrimary: false,
        productId: product2.id,
      },
      // Product 3 images
      {
        url: '/uploads/black--photoshoot/Black_Shirt (5).jpg',
        alt: 'Formal Black Shirt - Front View',
        isPrimary: true,
        productId: product3.id,
      },
      // Product 4 images
      {
        url: '/uploads/black--photoshoot/Black_Shirt (5).jpg',
        alt: 'Casual Denim Shirt - Front View',
        isPrimary: true,
        productId: product4.id,
      },
      // Product 5 images
      {
        url: '/uploads/fabric.jpg',
        alt: 'Women\'s Floral Dress - Front View',
        isPrimary: true,
        productId: product5.id,
      },
      */
    ],
  });

  console.log('✅ Product images created');

  // Add product variants - ONLY for Classic White Shirt
  await prisma.productVariant.createMany({
    data: [
      // Product 1 - Classic White Shirt variants (with sleeve types)
      {
        productId: product1.id,
        size: 'S',
        color: 'White',
        sleeveType: 'Short Sleeve',
        stock: 10,
        sku: 'CWS001-S-WHITE-SHORT',
      },
      {
        productId: product1.id,
        size: 'M',
        color: 'White',
        sleeveType: 'Short Sleeve',
        stock: 15,
        sku: 'CWS001-M-WHITE-SHORT',
      },
      {
        productId: product1.id,
        size: 'L',
        color: 'White',
        sleeveType: 'Short Sleeve',
        stock: 12,
        sku: 'CWS001-L-WHITE-SHORT',
      },
      {
        productId: product1.id,
        size: 'XL',
        color: 'White',
        sleeveType: 'Short Sleeve',
        stock: 8,
        sku: 'CWS001-XL-WHITE-SHORT',
      },
      // Full sleeve variants
      {
        productId: product1.id,
        size: 'S',
        color: 'White',
        sleeveType: 'Full Sleeve',
        stock: 8,
        sku: 'CWS001-S-WHITE-FULL',
      },
      {
        productId: product1.id,
        size: 'M',
        color: 'White',
        sleeveType: 'Full Sleeve',
        stock: 12,
        sku: 'CWS001-M-WHITE-FULL',
      },
      {
        productId: product1.id,
        size: 'L',
        color: 'White',
        sleeveType: 'Full Sleeve',
        stock: 10,
        sku: 'CWS001-L-WHITE-FULL',
      },
      {
        productId: product1.id,
        size: 'XL',
        color: 'White',
        sleeveType: 'Full Sleeve',
        stock: 6,
        sku: 'CWS001-XL-WHITE-FULL',
      },
      // Blue color variants
      {
        productId: product1.id,
        size: 'S',
        color: 'Blue',
        sleeveType: 'Short Sleeve',
        stock: 6,
        sku: 'CWS001-S-BLUE-SHORT',
      },
      {
        productId: product1.id,
        size: 'M',
        color: 'Blue',
        sleeveType: 'Short Sleeve',
        stock: 9,
        sku: 'CWS001-M-BLUE-SHORT',
      },
      {
        productId: product1.id,
        size: 'L',
        color: 'Blue',
        sleeveType: 'Full Sleeve',
        stock: 7,
        sku: 'CWS001-L-BLUE-FULL',
      },

      // ========== COMMENTED OUT - OTHER PRODUCT VARIANTS ==========
      /*
      // Product 2 - Premium T-Shirt variants (no sleeve type for t-shirts)
      {
        productId: product2.id,
        size: 'S',
        color: 'Black',
        stock: 15,
        sku: 'PCT001-S-BLACK',
      },
      {
        productId: product2.id,
        size: 'M',
        color: 'Black',
        stock: 20,
        sku: 'PCT001-M-BLACK',
      },
      {
        productId: product2.id,
        size: 'L',
        color: 'Black',
        stock: 18,
        sku: 'PCT001-L-BLACK',
      },
      {
        productId: product2.id,
        size: 'XL',
        color: 'Black',
        stock: 12,
        sku: 'PCT001-XL-BLACK',
      },
      {
        productId: product2.id,
        size: 'S',
        color: 'Navy',
        stock: 12,
        sku: 'PCT001-S-NAVY',
      },
      {
        productId: product2.id,
        size: 'M',
        color: 'Navy',
        stock: 16,
        sku: 'PCT001-M-NAVY',
      },
      {
        productId: product2.id,
        size: 'L',
        color: 'Navy',
        stock: 14,
        sku: 'PCT001-L-NAVY',
      },
      {
        productId: product2.id,
        size: 'S',
        color: 'White',
        stock: 10,
        sku: 'PCT001-S-WHITE',
      },
      {
        productId: product2.id,
        size: 'M',
        color: 'White',
        stock: 14,
        sku: 'PCT001-M-WHITE',
      },
      {
        productId: product2.id,
        size: 'L',
        color: 'White',
        stock: 12,
        sku: 'PCT001-L-WHITE',
      },

      // Product 3 - Formal Black Shirt variants
      {
        productId: product3.id,
        size: 'S',
        color: 'Black',
        sleeveType: 'Full Sleeve',
        stock: 8,
        sku: 'FBS001-S-BLACK-FULL',
      },
      {
        productId: product3.id,
        size: 'M',
        color: 'Black',
        sleeveType: 'Full Sleeve',
        stock: 12,
        sku: 'FBS001-M-BLACK-FULL',
      },
      {
        productId: product3.id,
        size: 'L',
        color: 'Black',
        sleeveType: 'Full Sleeve',
        stock: 10,
        sku: 'FBS001-L-BLACK-FULL',
      },
      {
        productId: product3.id,
        size: 'XL',
        color: 'Black',
        sleeveType: 'Full Sleeve',
        stock: 6,
        sku: 'FBS001-XL-BLACK-FULL',
      },

      // Product 4 - Casual Denim Shirt variants
      {
        productId: product4.id,
        size: 'S',
        color: 'Denim Blue',
        sleeveType: 'Full Sleeve',
        stock: 5,
        sku: 'CDS001-S-DENIM-FULL',
      },
      {
        productId: product4.id,
        size: 'M',
        color: 'Denim Blue',
        sleeveType: 'Full Sleeve',
        stock: 8,
        sku: 'CDS001-M-DENIM-FULL',
      },
      {
        productId: product4.id,
        size: 'L',
        color: 'Denim Blue',
        sleeveType: 'Full Sleeve',
        stock: 6,
        sku: 'CDS001-L-DENIM-FULL',
      },

      // Product 5 - Women's Floral Dress variants
      {
        productId: product5.id,
        size: 'S',
        color: 'Floral Pink',
        stock: 10,
        sku: 'WFD001-S-PINK',
      },
      {
        productId: product5.id,
        size: 'M',
        color: 'Floral Pink',
        stock: 12,
        sku: 'WFD001-M-PINK',
      },
      {
        productId: product5.id,
        size: 'L',
        color: 'Floral Pink',
        stock: 8,
        sku: 'WFD001-L-PINK',
      },
      {
        productId: product5.id,
        size: 'S',
        color: 'Floral Blue',
        stock: 6,
        sku: 'WFD001-S-BLUE',
      },
      {
        productId: product5.id,
        size: 'M',
        color: 'Floral Blue',
        stock: 9,
        sku: 'WFD001-M-BLUE',
      },
      {
        productId: product5.id,
        size: 'L',
        color: 'Floral Blue',
        stock: 7,
        sku: 'WFD001-L-BLUE',
      },
      */
    ],
  });

  console.log('✅ Product variants created');

  console.log('🎉 Seed data created successfully!');
  console.log('📊 Summary:');
  console.log('- Categories: Men, Women');
  console.log('- Subcategories: Shirts, T-Shirts, Pants, Dresses');
  console.log('- Products: 1 product (Classic White Shirt)');
  console.log('- Variants: Multiple size, color, and sleeve options for white shirt');
  console.log('- Images: 4 product images for white shirt');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  });