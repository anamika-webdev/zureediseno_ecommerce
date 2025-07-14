// src/app/api/admin/orders/route.ts - ALTERNATIVE VERSION using separate queries
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check ADMIN authentication
    const user = await getCurrentAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const paymentStatus = searchParams.get('payment_status') || '';

    // Build where clause for filtering
    const where: any = {};
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { shippingName: { contains: search, mode: 'insensitive' } },
        { shippingEmail: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      where.paymentStatus = paymentStatus;
    }

    // Get total count for pagination
    const total = await prisma.order.count({ where });

    // ✅ Fetch orders WITHOUT include (to avoid type issues)
    const orders = await prisma.order.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // ✅ Fetch related data separately
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        // Get order items count
        const itemCount = await prisma.orderItem.count({
          where: { orderId: order.id }
        });

        // Get user details if userId exists
        let customer = null;
        if (order.userId) {
          const user = await prisma.user.findUnique({
            where: { id: order.userId },
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          });
          
          if (user) {
            customer = {
              name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
              email: user.email
            };
          }
        }

        return {
          id: order.id,
          order_number: order.orderNumber,
          user_id: order.userId,
          total_amount: order.totalAmount,
          status: order.status,
          payment_status: order.paymentStatus,
          payment_method: order.paymentMethod,
          shipping_name: order.shippingName,
          shipping_email: order.shippingEmail,
          shipping_phone: order.shippingPhone,
          shipping_address: order.shippingAddress,
          shipping_city: order.shippingCity,
          shipping_state: order.shippingState,
          shipping_pincode: order.shippingPincode,
          shipping_country: order.shippingCountry,
          created_at: order.createdAt.toISOString(),
          updated_at: order.updatedAt.toISOString(),
          item_count: itemCount,
          customer: customer
        };
      })
    );

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      orders: ordersWithDetails,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch orders',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}