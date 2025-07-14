// src/app/api/admin/payments/route.ts - Fixed version
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/adminAuth'; // FIXED: Use getCurrentAdmin
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // FIXED: Check admin authentication
    const user = await getCurrentAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.isAdmin) {
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
      customerName: order.shippingName || `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || 'Unknown',
      customerEmail: order.shippingEmail || order.user?.email || '',
      amount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      status: order.paymentStatus,
      transactionId: null, // Will be available when Payment model is added
      gatewayResponse: null, // Will be available when Payment model is added
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      completedAt: order.paymentStatus === 'paid' ? order.updatedAt.toISOString() : null,
      refundedAt: null,
      refundAmount: null,
      fees: null
    }));

    return NextResponse.json({
      success: true,
      payments: transformedPayments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching admin payments:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}