// src/app/api/bulk-order/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentAdmin } from '@/lib/adminAuth';
import nodemailer from 'nodemailer';

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

// PATCH - Update bulk order request
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentAdmin = await getCurrentAdmin();
    
    if (!currentAdmin || (currentAdmin.role !== 'ADMIN' && currentAdmin.role !== 'SELLER' && currentAdmin.role !== 'SUPER_ADMIN')) {
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
      sendStatusEmail = false,
    } = body;

    // Get the current request
    const currentRequest = await prisma.bulkOrderRequest.findUnique({
      where: { id },
    });

    if (!currentRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Update the request
    const updatedRequest = await prisma.bulkOrderRequest.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(estimatedPrice !== undefined && { estimatedPrice }),
        ...(adminNotes && { adminNotes }),
      },
    });

    // Send status update email if requested
    if (sendStatusEmail && currentRequest.email) {
      try {
        const transporter = createTransporter();

        const statusMessages: { [key: string]: any } = {
          contacted: {
            subject: 'Your Bulk Order Request - We\'ll Contact You Soon!',
            title: 'Request Acknowledged',
            message: 'Thank you for your bulk order request! Our team has reviewed your requirements and will contact you within 24 hours to discuss the details.',
            emoji: '📞',
          },
          processing: {
            subject: 'Your Bulk Order is Being Processed!',
            title: 'Order Processing',
            message: 'Great news! Your bulk order has been accepted and is now being processed. We\'ll keep you updated on the progress.',
            emoji: '⚙️',
          },
          confirmed: {
            subject: 'Your Bulk Order is Confirmed!',
            title: 'Order Confirmed',
            message: 'Excellent! Your bulk order has been confirmed. Production will begin shortly, and delivery is expected within 10-15 days.',
            emoji: '✅',
          },
          completed: {
            subject: 'Your Bulk Order is Ready!',
            title: 'Order Completed',
            message: 'Great news! Your bulk order has been completed and is ready for delivery. We\'ll contact you shortly to arrange the shipment.',
            emoji: '🎉',
          },
          cancelled: {
            subject: 'Bulk Order Request Cancelled',
            title: 'Request Cancelled',
            message: 'Your bulk order request has been cancelled as requested. If you have any questions, please don\'t hesitate to contact us.',
            emoji: '❌',
          },
        };

        const statusInfo = statusMessages[status];
        
        if (statusInfo) {
          const emailContent = `
${statusInfo.emoji} ${statusInfo.title}

Dear ${currentRequest.contactPerson},

${statusInfo.message}

REQUEST DETAILS:
Request ID: ${currentRequest.requestId}
Company: ${currentRequest.companyName}
Product Type: ${currentRequest.productType}
Quantity: ${currentRequest.quantity} pieces
Status: ${status.toUpperCase().replace('_', ' ')}
${estimatedPrice ? `Estimated Price: ₹${estimatedPrice}` : ''}

${status === 'confirmed' ? `
DELIVERY INFORMATION:
Your order will be delivered within 10-15 business days from today. We'll provide tracking information once the shipment is dispatched.
` : ''}

${adminNotes ? `
ADDITIONAL NOTES:
${adminNotes}
` : ''}

If you have any questions, please contact us at:
📧 Email: Contact@zuree.in
📞 Phone: +91 97114 11526

Best regards,
The Zuree Global Sales Team
`;

          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: currentRequest.email,
            subject: statusInfo.subject,
            text: emailContent,
          });

          console.log(`📧 Status email sent to ${currentRequest.email}`);
        }
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      request: updatedRequest,
    });

  } catch (error) {
    console.error('❌ Update bulk order error:', error);
    return NextResponse.json(
      { error: 'Failed to update bulk order request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete bulk order request
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentAdmin = await getCurrentAdmin();
    
    if (!currentAdmin || currentAdmin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    await prisma.bulkOrderRequest.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Bulk order request deleted successfully',
    });

  } catch (error) {
    console.error('❌ Delete bulk order error:', error);
    return NextResponse.json(
      { error: 'Failed to delete bulk order request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}