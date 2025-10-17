// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://zureediseno.com'; // Change to your actual domain

  try {
    // Get all products
    const products = await prisma.product.findMany({
      where: {
        inStock: true, // Only include products in stock
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    // Get all categories
    const categories = await prisma.category.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    // Get all subcategories
    const subcategories = await prisma.subcategory.findMany({
      select: {
        slug: true,
        updatedAt: true,
        category: {
          select: {
            slug: true,
          },
        },
      },
    });

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/shop`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/tailoredoutfit`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/bulk-order`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/track-order`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
    ];

    // Product pages
    const productPages: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // Category pages
    const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/shop?category=${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: 'daily',
      priority: 0.7,
    }));

    // Subcategory pages
    const subcategoryPages: MetadataRoute.Sitemap = subcategories.map((subcategory) => ({
      url: `${baseUrl}/shop?category=${subcategory.category.slug}&subcategory=${subcategory.slug}`,
      lastModified: subcategory.updatedAt,
      changeFrequency: 'daily',
      priority: 0.6,
    }));

    return [
      ...staticPages,
      ...productPages,
      ...categoryPages,
      ...subcategoryPages,
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return at least static pages if database query fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/shop`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
    ];
  }
}