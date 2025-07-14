// FILE 2: src/app/api/send-order-email/route.ts - FIXED
// ============================================================================

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
          // ✅ REMOVED: These fields don't exist in current schema
          // subtotal: orderData.subtotal || orderData.totalAmount * 0.847,
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
    
    // ✅ FIXED: Use correct nodemailer method name
    let transporter;
    
    if (process.env.EMAIL_SERVICE === 'outlook') {
      transporter = nodemailer.createTransport({  // ✅ FIXED: createTransport not createTransporter
        service: 'hotmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      transporter = nodemailer.createTransport({  // ✅ FIXED: createTransport not createTransporter
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
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
Order Date: ${new Date().toLocaleString()}

📦 ITEMS ORDERED:
${itemsList}

💰 PAYMENT DETAILS:
Subtotal: ₹${orderData.subtotal?.toFixed(2) || (orderData.totalAmount * 0.847).toFixed(2)}
Shipping: ₹0.00 (FREE SHIPPING)
Tax (GST 18%): ₹${orderData.tax?.toFixed(2) || (orderData.totalAmount * 0.153).toFixed(2)}
Total Amount: ₹${orderData.totalAmount.toFixed(2)}
Payment Method: ${paymentMethodText}

📍 SHIPPING ADDRESS:
${orderData.shippingAddress.fullName}
${orderData.shippingAddress.email}
${orderData.shippingAddress.phone}
${orderData.shippingAddress.address}
${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} - ${orderData.shippingAddress.pincode}

${orderData.paymentMethod === 'cod' 
  ? '💵 CASH ON DELIVERY: Customer will pay ₹' + orderData.totalAmount.toFixed(2) + ' upon delivery.' 
  : '💳 ONLINE PAYMENT: Payment will be processed online.'
}

View order in admin dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin/orders
    `;

    // Customer email content
    const customerEmailContent = `
Dear ${orderData.shippingAddress.fullName},

Thank you for your order! We're excited to fulfill your purchase.

ORDER SUMMARY:
Order Number: ${orderNumber}
Order Date: ${new Date().toLocaleString()}

ITEMS ORDERED:
${itemsList}

PAYMENT DETAILS:
Subtotal: ₹${orderData.subtotal?.toFixed(2) || (orderData.totalAmount * 0.847).toFixed(2)}
Shipping: ₹0.00 (FREE SHIPPING!) 🎉
Tax (GST 18%): ₹${orderData.tax?.toFixed(2) || (orderData.totalAmount * 0.153).toFixed(2)}
Total Amount: ₹${orderData.totalAmount.toFixed(2)}
Payment Method: ${paymentMethodText}

SHIPPING ADDRESS:
${orderData.shippingAddress.fullName}
${orderData.shippingAddress.address}
${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} - ${orderData.shippingAddress.pincode}

${orderData.paymentMethod === 'cod' 
  ? `PAYMENT INSTRUCTIONS:
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
Email: support@zureediseno.com
Phone: +91 9876543210

Thank you for choosing Zuree Diseno!

Best regards,
The Zuree Diseno Team
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