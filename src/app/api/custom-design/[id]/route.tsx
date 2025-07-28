// src/app/api/custom-design/[id]/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import nodemailer from 'nodemailer';

// Create email transporter - Updated for custom SMTP
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
    const currentUser = await getCurrentUser();
    
    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'SELLER')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    // Get the current request
    const currentRequest = await prisma.customDesignRequest.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!currentRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Update the request
    const updatedRequest = await prisma.customDesignRequest.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(estimatedPrice !== undefined && { estimatedPrice }),
        ...(adminNotes && { adminNotes }),
        ...(contactedAt && { contactedAt: new Date(contactedAt) }),
        assignedToId: currentUser.id, // Assign to current admin
      },
      include: {
        user: true,
        assignedTo: true,
      },
    });

    // Send status update email if requested and customer has email
    if (sendStatusEmail && (currentRequest.customerEmail || currentRequest.user?.email)) {
      try {
        const transporter = createTransporter();
        const customerEmail = currentRequest.customerEmail || currentRequest.user?.email;
        const customerName = currentRequest.customerName || 
          (currentRequest.user ? `${currentRequest.user.firstName} ${currentRequest.user.lastName}`.trim() : 'Valued Customer');

        const statusMessages: { [key: string]: any } = {
          contacted: {
            subject: 'Your Custom Design Request - We\'ll Contact You Soon!',
            title: 'Request Acknowledged',
            message: 'Thank you for your custom design request! Our team has reviewed your requirements and will contact you within 24 hours to discuss the details.',
            emoji: '📞',
          },
          in_progress: {
            subject: 'Your Custom Design is Now In Progress!',
            title: 'Design Process Started',
            message: 'Great news! We\'ve started working on your custom design. Our skilled tailors are crafting your unique piece with attention to every detail.',
            emoji: '✂️',
          },
          completed: {
            subject: 'Your Custom Design is Ready!',
            title: 'Design Completed',
            message: 'Excellent news! Your custom design has been completed and is ready for pickup or delivery. We\'ll contact you shortly to arrange the next steps.',
            emoji: '✅',
          },
          cancelled: {
            subject: 'Custom Design Request Cancelled',
            title: 'Request Cancelled',
            message: 'Your custom design request has been cancelled as requested. If you have any questions, please don\'t hesitate to contact us.',
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
Request ID: ${currentRequest.id}
Design: ${currentRequest.designDescription.substring(0, 100)}...
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
📞 Phone: ${currentRequest.phoneNumber}
📧 Email: contact@zureeglobal.com
🌐 Website: ${process.env.NEXT_PUBLIC_BASE_URL}

Thank you for choosing Zuree Global for your custom design needs!

Best regards,
The Zuree Global Design Team

---
This is an automated update. Your request ID is: ${currentRequest.id}
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
    const currentUser = await getCurrentUser();
    
    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'SELLER')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
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
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(request);

  } catch (error) {
    console.error('❌ Get request error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch request' },
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
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
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
        error: 'Failed to delete request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}