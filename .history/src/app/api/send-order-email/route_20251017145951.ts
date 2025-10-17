// src/app/api/send-order-email/route.ts - Fixed version for Razorpay payments

import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Create transporter with GoDaddy SMTP support
const createTransporter = () => {
  if (process.env.MAIL_HOST && process.env.EMAIL_PORT) {
    console.log('✅ Using custom SMTP configuration (GoDaddy)');
    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000
    });
  } else {
    console.log('✅ Using Gmail SMTP configuration');
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
};

const transporter = createTransporter();

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Send order email API called');
    const orderData = await request.json();

    // Log the received data for debugging
    console.log('Order data received:', {
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentStatus,
      transactionId: orderData.transactionId,
      email: orderData.shippingAddress?.email
    });

    // Validate required fields
    if (!orderData.shippingAddress || !orderData.shippingAddress.email) {
      console.error('❌ Missing shipping address or email');
      return NextResponse.json(
        { error: 'Shipping address and email are required' },
        { status: 400 }
      );
    }

    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      console.error('❌ Missing or invalid items');
      return NextResponse.json(
        { error: 'Order items are required' },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    console.log('Generated order number:', orderNumber);

    // Create items list for email
    const itemsList = orderData.items.map((item: any) => {
      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      const total = price * item.quantity;
      return `• ${item.name} (Size: ${item.size}, Color: ${item.color}) - Qty: ${item.quantity} - ₹${total.toFixed(2)}`;
    }).join('\n');

    // Determine payment status message for Razorpay
    const getPaymentStatusMessage = () => {
      if (orderData.paymentMethod === 'cod') {
        return `PAYMENT INSTRUCTIONS:
You have selected Cash on Delivery (COD). Please keep ₹${orderData.totalAmount.toFixed(2)} ready when our delivery person arrives.`;
      } else if (orderData.paymentMethod === 'razorpay') {
        if (orderData.paymentStatus === 'completed' && orderData.transactionId) {
          return `PAYMENT CONFIRMATION:
✅ Payment Successfully Completed!
Payment Method: Online Payment via Razorpay
Transaction ID: ${orderData.transactionId}
Amount Paid: ₹${orderData.totalAmount.toFixed(2)}
Payment Status: CONFIRMED

Your payment has been verified and processed successfully. You will also receive a separate payment receipt from Razorpay.`;
        } else {
          return `PAYMENT STATUS:
Your payment is being processed securely via Razorpay.`;
        }
      }
      return 'Payment details will be updated shortly.';
    };

    // Admin email content
    const adminEmailContent = `
🛒 NEW ORDER RECEIVED - ${orderNumber}

CUSTOMER DETAILS:
Name: ${orderData.shippingAddress.fullName}
Email: ${orderData.shippingAddress.email}
Phone: ${orderData.shippingAddress.phone}

SHIPPING ADDRESS:
${orderData.shippingAddress.fullName}
${orderData.shippingAddress.address}
${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.pincode}
${orderData.shippingAddress.country}

ORDER DETAILS:
Order Number: ${orderNumber}
Order Date: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
Total Amount: ₹${orderData.totalAmount.toFixed(2)}

ITEMS ORDERED:
${itemsList}

PRICING BREAKDOWN:
Subtotal: ₹${orderData.subtotal || orderData.totalAmount}
Shipping: ₹${orderData.shipping || 0} (FREE)
Total: ₹${orderData.totalAmount.toFixed(2)}

PAYMENT DETAILS:
${orderData.paymentMethod === 'cod' ? 
  'PAYMENT: Cash on Delivery (COD)' : 
  `PAYMENT: Online Payment via Razorpay
${orderData.transactionId ? `Transaction ID: ${orderData.transactionId}` : 'Transaction ID: Pending'}
Payment Status: ${orderData.paymentStatus === 'completed' ? 'COMPLETED ✅' : 'Processing'}`
}

Please process this order immediately.

---
Admin Dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin/orders
    `;

    // Customer email content
    const customerEmailContent = `
🎉 ORDER CONFIRMATION

Hello ${orderData.shippingAddress.fullName},

Thank you for your order! Your order has been successfully placed and we'll start processing it right away.

ORDER DETAILS:
Order Number: ${orderNumber}
Order Date: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
Total Amount: ₹${orderData.totalAmount.toFixed(2)}

ITEMS ORDERED:
${itemsList}

SHIPPING ADDRESS:
${orderData.shippingAddress.fullName}
${orderData.shippingAddress.address}
${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.pincode}
${orderData.shippingAddress.country}

PRICING BREAKDOWN:
Subtotal: ₹${orderData.subtotal || orderData.totalAmount}
Shipping: ₹${orderData.shipping || 0} (FREE)
Total: ₹${orderData.totalAmount.toFixed(2)}

${getPaymentStatusMessage()}

WHAT'S NEXT:
1. Order Confirmation: You're receiving this email as confirmation ✅
2. Processing: We'll prepare your order within 1-2 business days  
3. Shipping: FREE SHIPPING to your address
4. Delivery: Estimated delivery in 3-5 business days

ORDER TRACKING:
You can track your order status anytime by visiting:
${process.env.NEXT_PUBLIC_APP_URL}/order-tracking
Order Number: ${orderNumber}

If you have any questions, contact us at:
Email: ${process.env.ADMIN_EMAIL || 'support@zureediseno.com'}
Phone: +91 9876543210

Thank you for choosing Zuree Global!

Best regards,
The Zuree Global Team
    `;

    console.log('📤 Sending emails...');

    // Send admin email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        subject: `🛒 New Order - ${orderNumber} ${orderData.paymentMethod === 'razorpay' && orderData.paymentStatus === 'completed' ? '(PAID)' : ''}`,
        text: adminEmailContent,
      });
      console.log('✅ Admin email sent successfully');
    } catch (error) {
      console.error('❌ Admin email failed:', error);
      // Don't fail the entire process if admin email fails
    }

    // Send customer email
    try {
      const customerEmailResult = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: orderData.shippingAddress.email,
        subject: `Order Confirmation - ${orderNumber} ${orderData.paymentMethod === 'razorpay' && orderData.paymentStatus === 'completed' ? '✅ Payment Confirmed' : ''}`,
        text: customerEmailContent,
      });
      console.log('✅ Customer email sent successfully to:', orderData.shippingAddress.email);
      console.log('Email response:', customerEmailResult.response);
    } catch (error) {
      console.error('❌ Customer email failed:', error);
      // For customer email failure, we should return an error
      return NextResponse.json(
        { 
          error: 'Failed to send order confirmation email',
          details: error instanceof Error ? error.message : 'Unknown email error',
          orderNumber: orderNumber
        },
        { status: 500 }
      );
    }

    console.log('✅ Order processed successfully:', orderNumber);

    return NextResponse.json({ 
      success: true, 
      orderNumber,
      message: 'Order placed and email sent successfully',
      emailSent: true
    });

  } catch (error) {
    console.error('❌ Order processing error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}