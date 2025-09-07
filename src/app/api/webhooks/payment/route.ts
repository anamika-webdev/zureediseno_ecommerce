// src/app/api/webhooks/payment/route.ts - Fixed version with proper error handling

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature for security
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    console.log('Received verified webhook event:', event.event);

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      
      case 'order.paid':
        await handleOrderPaid(event.payload.order.entity, event.payload.payment.entity);
        break;

      case 'payment.dispute.created':
        await handlePaymentDispute(event.payload.payment.entity);
        break;
      
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentCaptured(payment: any) {
  try {
    console.log(`Processing payment captured: ${payment.id}`);

    // Update payment status in database
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/payments`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentId: payment.id,
        status: 'completed',
        transactionId: payment.id,
        gatewayResponse: 'Payment captured successfully via webhook',
        amount: payment.amount / 100, // Convert from paise to rupees
        processedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update payment status');
    }

    // Send notification to admin about successful payment
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'payment_success',
        message: `Payment ${payment.id} captured successfully`,
        amount: payment.amount / 100,
        paymentId: payment.id,
      }),
    });

    console.log(`Payment ${payment.id} processed successfully`);

  } catch (error) {
    console.error('Error handling payment captured:', error);
    
    // Properly handle error type
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Send error notification
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'payment_error',
          message: `Failed to process captured payment ${payment.id}: ${errorMessage}`,
          paymentId: payment.id,
        }),
      });
    } catch (notificationError) {
      console.error('Failed to send error notification:', notificationError);
    }
  }
}

async function handlePaymentFailed(payment: any) {
  try {
    console.log(`Processing payment failed: ${payment.id}`);

    // Update payment status to failed
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/payments`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentId: payment.id,
        status: 'failed',
        transactionId: payment.id,
        gatewayResponse: `Payment failed: ${payment.error_description || 'Unknown error'}`,
        failureReason: payment.error_code,
        processedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update payment status');
    }

    // Send notification about failed payment
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'payment_failed',
        message: `Payment ${payment.id} failed: ${payment.error_description || 'Unknown error'}`,
        paymentId: payment.id,
        errorCode: payment.error_code,
      }),
    });

    console.log(`Payment failure ${payment.id} recorded`);

  } catch (error) {
    console.error('Error handling payment failure:', error);
    
    // Properly handle error type
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`Failed to process payment failure ${payment.id}: ${errorMessage}`);
  }
}

async function handleOrderPaid(order: any, payment: any) {
  try {
    console.log(`Processing order paid: ${order.id} with payment: ${payment.id}`);

    // This webhook fires when an order is fully paid
    // Additional logic can be added here for order fulfillment
    
    // Update order status to paid
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/orders`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: order.id,
        status: 'paid',
        paymentId: payment.id,
        paidAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update order status');
    }

    console.log(`Order ${order.id} marked as paid`);

  } catch (error) {
    console.error('Error handling order paid:', error);
    
    // Properly handle error type
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`Failed to process order paid ${order.id}: ${errorMessage}`);
  }
}

async function handlePaymentDispute(payment: any) {
  try {
    console.log(`Processing payment dispute: ${payment.id}`);

    // Send urgent notification about dispute
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'payment_dispute',
        priority: 'high',
        message: `Payment dispute created for payment ${payment.id}`,
        paymentId: payment.id,
        amount: payment.amount / 100,
      }),
    });

    console.log(`Payment dispute ${payment.id} notification sent`);

  } catch (error) {
    console.error('Error handling payment dispute:', error);
    
    // Properly handle error type
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`Failed to process payment dispute ${payment.id}: ${errorMessage}`);
  }
}