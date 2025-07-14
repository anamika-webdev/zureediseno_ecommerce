// src/app/api/admin/orders/[id]/items/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentAdmin();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const orderId = id;
    
    // Fetch order items separately to avoid TypeScript issues
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: orderId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: {
              where: { isPrimary: true },
              select: { url: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Transform to expected format
    const transformedItems = orderItems.map(item => ({
      id: item.id,
      product_name: item.productName,
      product_slug: item.productSlug,
      quantity: item.quantity,
      price: item.price,
      size: item.size,
      color: item.color,
      image_url: item.imageUrl || (item.product?.images[0]?.url),
      total: item.quantity * item.price,
      product: item.product
    }));

    return NextResponse.json({
      success: true,
      items: transformedItems
    });

  } catch (error) {
    console.error('Error fetching order items:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}