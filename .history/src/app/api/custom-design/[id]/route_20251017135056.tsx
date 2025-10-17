// src/app/api/custom-design/[id]/route.ts - FIXED WITH DUAL AUTH
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getCurrentAdmin } from '@/lib/adminAuth';
import nodemailer from 'nodemailer';

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
  } else if (process.env.EMAIL_SERVICE === 'outlook') {
    return nodemailer.createTransport({
      service: 'hotmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
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

// PATCH - Update custom design request
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔄 PATCH /api/custom-design/[id] - Update request received');

    // Check BOTH admin and user sessions
    let currentUser: any = await getCurrentAdmin();
    let authType = 'admin-session';
    
    if (!currentUser) {
      currentUser = await getCurrentUser();
      authType = 'user-session';
    }

    console.log('👤 Auth check:', currentUser ? {
      email: currentUser.email,
      role: currentUser.role,
      authType
    } : 'No session found');
    
    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'SELLER' && currentUser.role !== 'SUPER_ADMIN')) {
      console.log('❌ Unauthorized:', currentUser ? `Invalid role: ${currentUser.role}` : 'No user');
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized',
          message: 'Admin or Seller access required'
        },
        { status: 401 }
      );
    }

    console.log(`✅ Authorized via ${authType}:`, currentUser.role);

    const { id } = params;
    const body = await req.json();

    const {
      status,
      priority,
      estimatedPrice,
      adminNotes,
      contactedAt,
      sendStatusEmail = false,
    } = body;

    console.log('📝 Update data:', { status, priority, estimatedPrice, sendStatusEmail });

    // Get the current request
    const currentRequest = await prisma.customDesignRequest.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!currentRequest) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Request not found' 
        },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (estimatedPrice !== undefined) updateData.estimatedPrice = parseFloat(estimatedPrice);
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (contactedAt) updateData.contactedAt = new Date(contactedAt);
    
    // Update contactedAt if status changed to 'contacted'
    if (status === 'contacted' && currentRequest.status !== 'contacted') {
      updateData.contactedAt = new Date();
    }

    // Update the request
    const updatedRequest = await prisma.customDesignRequest.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
      },
    });

    console.log('✅ Request updated:', updatedRequest.id);

    // Send status update email if requested
    if (sendStatusEmail && updatedRequest.customerEmail) {
      try {
        const transporter = createTransporter();
        const customerName = updatedRequest.customerName || 'Valued Customer';
        const customerEmail = updatedRequest.customerEmail;

        const statusMessages: any = {
          pending: {
            subject: '⏳ Your Custom Design Request - Under Review',
            title: 'Request Received',
            message: 'We\'ve received your custom design request and our team is reviewing it.',
            emoji: '⏳',
          },
          contacted: {
            subject: '📞 We\'ve Contacted You - Custom Design Update',
            title: 'We Reached Out',
            message: 'Our team has attempted to contact you regarding your custom design request. If you haven\'t heard from us, please check your phone or email.',
            emoji: '📞',
          },
          in_progress: {
            subject: '✂️ Your Custom Design is Being Created!',
            title: 'Work In Progress',
            message: 'Great news! Our expert tailors have started working on your custom design. We\'ll keep you updated on the progress.',
            emoji: '✂️',
          },
          completed: {
            subject: '✅ Your Custom Design is Ready!',
            title: 'Design Completed',
            message: 'Excellent news! Your custom design has been completed and is ready for pickup or delivery.',
            emoji: '✅',
          },
          cancelled: {
            subject: '❌ Custom Design Request Cancelled',
            title: 'Request Cancelled',
            message: 'Your custom design request has been cancelled. If you have any questions, please contact us.',
            emoji: '❌',
          },
        };

        const statusInfo = statusMessages[status];
        
        if (statusInfo) {
          const emailContent = `
${statusInfo.emoji} ${statusInfo.title}

Dear ${customerName},

${statusInfo.message}

REQUEST DETAILS:
Request ID: ${updatedRequest.id}
Design: ${updatedRequest.designDescription.substring(0, 100)}...
Status: ${status.toUpperCase().replace('_', ' ')}
${estimatedPrice ? `Estimated Price: ₹${estimatedPrice}` : ''}

${status === 'in_progress' ? `
WHAT'S HAPPENING NOW:
✂️ Our expert tailors are working on your design
📏 We're following your exact specifications
🎨 Quality checks are performed at each stage
📞 We'll update you on the progress

Estimated completion: 7-14 business days
` : ''}

${status === 'completed' ? `
NEXT STEPS:
📞 We'll call you within 24 hours to arrange pickup/delivery
💰 Payment will be collected upon delivery
📦 Your custom piece will be carefully packaged
✅ 30-day satisfaction guarantee included
` : ''}

NEED TO REACH US?
📞 Phone: ${updatedRequest.phoneNumber}
📧 Email: contact@zureeglobal.com

Thank you for choosing Zuree Global for your custom design needs!

Best regards,
The Zuree Global Design Team

---
This is an automated update. Your request ID is: ${updatedRequest.id}
`;

          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: customerEmail,
            subject: statusInfo.subject,
            text: emailContent,
          });

          console.log(`📧 Status update email sent to ${customerEmail}`);
        }
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError);
        // Don't fail the entire request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Request updated successfully',
      request: updatedRequest,
    });

  } catch (error) {
    console.error('❌ Update request error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET - Get single custom design request
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check BOTH admin and user sessions
    let currentUser: any = await getCurrentAdmin();
    
    if (!currentUser) {
      currentUser = await getCurrentUser();
    }
    
    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'SELLER' && currentUser.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized' 
        },
        { status: 401 }
      );
    }

    const { id } = params;

    const request = await prisma.customDesignRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!request) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Request not found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      request
    });

  } catch (error) {
    console.error('❌ Get request error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch request' 
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete custom design request
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check BOTH admin and user sessions
    let currentUser: any = await getCurrentAdmin();
    
    if (!currentUser) {
      currentUser = await getCurrentUser();
    }
    
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized - Admin access required' 
        },
        { status: 401 }
      );
    }

    const { id } = params;

    const deletedRequest = await prisma.customDesignRequest.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Request deleted successfully',
      id: deletedRequest.id,
    });

  } catch (error) {
    console.error('❌ Delete request error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}