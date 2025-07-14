// src/app/api/track-order/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { orderNumber, email } = await request.json();

    if (!orderNumber || !email) {
      return NextResponse.json(
        { error: 'Order number and email are required' },
        { status: 400 }
      );
    }

    // Find order by order number and email WITHOUT include to avoid TypeScript issues
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: orderNumber.trim(),
        OR: [
          { shippingEmail: email.toLowerCase().trim() },
          { 
            user: {
              email: email.toLowerCase().trim()
            }
          }
        ]
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found. Please check your order number and email address.' },
        { status: 404 }
      );
    }

    // Get order items separately
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: order.id },
      select: {
        id: true,
        productName: true,
        quantity: true,
        price: true,
        size: true,
        color: true,
        imageUrl: true
      }
    });

    // Get user details separately if userId exists
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

    // If no user found, use shipping details
    if (!customer) {
      customer = {
        name: order.shippingName,
        email: order.shippingEmail
      };
    }

    // Transform order data for tracking
    const trackingData = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      totalAmount: order.totalAmount,
      trackingNumber: order.trackingNumber,
      notes: order.notes,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      
      // Shipping information
      shipping: {
        name: order.shippingName,
        email: order.shippingEmail,
        phone: order.shippingPhone,
        address: order.shippingAddress,
        city: order.shippingCity,
        state: order.shippingState,
        pincode: order.shippingPincode,
        country: order.shippingCountry
      },

      // Order items
      items: orderItems.map(item => ({
        id: item.id,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color,
        imageUrl: item.imageUrl,
        total: item.quantity * item.price
      })),

      // Customer info
      customer: customer,

      // Tracking timeline
      timeline: generateTrackingTimeline(order.status, order.createdAt, order.updatedAt),
      
      // Estimated delivery
      estimatedDelivery: getEstimatedDelivery(order.status, order.createdAt),
      
      // Status display
      statusDisplay: getStatusDisplay(order.status, order.paymentStatus)
    };

    return NextResponse.json({
      success: true,
      order: trackingData
    });

  } catch (error) {
    console.error('Error tracking order:', error);
    return NextResponse.json(
      { error: 'Failed to track order. Please try again.' },
      { status: 500 }
    );
  }
}

// Generate tracking timeline based on order status
function generateTrackingTimeline(status: string, createdAt: Date, updatedAt: Date) {
  const timeline = [
    {
      status: 'pending',
      label: 'Order Placed',
      description: 'Your order has been received and is being processed',
      date: createdAt.toISOString(),
      completed: true,
      icon: '📋'
    }
  ];

  const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
  const currentIndex = statusOrder.indexOf(status);

  if (currentIndex >= 1 || status === 'processing') {
    timeline.push({
      status: 'processing',
      label: 'Processing',
      description: 'Your order is being prepared for shipment',
      date: status === 'processing' ? updatedAt.toISOString() : '',
      completed: currentIndex >= 1,
      icon: '📦'
    });
  }

  if (currentIndex >= 2 || status === 'shipped') {
    timeline.push({
      status: 'shipped',
      label: 'Shipped',
      description: 'Your order has been dispatched and is on its way',
      date: status === 'shipped' ? updatedAt.toISOString() : '',
      completed: currentIndex >= 2,
      icon: '🚚'
    });
  }

  if (currentIndex >= 3 || status === 'delivered') {
    timeline.push({
      status: 'delivered',
      label: 'Delivered',
      description: 'Your order has been successfully delivered',
      date: status === 'delivered' ? updatedAt.toISOString() : '',
      completed: currentIndex >= 3,
      icon: '✅'
    });
  }

  // Handle special statuses
  if (status === 'cancelled') {
    timeline.push({
      status: 'cancelled',
      label: 'Cancelled',
      description: 'Your order has been cancelled',
      date: updatedAt.toISOString(),
      completed: true,
      icon: '❌'
    });
  }

  if (status === 'returned') {
    timeline.push({
      status: 'returned',
      label: 'Returned',
      description: 'Your order has been returned',
      date: updatedAt.toISOString(),
      completed: true,
      icon: '↩️'
    });
  }

  return timeline;
}

// Get estimated delivery date
function getEstimatedDelivery(status: string, createdAt: Date): string {
  if (status === 'delivered') return 'Delivered';
  if (status === 'cancelled' || status === 'returned') return 'N/A';

  const orderDate = new Date(createdAt);
  let estimatedDays = 5; // Default 5 days

  switch (status) {
    case 'pending':
      estimatedDays = 5;
      break;
    case 'processing':
      estimatedDays = 3;
      break;
    case 'shipped':
      estimatedDays = 2;
      break;
  }

  const estimatedDate = new Date(orderDate.getTime() + estimatedDays * 24 * 60 * 60 * 1000);
  return estimatedDate.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
}

// Get status display information
function getStatusDisplay(orderStatus: string, paymentStatus: string) {
  const statusDisplayMap: Record<string, any> = {
    pending: {
      label: 'Order Placed',
      color: 'blue',
      description: 'Your order is being processed'
    },
    processing: {
      label: 'Processing',
      color: 'yellow',
      description: 'Your order is being prepared'
    },
    shipped: {
      label: 'Shipped',
      color: 'purple',
      description: 'Your order is on its way'
    },
    delivered: {
      label: 'Delivered',
      color: 'green',
      description: 'Your order has been delivered'
    },
    cancelled: {
      label: 'Cancelled',
      color: 'red',
      description: 'Your order has been cancelled'
    },
    returned: {
      label: 'Returned',
      color: 'gray',
      description: 'Your order has been returned'
    }
  };

  const paymentDisplayMap: Record<string, any> = {
    pending: { label: 'Payment Pending', color: 'yellow' },
    paid: { label: 'Payment Completed', color: 'green' },
    failed: { label: 'Payment Failed', color: 'red' },
    refunded: { label: 'Payment Refunded', color: 'blue' }
  };

  return {
    order: statusDisplayMap[orderStatus] || statusDisplayMap.pending,
    payment: paymentDisplayMap[paymentStatus] || paymentDisplayMap.pending
  };
}