// src/components/seo/StructuredData.tsx
import React from 'react';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  images?: Array<{ url: string }>;
  sku?: string;
  slug: string;
  inStock: boolean;
  category?: {
    name: string;
  };
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

// Product Structured Data
export function ProductStructuredData({ product }: { product: Product }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} available at Zuree Diseno`,
    image: product.images?.[0]?.url || '/default-product.jpg',
    sku: product.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: 'Zuree Diseno',
    },
    offers: {
      '@type': 'Offer',
      url: `https://zureediseno.com/products/${product.slug}`,
      priceCurrency: 'INR',
      price: product.price.toString(),
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: product.inStock 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Zuree Diseno',
      },
    },
    ...(product.originalPrice && product.originalPrice > product.price && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.5',
        reviewCount: '10',
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// Organization Structured Data (for homepage)
export function OrganizationStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Zuree Diseno',
    url: 'https://zureediseno.com',
    logo: 'https://zureediseno.com/logo.png',
    description: 'Premium fashion and custom tailored clothing for men, women, and kids',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
      addressLocality: 'Lucknow',
      addressRegion: 'Uttar Pradesh',
      postalCode: '226001',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-XXX-XXX-XXXX', // Add your actual phone
      contactType: 'Customer Service',
      email: 'support@zureediseno.com', // Add your actual email
      availableLanguage: ['English', 'Hindi'],
    },
    sameAs: [
      'https://facebook.com/zureediseno',
      'https://instagram.com/zureediseno',
      'https://twitter.com/zureediseno',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// Breadcrumb Structured Data
export function BreadcrumbStructuredData({ items }: { items: BreadcrumbItem[] }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://zureediseno.com${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// WebSite Structured Data (for homepage)
export function WebSiteStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Zuree Diseno',
    url: 'https://zureediseno.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://zureediseno.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// E-commerce Store Structured Data
export function StoreStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'Zuree Diseno',
    image: 'https://zureediseno.com/store-image.jpg',
    '@id': 'https://zureediseno.com',
    url: 'https://zureediseno.com',
    telephone: '+91-XXX-XXX-XXXX',
    priceRange: '₹₹',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Your Street Address',
      addressLocality: 'Lucknow',
      addressRegion: 'UP',
      postalCode: '226001',
      addressCountry: 'IN',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ],
        opens: '10:00',
        closes: '20:00',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}