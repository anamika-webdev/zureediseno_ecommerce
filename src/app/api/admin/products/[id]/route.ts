// src/app/api/admin/products/[id]/route.ts - DEBUG VERSION
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/adminAuth'; // ✅ CORRECT IMPORT
import { prisma } from '@/lib/prisma';

interface PrismaError extends Error {
  code?: string;
  meta?: any;
}

// DELETE product - DEBUG VERSION
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('🗑️ DELETE request received');
  
  try {
    const { id } = await params;
    console.log('📦 Product ID to delete:', id);
    
    // ✅ FIXED: Use getCurrentAdmin instead of getCurrentUser
    console.log('🔐 Checking admin authentication...');
    const user = await getCurrentAdmin();
    
    if (!user) {
      console.log('❌ No admin user found - unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('✅ Admin authenticated:', user.email, 'Role:', user.role);

    if (!user.isAdmin) {
      console.log('❌ User is not admin');
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    console.log('🔍 Checking if product exists...');

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orderItems: true
          }
        }
      }
    });

    if (!existingProduct) {
      console.log('❌ Product not found:', id);
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    console.log('📊 Product found:', existingProduct.name);
    console.log('📊 Order items count:', existingProduct._count.orderItems);

    // Check if product has orders (business logic - optional)
    if (existingProduct._count.orderItems > 0) {
      console.log('❌ Cannot delete - product has orders');
      return NextResponse.json(
        { 
          error: `Cannot delete product with ${existingProduct._count.orderItems} orders. Consider marking it as out of stock instead.` 
        },
        { status: 400 }
      );
    }

    console.log('🗑️ Starting deletion transaction...');

    // Delete product and all related data in a transaction
    await prisma.$transaction(async (tx) => {
      console.log('🖼️ Deleting product images...');
      await tx.productImage.deleteMany({
        where: { productId: id }
      });

      console.log('🎯 Deleting product variants...');
      await tx.productVariant.deleteMany({
        where: { productId: id }
      });

      console.log('🗑️ Deleting product...');
      await tx.product.delete({
        where: { id }
      });
    });

    console.log('✅ Product deleted successfully:', id);

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting product:', error);
    
    const prismaError = error as PrismaError;
    console.error('🔍 Prisma error code:', prismaError.code);
    console.error('🔍 Prisma error meta:', prismaError.meta);
    
    if (prismaError.code === 'P2025') {
      console.log('❌ Prisma: Record not found');
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    if (prismaError.code === 'P2003') {
      console.log('❌ Prisma: Foreign key constraint');
      return NextResponse.json(
        { error: 'Cannot delete product: it has associated orders or other dependencies' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to delete product',
        details: error instanceof Error ? error.message : 'Unknown error',
        code: prismaError.code || 'UNKNOWN'
      },
      { status: 500 }
    );
  }
}

// Also include PUT method for completeness
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentAdmin(); // ✅ FIXED
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const productData = await request.json();
    
    console.log('🔄 Updating product:', id);

    // Validate required fields
    if (!productData.name || !productData.categoryId) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      );
    }

    // Generate slug if name changed
    const slug = productData.slug || productData.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Update product and handle images/variants in a transaction
    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Update main product data
      const product = await tx.product.update({
        where: { id },
        data: {
          name: productData.name,
          slug: slug,
          description: productData.description || null,
          price: parseFloat(productData.price.toString()),
          originalPrice: productData.originalPrice ? 
            parseFloat(productData.originalPrice.toString()) : null,
          sku: productData.sku || null,
          categoryId: productData.categoryId,
          subcategoryId: productData.subcategoryId || null,
          inStock: productData.inStock !== false,
          featured: productData.featured || false,
          sortOrder: productData.sortOrder || 0,
          updatedAt: new Date()
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
              alt: typeof image === 'string' ? 
                `${productData.name} image ${index + 1}` : 
                (image.alt || `${productData.name} image ${index + 1}`),
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

        // Filter and create new variants
        const validVariants = productData.variants.filter((variant: any) => 
          variant.size && variant.color && variant.stock >= 0
        );

        if (validVariants.length > 0) {
          await tx.productVariant.createMany({
            data: validVariants.map((variant: any) => ({
              productId: id,
              size: variant.size,
              color: variant.color,
              stock: parseInt(variant.stock.toString()) || 0,
              sleeveType: variant.sleeveType || null,
              sku: variant.sku || null
            }))
          });
        }
      }

      return product;
    });

    // Fetch complete product data
    const completeProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { isPrimary: 'desc' }
        },
        variants: {
          orderBy: { createdAt: 'asc' }
        },
        category: true,
        subcategory: true
      }
    });

    console.log('✅ Product updated successfully:', id);

    return NextResponse.json({
      success: true,
      product: completeProduct,
      message: 'Product updated successfully'
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