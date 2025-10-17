// src/app/api/send-status-email/route.ts - Order Status Email Service
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Create transporter with GoDaddy SMTP support
const createTransporter = () => {
  if (process.env.MAIL_HOST && process.env.EMAIL_PORT) {
    // Custom SMTP configuration (GoDaddy)
    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
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
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
};

// Create the transporter instance
const transporter = createTransporter();

export async function POST(request: NextRequest) {
  try {
    const { 
      customerEmail, 
      customerName, 
      orderNumber, 
      status, 
      trackingNumber,
      estimatedDelivery 
    } = await request.json();

    if (!customerEmail || !orderNumber || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const statusMessages = {
      processing: {
        subject: `Your Order is Being Processed - ${orderNumber}`,
        emoji: '📦',
        title: 'Order Processing Started',
        message: 'Great news! We\'ve received your order and are now preparing it for shipment.',
        nextSteps: 'Your order will be packed and shipped within 1-2 business days.'
      },
      shipped: {
        subject: `Your Order Has Been Shipped - ${orderNumber}`,
        emoji: '🚚',
        title: 'Order Shipped',
        message: 'Your order is on its way! It has been dispatched and is en route to your delivery address.',
        nextSteps: 'You can track your package using the tracking number provided below.'
      },
      delivered: {
        subject: `Your Order Has Been Delivered - ${orderNumber}`,
        emoji: '✅',
        title: 'Order Delivered',
        message: 'Congratulations! Your order has been successfully delivered.',
        nextSteps: 'We hope you love your purchase! If you have any issues, please contact us.'
      },
      cancelled: {
        subject: `Your Order Has Been Cancelled - ${orderNumber}`,
        emoji: '❌',
        title: 'Order Cancelled',
        message: 'Your order has been cancelled as requested.',
        nextSteps: 'If you paid online, your refund will be processed within 3-5 business days.'
      }
    };

    const statusInfo = statusMessages[status as keyof typeof statusMessages];
    if (!statusInfo) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const emailContent = `
${statusInfo.emoji} ${statusInfo.title}

Hello ${customerName || 'Valued Customer'},

${statusInfo.message}

ORDER DETAILS:
Order Number: ${orderNumber}
Status: ${status.toUpperCase()}
${trackingNumber ? `Tracking Number: ${trackingNumber}` : ''}
${estimatedDelivery && estimatedDelivery !== 'Delivered' ? `Estimated Delivery: ${estimatedDelivery}` : ''}

${statusInfo.nextSteps}

${trackingNumber ? `
TRACK YOUR ORDER:
You can track your order anytime by visiting:
${process.env.NEXT_PUBLIC_APP_URL}/track-order

Enter your order number: ${orderNumber}
Or use tracking number: ${trackingNumber}
` : ''}

If you have any questions or concerns, please don't hesitate to contact us:
Email: ${process.env.ADMIN_EMAIL || 'support@zureediseno.com'}
Phone: +91 97114 11526
Website: ${process.env.NEXT_PUBLIC_APP_URL}

Thank you for choosing Zuree Global!

Best regards,
The Zuree Global Team
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: customerEmail,
      subject: statusInfo.subject,
      text: emailContent,
    });

    console.log(`✅ Status email sent to ${customerEmail} for order ${orderNumber} - Status: ${status}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Status email sent successfully' 
    });

  } catch (error) {
    console.error('❌ Status email API error:', error);
    return NextResponse.json(
      { error: 'Failed to send status email' },
      { status: 500 }
    );
  }
}