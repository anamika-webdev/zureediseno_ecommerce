// src/lib/razorpay.ts
import Razorpay from 'razorpay';

// Initialize Razorpay instance
export const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Razorpay configuration constants
export const RAZORPAY_CONFIG = {
  currency: 'INR',
  company_name: 'Zuree Diseno',
  description: 'Purchase from Zuree Diseno',
  theme_color: '#000000',
} as const;

// Payment verification utility
export const verifyPaymentSignature = (
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
): boolean => {
  const crypto = require('crypto');
  
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest('hex');

  return expectedSignature === razorpay_signature;
};

// Create order utility
export const createRazorpayOrder = async (amount: number, currency: string = 'INR') => {
  try {
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency,
      receipt: `order_${Date.now()}`,
      notes: {
        created_at: new Date().toISOString(),
      },
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};