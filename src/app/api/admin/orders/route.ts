// app/api/admin/orders/route.ts - Fixed version with correct imports and functions
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Notification functions - will be implemented in SSE server
async function notifyOrderUpdate(orderId: string, orderData: any) {
  // This will be implemented when you set up the SSE server
  // For now, we'll just log it
  console.log('Order updated:', orderId, orderData);
}

async function notifyNewOrder(orderData: any) {
  // This will be implemented when you set up the SSE server
  // For now, we'll just log it
  console.log('New order created:', orderData);
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
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

    // Fetch orders with order items count
    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: {
          select: {
            id: true,
            quantity: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Transform data to match expected format
    const transformedOrders = orders.map(order => ({
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
      item_count: order.orderItems.reduce((sum, item) => sum + item.quantity, 0),
      customer: order.user ? {
        name: `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim(),
        email: order.user.email
      } : null
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      orders: transformedOrders,
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
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const orderData = await request.json();

    // Create new order
    const newOrder = await prisma.order.create({
      data: {
        orderNumber: `ORD-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
        userId: orderData.userId,
        totalAmount: orderData.totalAmount,
        status: orderData.status || 'pending',
        paymentStatus: orderData.paymentStatus || 'pending',
        paymentMethod: orderData.paymentMethod || 'cod',
        shippingName: orderData.shippingName,
        shippingEmail: orderData.shippingEmail,
        shippingPhone: orderData.shippingPhone,
        shippingAddress: orderData.shippingAddress,
        shippingCity: orderData.shippingCity,
        shippingState: orderData.shippingState,
        shippingPincode: orderData.shippingPincode,
        shippingCountry: orderData.shippingCountry || 'India',
        guestOrder: !orderData.userId
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Transform for response
    const transformedOrder = {
      id: newOrder.id,
      order_number: newOrder.orderNumber,
      user_id: newOrder.userId,
      total_amount: newOrder.totalAmount,
      status: newOrder.status,
      payment_status: newOrder.paymentStatus,
      payment_method: newOrder.paymentMethod,
      shipping_name: newOrder.shippingName,
      shipping_email: newOrder.shippingEmail,
      shipping_phone: newOrder.shippingPhone,
      shipping_address: newOrder.shippingAddress,
      shipping_city: newOrder.shippingCity,
      shipping_state: newOrder.shippingState,
      shipping_pincode: newOrder.shippingPincode,
      shipping_country: newOrder.shippingCountry,
      created_at: newOrder.createdAt.toISOString(),
      updated_at: newOrder.updatedAt.toISOString(),
      item_count: 0
    };

    // Notify real-time subscribers about new order
    await notifyNewOrder(transformedOrder);

    return NextResponse.json({
      success: true,
      order: transformedOrder,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}