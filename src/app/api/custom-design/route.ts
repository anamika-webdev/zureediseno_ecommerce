// src/app/api/custom-design/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

// Email transporter
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

// Handle image upload
async function handleImageUpload(file: File) {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'custom-designs');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filepath = path.join(uploadsDir, filename);

    // Write file
    fs.writeFileSync(filepath, buffer);

    return {
      url: `/uploads/custom-designs/${filename}`,
      filename: filename,
    };
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
}

// POST - Create new custom design request
export async function POST(req: NextRequest) {
  try {
    console.log('📨 Custom design request received');

    const formData = await req.formData();

    // Extract form data
    const customerName = formData.get('customerName') as string;
    const customerEmail = formData.get('customerEmail') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const designDescription = formData.get('designDescription') as string;
    const colorDescription = formData.get('colorDescription') as string;
    const fabricPreference = formData.get('fabricPreference') as string;
    const fabricPattern = formData.get('fabricPattern') as string;
    const userId = formData.get('userId') as string;
    const userType = formData.get('userType') as string;
    const measurementsJson = formData.get('measurements') as string;

    console.log('📋 Form data:', {
      customerName,
      customerEmail,
      phoneNumber,
      designDescription: designDescription?.substring(0, 50) + '...',
      colorDescription,
      fabricPreference,
      fabricPattern,
      userType,
      userId,
      hasMeasurements: !!measurementsJson
    });

    // Validate required fields
    if (!phoneNumber || !designDescription) {
      return NextResponse.json(
        { success: false, error: 'Phone number and design description are required' },
        { status: 400 }
      );
    }

    // Parse measurements
    const measurements = measurementsJson ? JSON.parse(measurementsJson) : null;
    
    // Handle image upload
    const imageFile = formData.get('image') as File | null;
    let imageUrl = null;
    let imageName = null;

    if (imageFile && imageFile.size > 0) {
      try {
        const uploadResult = await handleImageUpload(imageFile);
        if (uploadResult) {
          imageUrl = uploadResult.url;
          imageName = uploadResult.filename;
          console.log('📷 Image uploaded:', { imageUrl, imageName });
        }
      } catch (uploadError) {
        console.error('❌ Image upload failed:', uploadError);
        console.log('⚠️ Continuing without image due to upload error');
      }
    }

    // Get current user
     const currentUser = await getCurrentUser(); 

    // Generate request ID
    const requestId = `CDR-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Determine user information
    const finalUserId = (userId && userId !== 'undefined' && userId !== '') ? userId : 
                       (currentUser ? currentUser.id : null);
    const isLoggedUser = userType === 'logged' && finalUserId;

    console.log('👤 User type:', {
      userType,
      userId: finalUserId,
      isLoggedUser,
      customerName,
      customerEmail,
      hasImage: !!imageUrl,
      fabricPattern
    });

    // Save to database
    const customDesignRequest = await prisma.customDesignRequest.create({
      data: {
        customerName: customerName || null,
        customerEmail: customerEmail || null,
        phoneNumber,
        designDescription,
        colorDescription,
        fabricPreference,
        imageUrl,
        imageName,
        measurementData: measurements,
        userId: finalUserId,
        status: 'pending',
        priority: 'normal',
        notes: fabricPattern ? `Fabric Pattern: ${fabricPattern}` : null,
      },
    });

    console.log('✅ Custom design request saved:', {
      id: customDesignRequest.id,
      userType: isLoggedUser ? 'logged' : 'guest',
      userId: finalUserId,
      customerName,
      imageUrl,
      fabricPattern
    });

    // Send emails
    try {
      if (process.env.EMAIL_USER) {
        const transporter = createTransporter();

        // Prepare measurement text
        const measurementText = measurements ? `
MEASUREMENTS:
${measurements.providedByCustomer ? 'Customer will provide measurements separately' : `
- Length: ${measurements.length || 'Not provided'}
- Chest: ${measurements.chest || 'Not provided'}
- Upper Chest: ${measurements.upperChest || 'Not provided'}
- Hip: ${measurements.hip || 'Not provided'}
- Shoulder: ${measurements.shoulder || 'Not provided'}
- Sleeves: ${measurements.sleeves || 'Not provided'}
- Arm Hole: ${measurements.armHole || 'Not provided'}
- Round Neck: ${measurements.roundNeck || 'Not provided'}
- Neck Drop Front: ${measurements.neckDropFront || 'Not provided'}
- Neck Drop Back: ${measurements.neckDropBack || 'Not provided'}`}
` : 'No measurements provided';

        // Admin notification email
        const adminEmailContent = `
🎨 NEW CUSTOM DESIGN REQUEST!

Request ID: ${requestId}
Database ID: ${customDesignRequest.id}
Customer Type: ${isLoggedUser ? '👤 LOGGED USER' : '👥 GUEST USER'}

CUSTOMER DETAILS:
Name: ${customerName || 'Not provided'}
Email: ${customerEmail || 'Not provided'}
Phone: ${phoneNumber}
User Account: ${isLoggedUser ? `Linked to User ID: ${finalUserId}` : 'Guest submission'}

DESIGN REQUIREMENTS:
${designDescription}

COLOR PREFERENCES:
${colorDescription || 'Not specified'}

FABRIC PREFERENCE:
${fabricPreference || 'Not specified'}

FABRIC PATTERN:
${fabricPattern || 'Not specified'}

${measurementText}

IMAGE REFERENCE:
${imageUrl ? `✅ Image uploaded: ${process.env.NEXT_PUBLIC_BASE_URL}${imageUrl}` : '❌ No image uploaded'}
${imageName ? `Original filename: ${imageName}` : ''}

SUBMISSION TIME: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

---
${isLoggedUser ? 
  'This request is linked to a registered user account for easy tracking.' : 
  'This is a guest submission. Customer will need to contact for status updates.'
}

Please review this request and contact the customer within 24 hours.
View all requests in the admin dashboard: ${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/admin/custom-designs
`;

        // Customer confirmation email
        const customerEmailContent = `
🎨 Custom Design Request Received!

Dear ${customerName || 'Valued Customer'},

Thank you for your custom design request! We're excited to help create your perfect outfit.

REQUEST DETAILS:
Request ID: ${requestId}
Phone: ${phoneNumber}
Design Description: ${designDescription.substring(0, 100)}...
Submission Type: ${isLoggedUser ? 'Logged-in User Account' : 'Guest Submission'}
${imageUrl ? 'Design Reference: Image uploaded successfully ✅' : 'Design Reference: No image provided'}
${fabricPattern ? `Fabric Pattern: ${fabricPattern}` : ''}

WHAT HAPPENS NEXT:
✅ Our design team will review your request within 24 hours
✅ We'll contact you via phone to discuss details and pricing
✅ Once confirmed, we'll start creating your custom design
✅ Typical completion time: 7-14 business days

${isLoggedUser ? `
ACCOUNT BENEFITS:
✅ Your request is linked to your account
✅ Track progress in your dashboard
✅ Faster future submissions
✅ Saved preferences and measurements
` : `
GUEST SUBMISSION:
📞 We'll contact you directly via phone/email
💡 Consider creating an account for easier tracking
🌐 Visit ${process.env.NEXT_PUBLIC_BASE_URL}/register to create one
`}

NEED TO MAKE CHANGES?
Reply to this email or call us at +91-XXXXXXXXX with your request ID: ${requestId}

We appreciate your business and look forward to creating something amazing for you!

Best regards,
The Zuree Global Design Team

---
This is an automated message. Please do not reply to this email.
For inquiries, contact us at: contact@zureeglobal.com
`;

        // Send admin notification
        if (process.env.ADMIN_EMAIL) {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: `🎨 New Custom Design Request - ${requestId} ${isLoggedUser ? '(User Account)' : '(Guest)'}`,
            text: adminEmailContent,
          });
        }

        // Send customer confirmation
        if (customerEmail) {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: customerEmail,
            subject: `Custom Design Request Confirmation - ${requestId}`,
            text: customerEmailContent,
          });

          await prisma.customDesignRequest.update({
            where: { id: customDesignRequest.id },
            data: {
              followUpSent: true,
              followUpSentAt: new Date(),
            },
          });
        }

        console.log('📧 Emails sent successfully');
      }
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Custom design request submitted successfully!',
      requestId: requestId,
      id: customDesignRequest.id,
      userType: isLoggedUser ? 'logged' : 'guest',
      imageUploaded: !!imageUrl,
      imageUrl: imageUrl,
      tracking: isLoggedUser ? 
        'Your request is linked to your account for easy tracking.' :
        'Your request has been saved. We\'ll contact you directly for updates.'
    });

  } catch (error) {
    console.error('❌ Custom design API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to submit custom design request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET - Fetch custom design requests (Admin)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Filters
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const userType = searchParams.get('userType');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (priority && priority !== 'all') {
      where.priority = priority;
    }
    
    if (userType && userType !== 'all') {
      if (userType === 'logged') {
        where.userId = { not: null };
      } else if (userType === 'guest') {
        where.userId = null;
      }
    }
    
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } },
        { designDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch requests
    const [requests, total] = await Promise.all([
      prisma.customDesignRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      prisma.customDesignRequest.count({ where }),
    ]);

    // Enhance requests with display names
    const enhancedRequests = requests.map(request => ({
      ...request,
      userType: request.userId ? 'logged' as const : 'guest' as const,
      customerDisplayName: request.customerName || 
        (request.user ? `${request.user.firstName || ''} ${request.user.lastName || ''}`.trim() : null) ||
        'Unknown Customer',
      customerDisplayEmail: request.customerEmail || request.user?.email || 'No email provided'
    }));

    // Calculate statistics
    const loggedUserRequests = requests.filter(r => r.userId).length;
    const guestRequests = requests.filter(r => !r.userId).length;

    console.log(`✅ Found ${requests.length} requests (${loggedUserRequests} logged users, ${guestRequests} guests)`);

    return NextResponse.json({
      requests: enhancedRequests,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
      statistics: {
        total,
        loggedUsers: loggedUserRequests,
        guests: guestRequests,
        loggedUsersTotal: await prisma.customDesignRequest.count({ where: { userId: { not: null } } }),
        guestsTotal: await prisma.customDesignRequest.count({ where: { userId: null } }),
      }
    });

  } catch (error) {
    console.error('❌ GET Custom design requests error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch custom design requests', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}