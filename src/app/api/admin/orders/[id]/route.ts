// app/api/admin/orders/[id]/route.ts - Enhanced with real-time notifications
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyOrderUpdate } from '@/app/api/ws/admin/route';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get order with all related data
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
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
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Transform to expected format
    const transformedOrder = {
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
      tracking_number: order.trackingNumber,
      notes: order.notes,
      created_at: order.createdAt.toISOString(),
      updated_at: order.updatedAt.toISOString(),
      items: order.orderItems.map(item => ({
        id: item.id,
        product_name: item.productName,
        product_slug: item.productSlug,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color,
        image_url: item.imageUrl || (item.product?.images[0]?.url),
        product: item.product
      })),
      customer: order.user ? {
        name: `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim(),
        email: order.user.email
      } : null
    };

    return NextResponse.json({
      success: true,
      order: transformedOrder
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const updateData = await request.json();

    // Build update object with only allowed fields
    const allowedFields = ['status', 'paymentStatus', 'trackingNumber', 'notes', 'paymentMethod'];
    const updateFields: any = {};

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        switch (key) {
          case 'paymentStatus':
            updateFields.paymentStatus = updateData[key];
            break;
          case 'trackingNumber':
            updateFields.trackingNumber = updateData[key];
            break;
          case 'paymentMethod':
            updateFields.paymentMethod = updateData[key];
            break;
          default:
            updateFields[key] = updateData[key];
        }
      }
    });

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...updateFields,
        updatedAt: new Date()
      },
      include: {
        orderItems: {
          select: {
            id: true,
            quantity: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Transform for response and real-time notification
    const transformedOrder = {
      id: updatedOrder.id,
      order_number: updatedOrder.orderNumber,
      user_id: updatedOrder.userId,
      total_amount: updatedOrder.totalAmount,
      status: updatedOrder.status,
      payment_status: updatedOrder.paymentStatus,
      payment_method: updatedOrder.paymentMethod,
      shipping_name: updatedOrder.shippingName,
      shipping_email: updatedOrder.shippingEmail,
      shipping_phone: updatedOrder.shippingPhone,
      shipping_address: updatedOrder.shippingAddress,
      shipping_city: updatedOrder.shippingCity,
      shipping_state: updatedOrder.shippingState,
      shipping_pincode: updatedOrder.shippingPincode,
      shipping_country: updatedOrder.shippingCountry,
      tracking_number: updatedOrder.trackingNumber,
      notes: updatedOrder.notes,
      created_at: updatedOrder.createdAt.toISOString(),
      updated_at: updatedOrder.updatedAt.toISOString(),
      item_count: updatedOrder.orderItems.reduce((sum, item) => sum + item.quantity, 0),
      customer: updatedOrder.user ? {
        name: `${updatedOrder.user.firstName || ''} ${updatedOrder.user.lastName || ''}`.trim(),
        email: updatedOrder.user.email
      } : null
    };

    // Notify real-time subscribers about the update
    await notifyOrderUpdate(id, transformedOrder);

    return NextResponse.json({
      success: true,
      order: transformedOrder,
      message: 'Order updated successfully'
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}