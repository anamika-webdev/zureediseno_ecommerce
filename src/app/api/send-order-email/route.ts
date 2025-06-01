// src/app/api/send-order-email/route.ts - FIXED VERSION
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
    
    // Create email transporter - FIXED: createTransport (not createTransporter)
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

---
This order was placed through your website.
    `;

    // Email to store owner (you)
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER, // Fallback to same email
      subject: `🛒 New Order #${orderNumber} - ₹${orderData.totalAmount.toFixed(2)}`,
      text: adminEmailContent,
    };

    // Email to customer
    const customerMailOptions = {
      from: process.env.EMAIL_USER,
      to: orderData.shippingAddress.email,
      subject: `Order Confirmation #${orderNumber} - Thank you!`,
      text: `
Hi ${orderData.shippingAddress.fullName},

Thank you for your order! 

Order Number: ${orderNumber}
Total Amount: ₹${orderData.totalAmount.toFixed(2)}
Payment Method: ${paymentMethodText}

📦 Items Ordered:
${itemsList}

📍 Shipping Address:
${orderData.shippingAddress.address}
${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} - ${orderData.shippingAddress.pincode}

We'll process your order shortly and send you updates.

Thank you for shopping with us!

Best regards,
Your Store Team
      `,
    };

    console.log('Attempting to send emails...');
    
    // Send emails
    await transporter.sendMail(adminMailOptions);
    console.log('Admin email sent successfully');
    
    await transporter.sendMail(customerMailOptions);
    console.log('Customer email sent successfully');

    console.log('All emails sent successfully for order:', orderNumber);

    return NextResponse.json({
      success: true,
      message: 'Order placed and emails sent successfully',
      orderNumber: orderNumber,
    });

  } catch (error) {
    console.error('Detailed error sending order email:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process order',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      },
      { status: 500 }
    );
  }
}