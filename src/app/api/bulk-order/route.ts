// src/app/api/bulk-order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { getCurrentAdmin } from '@/lib/adminAuth';

// Create email transporter
const createTransporter = () => {
  if (process.env.MAIL_HOST && process.env.EMAIL_PORT) {
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
        pass: process.env.EMAIL_PASS,
      },
    });
  }
};

// POST - Create bulk order request (No auth required for customers)
export async function POST(req: NextRequest) {
  try {
    console.log('📦 Bulk order request received');

    const body = await req.json();
    const {
      companyName,
      contactPerson,
      email,
      phone,
      productType,
      quantity,
      description,
      deliveryDate
    } = body;

    // Validate required fields
    if (!companyName || !contactPerson || !email || !phone || !productType || !quantity) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Validate minimum quantity
    const qty = parseInt(quantity);
    if (qty < 10) {
      return NextResponse.json(
        { error: 'Minimum bulk order quantity is 10 pieces' },
        { status: 400 }
      );
    }

    // Generate request ID
    const requestId = `BULK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create bulk order request in database
    const bulkOrder = await prisma.bulkOrderRequest.create({
      data: {
        requestId,
        companyName,
        contactPerson,
        email,
        phone,
        productType,
        quantity: qty,
        description: description || null,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        status: 'pending',
        priority: 'normal',
      },
    });

    console.log('✅ Bulk order created:', bulkOrder.id);

    // Send email notifications
    try {
      const transporter = createTransporter();
      console.log('📧 Attempting to send emails...');

      // Customer confirmation email
      const customerEmailContent = `
🛍️ Bulk Order Request Received!

Dear ${contactPerson},

Thank you for your bulk order inquiry! We've received your request and our team is reviewing it.

REQUEST DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Request ID: ${requestId}
Company: ${companyName}
Product Type: ${productType}
Quantity: ${qty} pieces
${deliveryDate ? `Expected Delivery: ${new Date(deliveryDate).toLocaleDateString('en-IN')}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT HAPPENS NEXT:
✅ Our sales team will review your request within 24 hours
✅ We'll contact you via phone/email to discuss pricing and details
✅ Once confirmed, delivery takes 10-15 business days from order acceptance
✅ Minimum order quantity: 10 pieces

DELIVERY INFORMATION:
Your order will be delivered within 10-15 days from the day we accept and confirm your order. Our team will provide you with an exact delivery timeline during the confirmation call.

NEED TO MAKE CHANGES?
Reply to this email or call us at +91 97114 11526 with your request ID: ${requestId}

CONTACT US:
📞 Phone: +91 97114 11526
📧 Email: Contact@zuree.in
🕐 Business Hours: Mon-Fri: 9am - 6pm

We appreciate your business and look forward to serving you!

Best regards,
The Zuree Global Team

---
This is an automated confirmation. For inquiries, please contact us at Contact@zuree.in
`;

      // Send customer confirmation email FIRST
      console.log(`📧 Sending confirmation email to customer: ${email}`);
      const customerEmailResult = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `✅ Bulk Order Request Confirmed - ${requestId}`,
        text: customerEmailContent,
      });
      console.log('✅ Customer email sent successfully:', customerEmailResult.messageId);

      // Admin email
      const adminEmailContent = `
🛍️ NEW BULK ORDER REQUEST!

Request ID: ${requestId}
Database ID: ${bulkOrder.id}

COMPANY DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Company Name: ${companyName}
Contact Person: ${contactPerson}
Email: ${email}
Phone: ${phone}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ORDER DETAILS:
Product Type: ${productType}
Quantity: ${qty} pieces
${deliveryDate ? `Expected Delivery: ${new Date(deliveryDate).toLocaleDateString('en-IN')}` : 'No delivery date specified'}

ADDITIONAL DETAILS:
${description || 'No additional details provided'}

SUBMISSION TIME: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

ACTION REQUIRED:
Please contact the customer within 24 hours to discuss pricing and details.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
View all bulk orders: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin/bulk-orders
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

      // Send admin notification
      if (process.env.ADMIN_EMAIL) {
        console.log(`📧 Sending notification to admin: ${process.env.ADMIN_EMAIL}`);
        const adminEmailResult = await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.ADMIN_EMAIL,
          subject: `🛍️ New Bulk Order Request - ${requestId} from ${companyName}`,
          text: adminEmailContent,
        });
        console.log('✅ Admin email sent successfully:', adminEmailResult.messageId);
      } else {
        console.warn('⚠️ ADMIN_EMAIL not configured in environment variables');
      }

      console.log('✅ All emails sent successfully');
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      // Log detailed error information
      if (emailError instanceof Error) {
        console.error('Error details:', {
          message: emailError.message,
          stack: emailError.stack
        });
      }
      // Don't fail the entire request if email fails - order is still created
    }

    return NextResponse.json({
      success: true,
      message: 'Bulk order request submitted successfully!',
      requestId,
      id: bulkOrder.id,
    });

  } catch (error) {
    console.error('❌ Bulk order API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to submit bulk order request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET - Fetch bulk order requests (Admin only)
export async function GET(req: NextRequest) {
  try {
    console.log('🔍 GET Bulk order requests called');

    const currentAdmin = await getCurrentAdmin();
    
    console.log('Current admin:', currentAdmin ? { id: currentAdmin.id, email: currentAdmin.email, role: currentAdmin.role } : 'No admin session');
    
    if (!currentAdmin) {
      console.log('❌ No admin session found');
      return NextResponse.json(
        { error: 'Unauthorized - No admin session' },
        { status: 401 }
      );
    }
    
    if (currentAdmin.role !== 'ADMIN' && currentAdmin.role !== 'SELLER' && currentAdmin.role !== 'SUPER_ADMIN') {
      console.log('❌ User role not authorized:', currentAdmin.role);
      return NextResponse.json(
        { error: `Unauthorized - User role is ${currentAdmin.role}, must be ADMIN or SELLER` },
        { status: 401 }
      );
    }

    console.log('✅ Admin authorized as:', currentAdmin.role);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (priority && priority !== 'all') {
      where.priority = priority;
    }
    
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { productType: { contains: search, mode: 'insensitive' } },
      ];
    }

    console.log('📋 Fetching with filters:', where);

    // Fetch requests with pagination
    const [requests, total] = await Promise.all([
      prisma.bulkOrderRequest.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.bulkOrderRequest.count({ where }),
    ]);

    console.log(`✅ Found ${requests.length} bulk order requests out of ${total} total`);

    return NextResponse.json({
      requests,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });

  } catch (error) {
    console.error('❌ GET Bulk order requests error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch bulk order requests', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}