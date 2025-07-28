// src/app/api/send-order-email/route.ts - COMPLETE UPDATED VERSION
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    console.log('📧 Order email API called');
    const orderData = await req.json();
    console.log('📦 Order data received:', orderData);
    
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    console.log('🔢 Generated order number:', orderNumber);
    
    // ✅ SAVE ORDER TO DATABASE WITH PROPER PRISMA SCHEMA
    try {
      console.log('💾 Saving order to database...');
      
      // Create order in database with correct field names
      const newOrder = await prisma.order.create({
        data: {
          orderNumber: orderNumber,
          userId: orderData.userId || null,
          totalAmount: orderData.totalAmount,
          shippingCost: orderData.shipping || 0,
          taxAmount: orderData.tax || orderData.totalAmount * 0.153,
          status: 'pending',
          paymentStatus: orderData.paymentMethod === 'cod' ? 'pending' : 'pending',
          paymentMethod: orderData.paymentMethod || 'cod',
          
          // Shipping information
          shippingName: orderData.shippingAddress.fullName,
          shippingEmail: orderData.shippingAddress.email,
          shippingPhone: orderData.shippingAddress.phone,
          shippingAddress: orderData.shippingAddress.address,
          shippingCity: orderData.shippingAddress.city,
          shippingState: orderData.shippingAddress.state,
          shippingPincode: orderData.shippingAddress.pincode,
          shippingCountry: orderData.shippingAddress.country || 'India',
          
          guestOrder: !orderData.userId,
          
          // ✅ FIXED: Use correct relation name
          items: {
            create: orderData.items.map((item: any, index: number) => ({
              productName: item.name,
              productSlug: item.slug || `product-${index}`,
              quantity: item.quantity,
              price: item.price,
              size: item.size || null,
              color: item.color || null,
              imageUrl: item.image || item.imageUrl || null,
              productId: item.id || null,
            }))
          }
        },
        include: {
          items: true  // ✅ FIXED: Use correct relation name
        }
      });
      
      console.log('✅ Order saved to database successfully:', newOrder.id);
      
    } catch (dbError) {
      console.error('❌ Database save failed:', dbError);
      // Continue with email sending even if DB save fails
    }
    
    // ✅ UPDATED: Custom SMTP configuration with fallbacks
   // Updated email transporter configuration for GoDaddy SMTP
// Replace the transporter section in your send-order-email/route.ts

let transporter;

if (process.env.MAIL_HOST && process.env.EMAIL_PORT) {
  console.log('✅ Custom SMTP detected - using GoDaddy configuration');
  
  // GoDaddy-specific SMTP configuration
  transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST, // smtpout.secureserver.net
    port: parseInt(process.env.EMAIL_PORT), // 465
    secure: true, // Always true for port 465
    auth: {
      user: process.env.EMAIL_USER, // info@zureeglobal.com
      pass: process.env.EMAIL_PASS, // Your email password
    },
    // GoDaddy-specific configurations
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    },
    // Additional options for GoDaddy compatibility
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000, // 30 seconds
    socketTimeout: 60000, // 60 seconds
    debug: true, // Enable debug logs
    logger: true // Enable logger
  });
  
  console.log('📧 Using GoDaddy SMTP configuration:', process.env.MAIL_HOST);
  
  // Test the connection
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
  } catch (verifyError) {
    console.error('❌ SMTP connection verification failed:', verifyError);
    
    // Try alternative GoDaddy SMTP settings
    console.log('🔄 Trying alternative GoDaddy SMTP configuration...');
    transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: 587, // Try port 587 with STARTTLS
      secure: false, // false for port 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      },
      requireTLS: true,
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
      debug: true,
      logger: true
    });
    
    try {
      await transporter.verify();
      console.log('✅ Alternative SMTP connection verified successfully');
    } catch (altError) {
      console.error('❌ Alternative SMTP connection also failed:', altError);
    }
  }
  
} else {
  // Fallback configurations remain the same
  console.log('❌ Custom SMTP not detected - falling back to Gmail/Outlook');
  
  if (process.env.EMAIL_SERVICE === 'outlook') {
    transporter = nodemailer.createTransport({
      service: 'hotmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log('📧 Using Outlook SMTP configuration');
  } else {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log('📧 Using Gmail SMTP configuration');
  }
}
    
    // Prepare email content
    const itemsList = orderData.items.map((item: any) => 
      `• ${item.name} - Qty: ${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}${item.size ? `\n  Size: ${item.size}` : ''}${item.color ? `\n  Color: ${item.color}` : ''}`
    ).join('\n');
    
    const paymentMethodText = orderData.paymentMethod === 'cod' 
      ? 'Cash on Delivery (COD)' 
      : 'Online Payment';
    
    // Admin email content
    const adminEmailContent = `
🛒 NEW ORDER RECEIVED!

Order Number: ${orderNumber}
Order Date: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
Payment Method: ${paymentMethodText}
Total Amount: ₹${orderData.totalAmount.toFixed(2)}

CUSTOMER DETAILS:
Name: ${orderData.shippingAddress.fullName}
Email: ${orderData.shippingAddress.email}
Phone: ${orderData.shippingAddress.phone}

SHIPPING ADDRESS:
${orderData.shippingAddress.address}
${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.pincode}
${orderData.shippingAddress.country}

ITEMS ORDERED:
${itemsList}

PRICING BREAKDOWN:
Subtotal: ₹${orderData.subtotal || orderData.totalAmount}
Shipping: ₹${orderData.shipping || 0}
Tax: ₹${orderData.tax || 0}
Total: ₹${orderData.totalAmount.toFixed(2)}

${orderData.paymentMethod === 'cod' ? 
  'PAYMENT: Cash on Delivery (COD)' : 
  'PAYMENT: Online Payment - Processing'
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
Shipping: ₹${orderData.shipping || 0} (FREE SHIPPING!)
Tax: ₹${orderData.tax || 0}
Total: ₹${orderData.totalAmount.toFixed(2)}

${orderData.paymentMethod === 'cod' ? 
  `PAYMENT INSTRUCTIONS:
You have selected Cash on Delivery (COD). Please keep ₹${orderData.totalAmount.toFixed(2)} ready when our delivery person arrives.`
  : `PAYMENT STATUS:
Your payment will be processed securely.`
}

WHAT'S NEXT:
1. Order Confirmation: You're receiving this email as confirmation
2. Processing: We'll prepare your order within 1-2 business days  
3. Shipping: FREE SHIPPING to your address
4. Delivery: Estimated delivery in 3-5 business days

If you have any questions, contact us at:
Email: ${process.env.ADMIN_EMAIL || 'support@zureeglobal.com'}
Phone: +91 9876543210

Thank you for choosing Zuree Global!

Best regards,
The Zuree Global Team
    `;

    // Send emails
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        subject: `🛒 New Order - ${orderNumber}`,
        text: adminEmailContent,
      });
      console.log('✅ Admin email sent');
    } catch (error) {
      console.error('❌ Admin email failed:', error);
    }

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: orderData.shippingAddress.email,
        subject: `Order Confirmation - ${orderNumber}`,
        text: customerEmailContent,
      });
      console.log('✅ Customer email sent');
    } catch (error) {
      console.error('❌ Customer email failed:', error);
    }

    return NextResponse.json({ 
      success: true, 
      orderNumber,
      message: 'Order placed successfully'
    });

  } catch (error) {
    console.error('❌ Order processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process order' },
      { status: 500 }
    );
  }
}