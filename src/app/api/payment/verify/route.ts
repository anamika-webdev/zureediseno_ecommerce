// src/app/api/payment/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { verifyPaymentSignature } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await request.json();

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required payment verification data' },
        { status: 400 }
      );
    }

    // Verify payment signature
    const isAuthentic = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (isAuthentic) {
      // Update payment status in admin system
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/payments`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionId: razorpay_payment_id,
            status: 'completed',
            gatewayResponse: 'Payment verified and completed successfully',
            processedAt: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          console.error('Failed to update payment status in admin system');
        }
      } catch (error) {
        console.error('Error updating payment status:', error);
      }

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      });
    } else {
      // Record failed verification
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/payments`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionId: razorpay_payment_id,
            status: 'failed',
            gatewayResponse: 'Payment verification failed - Invalid signature',
          }),
        });
      } catch (error) {
        console.error('Error recording failed verification:', error);
      }

      return NextResponse.json(
        { error: 'Payment verification failed - Invalid signature' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}