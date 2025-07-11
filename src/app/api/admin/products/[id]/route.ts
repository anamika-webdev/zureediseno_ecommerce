// src/app/api/admin/products/[id]/route.ts - Individual product operations
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { isPrimary: 'desc' }
        },
        variants: {
          orderBy: [{ size: 'asc' }, { color: 'asc' }]
        },
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

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price),
        originalPrice: product.originalPrice ? 
          (typeof product.originalPrice === 'string' ? parseFloat(product.originalPrice) : Number(product.originalPrice)) 
          : null,
        sku: product.sku,
        inStock: product.inStock,
        featured: product.featured,
        sortOrder: product.sortOrder || 0,
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId,
        images: product.images,
        variants: product.variants,
        category: product.category,
        subcategory: product.subcategory,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const productData = await request.json();
    
    console.log('🔄 Updating product:', id);

    // Generate slug if name changed
    const slug = productData.slug || productData.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Update product and handle images/variants
    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Update main product data
      const product = await tx.product.update({
        where: { id },
        data: {
          name: productData.name,
          slug: slug,
          description: productData.description || null,
          price: productData.price,
          originalPrice: productData.originalPrice || null,
          sku: productData.sku || null,
          categoryId: productData.categoryId,
          subcategoryId: productData.subcategoryId || null,
          inStock: productData.inStock !== false,
          featured: productData.featured || false,
          sortOrder: productData.sortOrder || 0
        }
      });

      // Handle images update
      if (productData.images && Array.isArray(productData.images)) {
        // Delete existing images
        await tx.productImage.deleteMany({
          where: { productId: id }
        });

        // Create new images
        if (productData.images.length > 0) {
          await tx.productImage.createMany({
            data: productData.images.map((image: any, index: number) => ({
              productId: id,
              url: typeof image === 'string' ? image : image.url,
              alt: typeof image === 'string' ? productData.name : (image.alt || productData.name),
              isPrimary: index === 0
            }))
          });
        }
      }

      // Handle variants update
      if (productData.variants && Array.isArray(productData.variants)) {
        // Delete existing variants
        await tx.productVariant.deleteMany({
          where: { productId: id }
        });

        // Create new variants
        const validVariants = productData.variants.filter((variant: any) => 
          variant.size || variant.color || variant.stock > 0
        );

        if (validVariants.length > 0) {
          await tx.productVariant.createMany({
            data: validVariants.map((variant: any) => ({
              productId: id,
              size: variant.size || '',
              color: variant.color || '',
              stock: variant.stock || 0,
              sleeveType: variant.sleeveType || null,
              sku: variant.sku || null
            }))
          });
        }
      }

      // Return updated product with relations
      return await tx.product.findUnique({
        where: { id },
        include: {
          images: true,
          variants: true,
          category: true,
          subcategory: true
        }
      });
    });

    console.log('✅ Product updated successfully:', id);

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });

  } catch (error) {
    console.error('❌ Error updating product:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update product',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    console.log('🗑️ Deleting product:', id);

    // Delete product (images and variants will be deleted by cascade)
    await prisma.product.delete({
      where: { id }
    });

    console.log('✅ Product deleted successfully:', id);

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting product:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to delete product',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}