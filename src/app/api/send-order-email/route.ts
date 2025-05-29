// src/app/api/send-order-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const orderData = await req.json();
    
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Create email transporter (using Gmail as example)
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your app password
      },
    });
    
    // Prepare order details for email
    const itemsList = orderData.items.map((item: any) => 
      `• ${item.name} - Qty: ${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}
        ${item.size ? `Size: ${item.size}` : ''} ${item.color ? `Color: ${item.color}` : ''}`
    ).join('\n');
    
    const paymentMethodText = orderData.paymentMethod === 'cod' 
      ? 'Cash on Delivery (COD)' 
      : 'Online Payment';
    
    // Email content
    const emailContent = `
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
Please process it accordingly.
    `;

    // Email to store owner (you)
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL, // Your email where you want to receive orders
      subject: `🛒 New Order #${orderNumber} - ₹${orderData.totalAmount.toFixed(2)}`,
      text: emailContent,
    };

    // Email to customer
    const customerMailOptions = {
      from: process.env.EMAIL_USER,
      to: orderData.shippingAddress.email,
      subject: `Order Confirmation #${orderNumber} - Thank you for your order!`,
      text: `
Hi ${orderData.shippingAddress.fullName},

Thank you for your order! We've received your order and will process it shortly.

Order Number: ${orderNumber}
Total Amount: ₹${orderData.totalAmount.toFixed(2)}
Payment Method: ${paymentMethodText}

📦 Items Ordered:
${itemsList}

📍 Shipping Address:
${orderData.shippingAddress.address}
${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} - ${orderData.shippingAddress.pincode}

We'll send you updates as your order progresses.

Thank you for shopping with us!

Best regards,
Your Store Team
      `,
    };

    // Send emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(customerMailOptions);

    console.log('Order emails sent successfully:', orderNumber);

    return NextResponse.json({
      success: true,
      message: 'Order placed and emails sent successfully',
      orderNumber: orderNumber,
    });

  } catch (error) {
    console.error('Error sending order email:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}