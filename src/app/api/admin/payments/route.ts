// src/app/api/admin/payments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// Payment interface
interface Payment {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  paymentMethod: 'cod' | 'razorpay';
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  transactionId?: string;
  gatewayResponse?: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
}

// Simple in-memory storage (replace with database in production)
let paymentsStore: Payment[] = [];

export async function GET(request: NextRequest) {
  try {
   const user = await getCurrentUser()
const userId = user?.id
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const method = searchParams.get('method');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let filteredPayments = [...paymentsStore];

    // Apply filters
    if (status && status !== 'all') {
      filteredPayments = filteredPayments.filter(p => p.status === status);
    }

    if (method && method !== 'all') {
      filteredPayments = filteredPayments.filter(p => p.paymentMethod === method);
    }

    // Sort by creation date (newest first)
    filteredPayments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination
    const paginatedPayments = filteredPayments.slice(offset, offset + limit);

    // Calculate stats
    const stats = {
      total: paymentsStore.length,
      completed: paymentsStore.filter(p => p.status === 'completed').length,
      pending: paymentsStore.filter(p => p.status === 'pending').length,
      failed: paymentsStore.filter(p => p.status === 'failed').length,
      totalRevenue: paymentsStore
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0),
    };

    return NextResponse.json({
      success: true,
      payments: paginatedPayments,
      stats,
      pagination: {
        total: filteredPayments.length,
        limit,
        offset,
        hasMore: offset + limit < filteredPayments.length,
      },
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
    const user = await getCurrentUser()
const userId = user?.id
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const paymentData = await request.json();

    // Create new payment record
    const newPayment: Payment = {
      id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderId: paymentData.orderId || `order_${Date.now()}`,
      orderNumber: paymentData.orderNumber,
      customerName: paymentData.customerName,
      customerEmail: paymentData.customerEmail,
      amount: Number(paymentData.amount),
      paymentMethod: paymentData.paymentMethod,
      status: paymentData.status || 'pending',
      transactionId: paymentData.transactionId,
      gatewayResponse: paymentData.gatewayResponse,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      processedAt: paymentData.status === 'completed' ? new Date().toISOString() : undefined,
    };

    // Add to store
    paymentsStore.push(newPayment);

    return NextResponse.json({
      success: true,
      payment: newPayment,
      message: 'Payment record created successfully',
    });

  } catch (error) {
    console.error('Error creating payment record:', error);
    return NextResponse.json(
      { error: 'Failed to create payment record' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
   const user = await getCurrentUser()
const userId = user?.id
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updateData = await request.json();
    const { transactionId, paymentId, ...restData } = updateData;

    let paymentIndex = -1;

    // Find payment by transactionId or paymentId
    if (transactionId) {
      paymentIndex = paymentsStore.findIndex(p => p.transactionId === transactionId);
    } else if (paymentId) {
      paymentIndex = paymentsStore.findIndex(p => p.id === paymentId);
    }
    
    if (paymentIndex === -1) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Update payment
    paymentsStore[paymentIndex] = {
      ...paymentsStore[paymentIndex],
      ...restData,
      updatedAt: new Date().toISOString(),
      processedAt: restData.status === 'completed' ? new Date().toISOString() : paymentsStore[paymentIndex].processedAt,
    };

    return NextResponse.json({
      success: true,
      payment: paymentsStore[paymentIndex],
      message: 'Payment updated successfully',
    });

  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
const userId = user?.id
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('id');
    
    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID required' }, { status: 400 });
    }

    // Find and remove payment
    const paymentIndex = paymentsStore.findIndex(p => p.id === paymentId);
    
    if (paymentIndex === -1) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    paymentsStore.splice(paymentIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Payment deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 }
    );
  }
}