// src/app/api/admin/orders/[id]/status/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentAdmin();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { status, paymentStatus, trackingNumber, notes } = body;

    // Validate status values
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 });
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };

    if (status !== undefined) updateData.status = status;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (notes !== undefined) updateData.notes = notes;

    // Update order WITHOUT include to avoid TypeScript issues
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData
    });

    // Get item count separately
    const itemCount = await prisma.orderItem.count({
      where: { orderId: id }
    });

    // Get user details separately if needed
    let customer = null;
    if (updatedOrder.userId) {
      const user = await prisma.user.findUnique({
        where: { id: updatedOrder.userId },
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

    // Transform response
    const transformedOrder = {
      id: updatedOrder.id,
      order_number: updatedOrder.orderNumber,
      user_id: updatedOrder.userId,
      total_amount: updatedOrder.totalAmount,
      status: updatedOrder.status,
      payment_status: updatedOrder.paymentStatus,
      payment_method: updatedOrder.paymentMethod,
      tracking_number: updatedOrder.trackingNumber,
      notes: updatedOrder.notes,
      shipping_name: updatedOrder.shippingName,
      shipping_email: updatedOrder.shippingEmail,
      shipping_phone: updatedOrder.shippingPhone,
      shipping_address: updatedOrder.shippingAddress,
      shipping_city: updatedOrder.shippingCity,
      shipping_state: updatedOrder.shippingState,
      shipping_pincode: updatedOrder.shippingPincode,
      shipping_country: updatedOrder.shippingCountry,
      created_at: updatedOrder.createdAt.toISOString(),
      updated_at: updatedOrder.updatedAt.toISOString(),
      item_count: itemCount,
      customer: customer
    };

    // Send email notification if status changed significantly
    if (status && status !== existingOrder.status) {
      await sendOrderStatusEmail(existingOrder, updatedOrder, status);
    }

    return NextResponse.json({
      success: true,
      order: transformedOrder,
      message: 'Order status updated successfully'
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update order status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Email notification function
async function sendOrderStatusEmail(oldOrder: any, newOrder: any, newStatus: string) {
  try {
    // Only send emails for significant status changes
    const significantStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!significantStatuses.includes(newStatus)) {
      return;
    }

    const customerEmail = newOrder.user?.email || oldOrder.shippingEmail;
    const customerName = newOrder.user ? 
      `${newOrder.user.firstName || ''} ${newOrder.user.lastName || ''}`.trim() : 
      oldOrder.shippingName;

    if (!customerEmail) {
      console.log('No customer email found for order:', newOrder.id);
      return;
    }

    // Call email service API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-status-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerEmail,
        customerName,
        orderNumber: newOrder.orderNumber,
        status: newStatus,
        trackingNumber: newOrder.trackingNumber,
        estimatedDelivery: getEstimatedDelivery(newStatus)
      }),
    });

    if (!response.ok) {
      console.error('Failed to send status email:', await response.text());
    } else {
      console.log(`Status email sent to ${customerEmail} for order ${newOrder.orderNumber}`);
    }

  } catch (error) {
    console.error('Error sending order status email:', error);
  }
}

function getEstimatedDelivery(status: string): string {
  const today = new Date();
  let days = 0;

  switch (status) {
    case 'processing':
      days = 3;
      break;
    case 'shipped':
      days = 2;
      break;
    case 'delivered':
      return 'Delivered';
    default:
      days = 5;
  }

  const estimatedDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
  return estimatedDate.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
}