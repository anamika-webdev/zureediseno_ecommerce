// app/api/admin/payments/route.ts - Real-time database implementation
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyPaymentUpdate, notifyNewPayment } from '@/app/api/ws/admin/route';

// First, we need to create a Payment model in your Prisma schema
// Add this to your prisma/schema.prisma file:

/*
model Payment {
  id              String   @id @default(cuid())
  orderId         String   @map("order_id")
  orderNumber     String   @map("order_number")
  customerName    String   @map("customer_name") @db.VarChar(255)
  customerEmail   String   @map("customer_email") @db.VarChar(255)
  amount          Float
  paymentMethod   String   @map("payment_method") @db.VarChar(50)
  status          String   @default("pending") @db.VarChar(50)
  transactionId   String?  @map("transaction_id") @db.VarChar(255)
  gatewayResponse Json?    @map("gateway_response")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  completedAt     DateTime? @map("completed_at")
  refundedAt      DateTime? @map("refunded_at")
  refundAmount    Float?   @map("refund_amount")
  fees            Float?
  
  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([orderId])
  @@index([status])
  @@index([paymentMethod])
  @@map("payments")
}
*/

// Also add to Order model:
// payments Payment[]

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
    const method = searchParams.get('method') || '';

    // Since Payment model might not exist yet, let's get payment data from orders
    // This is a temporary solution until you add the Payment model
    const where: any = {};
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { shippingName: { contains: search, mode: 'insensitive' } },
        { shippingEmail: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status && status !== 'all') {
      where.paymentStatus = status;
    }

    if (method && method !== 'all') {
      where.paymentMethod = method;
    }

    // Get total count for pagination
    const total = await prisma.order.count({ where });

    // Fetch orders as payment records
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Transform orders to payment format
    const transformedPayments = orders.map(order => ({
      id: `payment_${order.id}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.shippingName,
      customerEmail: order.shippingEmail,
      amount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      status: order.paymentStatus,
      transactionId: null, // Add transactionId field to Order model if needed
      gatewayResponse: null, // Add gatewayResponse field to Order model if needed
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      completedAt: order.paymentStatus === 'paid' ? order.updatedAt.toISOString() : null,
      refundedAt: order.paymentStatus === 'refunded' ? order.updatedAt.toISOString() : null,
      refundAmount: order.paymentStatus === 'refunded' ? order.totalAmount : null,
      fees: order.paymentMethod !== 'cod' ? order.totalAmount * 0.02 : 0 // 2% fee for online payments
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      payments: transformedPayments,
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
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
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

    const paymentData = await request.json();

    // Update the order's payment status
    const updatedOrder = await prisma.order.update({
      where: { id: paymentData.orderId },
      data: {
        paymentStatus: paymentData.status,
        paymentMethod: paymentData.paymentMethod,
        updatedAt: new Date()
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
    const transformedPayment = {
      id: `payment_${updatedOrder.id}`,
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      customerName: updatedOrder.shippingName,
      customerEmail: updatedOrder.shippingEmail,
      amount: updatedOrder.totalAmount,
      paymentMethod: updatedOrder.paymentMethod,
      status: updatedOrder.paymentStatus,
      transactionId: paymentData.transactionId || null,
      gatewayResponse: paymentData.gatewayResponse || null,
      createdAt: updatedOrder.createdAt.toISOString(),
      updatedAt: updatedOrder.updatedAt.toISOString(),
      completedAt: updatedOrder.paymentStatus === 'paid' ? updatedOrder.updatedAt.toISOString() : null,
      fees: updatedOrder.paymentMethod !== 'cod' ? updatedOrder.totalAmount * 0.02 : 0
    };

    // Notify real-time subscribers about payment update
    await notifyNewPayment(transformedPayment);

    return NextResponse.json({
      success: true,
      payment: transformedPayment,
      message: 'Payment recorded successfully'
    });

  } catch (error) {
    console.error('Error creating payment record:', error);
    return NextResponse.json(
      { error: 'Failed to create payment record' },
      { status: 500 }
    );
  }
}

// Update payment status endpoint
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const updateData = await request.json();
    const { orderId, status, transactionId, gatewayResponse } = updateData;

    // Update the order's payment status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: status,
        updatedAt: new Date()
      }
    });

    const transformedPayment = {
      id: `payment_${updatedOrder.id}`,
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      status: updatedOrder.paymentStatus,
      updatedAt: updatedOrder.updatedAt.toISOString()
    };

    // Notify real-time subscribers about payment update
    await notifyPaymentUpdate(`payment_${orderId}`, transformedPayment);

    return NextResponse.json({
      success: true,
      payment: transformedPayment,
      message: 'Payment status updated successfully'
    });

  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}