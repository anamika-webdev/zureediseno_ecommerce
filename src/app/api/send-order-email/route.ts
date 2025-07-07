// src/app/api/send-order-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    console.log('Email API called');
    const orderData = await req.json();
    console.log('Order data received:', orderData);
    
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    console.log('Generated order number:', orderNumber);
    
    // Record payment in admin system
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: `order_${Date.now()}`,
          orderNumber: orderNumber,
          customerName: orderData.shippingAddress.fullName,
          customerEmail: orderData.shippingAddress.email,
          amount: orderData.totalAmount,
          paymentMethod: orderData.paymentMethod,
          status: orderData.paymentMethod === 'cod' ? 'pending' : 'pending',
          gatewayResponse: orderData.paymentMethod === 'cod' 
            ? 'Cash on Delivery order created' 
            : 'Online payment initiated',
        }),
      });
    } catch (error) {
      console.error('Failed to record payment:', error);
      // Continue with email sending even if payment recording fails
    }
    
    // Create email transporter - FIXED: using createTransport (not createTransporter)
    let transporter;
    
    if (process.env.EMAIL_SERVICE === 'outlook') {
      console.log('Using Outlook email service');
      transporter = nodemailer.createTransport({
        service: 'hotmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else if (process.env.EMAIL_SERVICE === 'yahoo') {
      console.log('Using Yahoo email service');
      transporter = nodemailer.createTransport({
        service: 'yahoo',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      console.log('Using Gmail email service');
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }
    
    // Prepare order details for email
    const itemsList = orderData.items.map((item: any) => 
      `• ${item.name} - Qty: ${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}${item.size ? `\n  Size: ${item.size}` : ''}${item.color ? `\n  Color: ${item.color}` : ''}`
    ).join('\n');
    
    const paymentMethodText = orderData.paymentMethod === 'cod' 
      ? 'Cash on Delivery (COD)' 
      : orderData.paymentMethod === 'razorpay'
      ? 'Razorpay (Online Payment)'
      : 'Online Payment';
    
    // Email content for admin
    const adminEmailContent = `
🛒 NEW ORDER RECEIVED!

Order Number: ${orderNumber}
Order Date: ${new Date(orderData.orderDate).toLocaleString()}

📦 ITEMS ORDERED:
${itemsList}

💰 PAYMENT DETAILS:
Subtotal: ₹${orderData.subtotal.toFixed(2)}
Shipping: ₹${orderData.shipping.toFixed(2)}
Tax (GST 18%): ₹${orderData.tax.toFixed(2)}
Total Amount: ₹${orderData.totalAmount.toFixed(2)}
Payment Method: ${paymentMethodText}

📍 SHIPPING ADDRESS:
${orderData.shippingAddress.fullName}
${orderData.shippingAddress.email}
${orderData.shippingAddress.phone}
${orderData.shippingAddress.address}
${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} - ${orderData.shippingAddress.pincode}
${orderData.shippingAddress.country}

${orderData.paymentMethod === 'cod' 
  ? '💵 CASH ON DELIVERY: Customer will pay ₹' + orderData.totalAmount.toFixed(2) + ' upon delivery.' 
  : orderData.paymentMethod === 'razorpay'
  ? '💳 RAZORPAY PAYMENT: Payment will be processed online through Razorpay gateway.'
  : '💳 ONLINE PAYMENT: Payment will be processed online.'
}

---
This order was placed through your website.
Please process this order promptly.

You can view payment details in the admin dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin/payments
    `;

    // Email content for customer
    const customerEmailContent = `
Dear ${orderData.shippingAddress.fullName},

Thank you for your order! We're excited to fulfill your purchase.

ORDER SUMMARY:
Order Number: ${orderNumber}
Order Date: ${new Date(orderData.orderDate).toLocaleString()}

ITEMS ORDERED:
${itemsList}

PAYMENT DETAILS:
Subtotal: ₹${orderData.subtotal.toFixed(2)}
Shipping: ₹${orderData.shipping.toFixed(2)}
Tax (GST 18%): ₹${orderData.tax.toFixed(2)}
Total Amount: ₹${orderData.totalAmount.toFixed(2)}
Payment Method: ${paymentMethodText}

SHIPPING ADDRESS:
${orderData.shippingAddress.fullName}
${orderData.shippingAddress.address}
${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} - ${orderData.shippingAddress.pincode}
${orderData.shippingAddress.country}

${orderData.paymentMethod === 'cod' 
  ? `PAYMENT INSTRUCTIONS:
You have selected Cash on Delivery (COD). Please keep ₹${orderData.totalAmount.toFixed(2)} ready when our delivery person arrives. We accept exact change only.`
  : orderData.paymentMethod === 'razorpay'
  ? `PAYMENT STATUS:
Your payment will be processed securely through Razorpay. You will receive a separate payment confirmation once the transaction is completed.`
  : `PAYMENT STATUS:
Your payment will be processed securely. You will receive a separate payment confirmation once the transaction is completed.`
}

WHAT'S NEXT:
1. Order Confirmation: You're receiving this email as confirmation
2. Processing: We'll prepare your order within 1-2 business days
3. Shipping: You'll receive tracking information once shipped
4. Delivery: Estimated delivery in 3-5 business days

If you have any questions about your order, please contact us:
Email: support@zureediseno.com
Phone: +91 9876543210

Thank you for choosing Zuree Diseno!

Best regards,
The Zuree Diseno Team
    `;

    // Send email to admin
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        subject: `🛒 New Order Received - ${orderNumber}`,
        text: adminEmailContent,
      });
      console.log('Admin email sent successfully');
    } catch (error) {
      console.error('Failed to send admin email:', error);
    }

    // Send confirmation email to customer
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: orderData.shippingAddress.email,
        subject: `Order Confirmation - ${orderNumber} - Zuree Diseno`,
        text: customerEmailContent,
      });
      console.log('Customer email sent successfully');
    } catch (error) {
      console.error('Failed to send customer email:', error);
    }

    return NextResponse.json({ 
      success: true, 
      orderNumber,
      message: 'Order placed successfully and confirmation emails sent'
    });

  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Failed to process order and send emails' },
      { status: 500 }
    );
  }
}