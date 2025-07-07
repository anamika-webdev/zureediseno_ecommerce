// src/app/api/webhooks/payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignature } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature (optional but recommended for security)
    // const isValid = verifyWebhookSignature(body, signature);
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    // }

    const event = JSON.parse(body);
    console.log('Received webhook event:', event.event);

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
        gatewayResponse: 'Payment captured successfully',
        amount: payment.amount / 100, // Convert from paise to rupees
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update payment status');
    }

    console.log(`Payment ${payment.id} marked as completed`);
  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
}

async function handlePaymentFailed(payment: any) {
  try {
    // Update payment status in database
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/payments`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentId: payment.id,
        status: 'failed',
        transactionId: payment.id,
        gatewayResponse: payment.error_description || 'Payment failed',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update payment status');
    }

    console.log(`Payment ${payment.id} marked as failed`);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handleOrderPaid(order: any, payment: any) {
  try {
    // Update both order and payment status
    await handlePaymentCaptured(payment);
    
    // You can also update order status here if needed
    console.log(`Order ${order.id} has been paid with payment ${payment.id}`);
  } catch (error) {
    console.error('Error handling order paid:', error);
  }
}