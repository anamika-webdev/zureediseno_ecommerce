// src/app/api/products/auto-update/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const includeVariants = searchParams.get('includeVariants') === 'true';
    const includeImages = searchParams.get('includeImages') === 'true';

    // If specific product ID is provided, fetch that product
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          category: {
            select: { id: true, name: true, slug: true }
          },
          subcategory: {
            select: { id: true, name: true, slug: true }
          },
          images: includeImages ? {
            orderBy: { isPrimary: 'desc' }
          } : false,
          variants: includeVariants ? {
            orderBy: [{ size: 'asc' }, { color: 'asc' }]
          } : false
        }
      });

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        product: transformProduct(product)
      });
    }

    // Fetch all products with auto-update information
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        subcategory: {
          select: { id: true, name: true, slug: true }
        },
        images: includeImages ? {
          orderBy: { isPrimary: 'desc' }
        } : false,
        variants: includeVariants ? {
          orderBy: [{ size: 'asc' }, { color: 'asc' }]
        } : false,
        _count: {
          select: {
            variants: true,
            images: true
          }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { updatedAt: 'desc' }
      ]
    });

    const transformedProducts = products.map(transformProduct);

    return NextResponse.json({
      success: true,
      products: transformedProducts,
      count: products.length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in auto-update API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productIds, updateFields } = body;

    if (!productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { error: 'Product IDs array is required' },
        { status: 400 }
      );
    }

    const results = [];

    for (const productId of productIds) {
      try {
        // Fetch fresh product data
        const product = await prisma.product.findUnique({
          where: { id: productId },
          include: {
            category: true,
            subcategory: true,
            images: true,
            variants: true
          }
        });

        if (!product) {
          results.push({
            productId,
            success: false,
            error: 'Product not found'
          });
          continue;
        }

        // Auto-calculate fields that might need updating
        const updates: any = {};

        // Update in-stock status based on variants
        if (updateFields?.includes('inStock')) {
          const totalStock = (product.variants || []).reduce((sum, variant) => sum + (variant.stock || 0), 0);
          updates.inStock = totalStock > 0;
        }

        // Update featured status based on business logic
        if (updateFields?.includes('featured')) {
          // Example: Auto-feature products with high stock and recent updates
          const totalStock = (product.variants || []).reduce((sum, variant) => sum + (variant.stock || 0), 0);
          const isRecent = (Date.now() - new Date(product.updatedAt).getTime()) < (7 * 24 * 60 * 60 * 1000); // 7 days
          updates.featured = totalStock > 50 && isRecent;
        }

        // Update prices based on business rules
        if (updateFields?.includes('pricing')) {
          // Example: Auto-apply discounts based on stock levels
          const totalStock = (product.variants || []).reduce((sum, variant) => sum + (variant.stock || 0), 0);
          if (totalStock > 100) {
            // High stock - no discount needed
            updates.originalPrice = null;
          } else if (totalStock < 10) {
            // Low stock - remove any existing discounts
            updates.originalPrice = null;
          }
        }

        // Update SKU if needed
        if (updateFields?.includes('sku')) {
          if (!product.sku) {
            updates.sku = generateSKU(product);
          }
        }

        // Auto-update product description based on variants
        if (updateFields?.includes('description')) {
          const variants = product.variants || [];
          const colors = [...new Set(variants.map(v => v.color))];
          const sizes = [...new Set(variants.map(v => v.size))];
          const sleeveTypes = [...new Set(variants.map(v => v.sleeveType).filter(Boolean))];
          
          let autoDescription = product.description || '';
          
          if (colors.length > 1) {
            autoDescription += ` Available in ${colors.length} colors: ${colors.join(', ')}.`;
          }
          
          if (sizes.length > 1) {
            autoDescription += ` Sizes available: ${sizes.join(', ')}.`;
          }
          
          if (sleeveTypes.length > 1) {
            autoDescription += ` Available in: ${sleeveTypes.join(' and ')}.`;
          }
          
          updates.description = autoDescription.trim();
        }

        // Only update if there are changes
        if (Object.keys(updates).length > 0) {
          await prisma.product.update({
            where: { id: productId },
            data: {
              ...updates,
              updatedAt: new Date()
            }
          });
        }

        results.push({
          productId,
          success: true,
          updatedFields: Object.keys(updates),
          updates
        });

      } catch (error) {
        results.push({
          productId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      totalProcessed: productIds.length,
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length
    });

  } catch (error) {
    console.error('Error in bulk update:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT endpoint for updating specific product auto-update rules
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      productId, 
      autoUpdateRules = {},
      forceUpdate = false 
    } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: true,
        images: true,
        category: true,
        subcategory: true
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const updates: any = {};

    // Apply auto-update rules
    if (autoUpdateRules.stockBasedPricing || forceUpdate) {
      const totalStock = (product.variants || []).reduce((sum, variant) => sum + (variant.stock || 0), 0);
      
      if (totalStock < 5) {
        // Low stock - increase price or remove discount
        if (product.originalPrice) {
          updates.price = product.originalPrice;
          updates.originalPrice = null;
        }
      } else if (totalStock > 50) {
        // High stock - apply discount
        if (!product.originalPrice) {
          updates.originalPrice = product.price;
          updates.price = Number((product.price * 0.9).toFixed(2)); // 10% discount
        }
      }
    }

    if (autoUpdateRules.autoFeature || forceUpdate) {
      const totalStock = (product.variants || []).reduce((sum, variant) => sum + (variant.stock || 0), 0);
      const variantCount = product.variants?.length || 0;
      const hasImages = (product.images?.length || 0) > 0;
      
      // Auto-feature logic: good stock + multiple variants + has images
      updates.featured = totalStock > 20 && variantCount >= 3 && hasImages;
    }

    if (autoUpdateRules.stockStatus || forceUpdate) {
      const totalStock = (product.variants || []).reduce((sum, variant) => sum + (variant.stock || 0), 0);
      updates.inStock = totalStock > 0;
    }

    if (autoUpdateRules.autoSKU || forceUpdate) {
      if (!product.sku) {
        updates.sku = generateSKU(product);
      }
    }

    if (Object.keys(updates).length > 0) {
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          ...updates,
          updatedAt: new Date()
        },
        include: {
          category: true,
          subcategory: true,
          images: true,
          variants: true
        }
      });

      return NextResponse.json({
        success: true,
        product: transformProduct(updatedProduct),
        appliedUpdates: updates,
        message: 'Product auto-updated successfully'
      });
    }

    return NextResponse.json({
      success: true,
      product: transformProduct(product),
      appliedUpdates: {},
      message: 'No updates needed'
    });

  } catch (error) {
    console.error('Error in product auto-update:', error);
    return NextResponse.json(
      { 
        error: 'Failed to auto-update product',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to transform product data
function transformProduct(product: any) {
  const variants = product.variants || [];
  const images = product.images || [];
  
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    originalPrice: product.originalPrice,
    sku: product.sku,
    inStock: product.inStock,
    featured: product.featured,
    rating: calculateRating(product),
    reviewCount: getReviewCount(product),
    images: images,
    variants: variants,
    category: product.category,
    subcategory: product.subcategory,
    totalStock: variants.reduce((sum: number, variant: any) => sum + (variant.stock || 0), 0),
    availableColors: [...new Set(variants.map((v: any) => v.color).filter(Boolean))],
    availableSizes: [...new Set(variants.map((v: any) => v.size).filter(Boolean))],
    availableSleeveTypes: [...new Set(variants.map((v: any) => v.sleeveType).filter(Boolean))],
    stockLevel: getStockLevel(variants),
    discountPercentage: getDiscountPercentage(product.price, product.originalPrice),
    autoUpdateStatus: {
      lastUpdated: product.updatedAt,
      needsUpdate: checkIfNeedsUpdate(product),
      suggestions: getUpdateSuggestions(product)
    },
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    _count: product._count
  };
}

// Helper function to calculate rating (implement based on your review system)
function calculateRating(product: any): number {
  // Placeholder - implement based on your review/rating system
  let rating = 4.0;
  
  if (product.featured) rating = rating + 0.3;
  
  const variantCount = product.variants?.length || 0;
  if (variantCount > 5) rating = rating + 0.2;
  
  const originalPrice = Number(product.originalPrice) || 0;
  const currentPrice = Number(product.price) || 0;
  if (originalPrice > 0 && currentPrice > 0 && originalPrice > currentPrice) {
    rating = rating + 0.1;
  }
  
  return Math.min(5.0, Number(rating.toFixed(1)));
}

// Helper function to get review count (implement based on your review system)
function getReviewCount(product: any): number {
  // Placeholder - implement based on your review system
  const daysSinceCreated = product.createdAt ? 
    Math.floor((Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  
  let baseCount = Math.floor(daysSinceCreated / 7) * 2; // 2 reviews per week
  if (product.featured) baseCount *= 2;
  
  return Math.max(0, baseCount + Math.floor(Math.random() * 20));
}

// Helper function to generate SKU
function generateSKU(product: any): string {
  const categoryCode = product.category?.name?.substring(0, 2).toUpperCase() || 'PR';
  const nameCode = product.name?.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() || 'PROD';
  const timestamp = Date.now().toString().slice(-6);
  
  return `${categoryCode}-${nameCode}-${timestamp}`;
}

// Helper function to get stock level
function getStockLevel(variants: any[]): 'high' | 'medium' | 'low' | 'out' {
  const totalStock = variants?.reduce((sum, variant) => sum + (variant.stock || 0), 0) || 0;
  
  if (totalStock === 0) return 'out';
  if (totalStock < 10) return 'low';
  if (totalStock < 50) return 'medium';
  return 'high';
}

// Helper function to get discount percentage - FIXED VERSION
function getDiscountPercentage(currentPrice: number, originalPrice?: number | null): number {
  // Convert to numbers and validate
  const current = Number(currentPrice);
  const original = originalPrice ? Number(originalPrice) : null;
  
  // Check if we have valid numbers and if there's actually a discount
  if (!original || isNaN(current) || isNaN(original) || original <= 0 || original <= current) {
    return 0;
  }
  
  // Calculate discount percentage
  return Math.round(((original - current) / original) * 100);
}

// Helper function to check if product needs update
function checkIfNeedsUpdate(product: any): boolean {
  const variants = product.variants || [];
  const totalStock = variants.reduce((sum: number, variant: any) => sum + (variant.stock || 0), 0);
  const hasVariants = variants.length > 0;
  const hasImages = (product.images?.length || 0) > 0;
  const hasSKU = !!product.sku;
  
  // Needs update if: no stock but marked as inStock, no SKU, inconsistent data
  return (
    (totalStock === 0 && product.inStock) ||
    !hasSKU ||
    !hasVariants ||
    !hasImages ||
    !product.description
  );
}

// Helper function to get update suggestions
function getUpdateSuggestions(product: any): string[] {
  const suggestions: string[] = [];
  const variants = product.variants || [];
  const totalStock = variants.reduce((sum: number, variant: any) => sum + (variant.stock || 0), 0);
  
  if (totalStock === 0 && product.inStock) {
    suggestions.push('Update inStock status - no variants have stock');
  }
  
  if (!product.sku) {
    suggestions.push('Generate SKU for better inventory management');
  }
  
  if (!product.description || product.description.length < 50) {
    suggestions.push('Add or improve product description');
  }
  
  if (variants.length === 0) {
    suggestions.push('Add product variants (size, color, etc.)');
  }
  
  if ((product.images?.length || 0) === 0) {
    suggestions.push('Add product images');
  }
  
  if (totalStock > 100 && !product.originalPrice) {
    suggestions.push('Consider adding discount for high-stock items');
  }
  
  if (totalStock < 5 && product.originalPrice) {
    suggestions.push('Consider removing discount for low-stock items');
  }
  
  if (totalStock > 50 && variants.length >= 5 && !product.featured) {
    suggestions.push('Consider featuring this well-stocked product');
  }
  
  return suggestions;
}