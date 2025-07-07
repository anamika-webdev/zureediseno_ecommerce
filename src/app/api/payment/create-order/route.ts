// src/app/api/payment/create-order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Import Razorpay directly instead of using the lib
const Razorpay = require('razorpay');

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, currency = 'INR' } = await request.json();

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Check if Razorpay credentials are set
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials not found');
      return NextResponse.json({ 
        error: 'Payment service configuration error' 
      }, { status: 500 });
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Create order options
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency,
      receipt: `order_${Date.now()}_${userId.slice(-8)}`,
      notes: {
        userId,
        orderDate: new Date().toISOString(),
      },
    };

    console.log('Creating Razorpay order with options:', {
      ...options,
      amount: options.amount / 100 // Log in rupees for readability
    });

    // Create order
    const order = await razorpay.orders.create(options);

    console.log('Razorpay order created successfully:', order.id);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });

  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to create payment order';
    
    if (error.error && error.error.description) {
      errorMessage = error.error.description;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
}