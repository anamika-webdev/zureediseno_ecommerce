// src/app/api/custom-design/route.ts - Fixed with Proper Image Upload
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Create email transporter
const createTransporter = () => {
  if (process.env.EMAIL_SERVICE === 'outlook') {
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

// Define user type interface
interface CurrentUser {
  id: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

// Helper function to handle image upload
const handleImageUpload = async (imageFile: File): Promise<{ url: string; filename: string } | null> => {
  try {
    if (!imageFile || imageFile.size === 0) {
      return null;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(imageFile.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > maxSize) {
      throw new Error('File too large. Maximum size is 5MB.');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = imageFile.name.split('.').pop() || 'jpg';
    const filename = `custom-design-${timestamp}-${randomId}.${extension}`;

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'custom-designs');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, that's okay
    }

    // Convert file to buffer and save
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filepath = join(uploadDir, filename);
    
    await writeFile(filepath, buffer);
    
    // Return the public URL
    const imageUrl = `/uploads/custom-designs/${filename}`;
    
    console.log('✅ Image uploaded successfully:', {
      filename,
      size: imageFile.size,
      type: imageFile.type,
      url: imageUrl
    });

    return {
      url: imageUrl,
      filename: imageFile.name
    };

  } catch (error) {
    console.error('❌ Image upload error:', error);
    throw error;
  }
};

// Helper function to try to get current user
const getCurrentUser = async (req: NextRequest): Promise<CurrentUser | null> => {
  try {
    // For now, return null as we're handling guests and logged users separately
    // This can be updated when proper auth is implemented
    return null;
  } catch (error) {
    console.log('No user authentication found, treating as guest');
    return null;
  }
};

export async function POST(req: NextRequest) {
  try {
    console.log('📋 Custom Design API called');
    
    const formData = await req.formData();
    console.log('📝 Form data received');

    // Extract form fields
    const phoneNumber = formData.get('phoneNumber') as string;
    const designDescription = formData.get('designDescription') as string;
    const colorDescription = formData.get('colorDescription') as string;
    const fabricPreference = formData.get('fabricPreference') as string;
    const customerName = formData.get('customerName') as string;
    const customerEmail = formData.get('customerEmail') as string;
    const userType = formData.get('userType') as string; // 'logged' or 'guest'
    const userId = formData.get('userId') as string;
    
    // Extract measurements
    const measurementsJson = formData.get('measurements') as string;
    const measurements = measurementsJson ? JSON.parse(measurementsJson) : null;
    
    // Handle image upload properly
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
        // Continue without image rather than failing the entire request
        console.log('⚠️ Continuing without image due to upload error');
      }
    }

    // Try to get current user (for logged users)
    const currentUser = await getCurrentUser(req);

    // Generate a unique request ID for tracking
    const requestId = `CDR-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Determine user information
    const finalUserId = (userId && userId !== 'undefined' && userId !== '') ? userId : 
                       (currentUser ? currentUser.id : null);
    const isLoggedUser = userType === 'logged' && finalUserId;
    const isGuestUser = !isLoggedUser;

    console.log('👤 User type:', {
      userType,
      userId: finalUserId,
      isLoggedUser,
      isGuestUser,
      customerName,
      customerEmail,
      hasImage: !!imageUrl
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
      },
    });

    console.log('✅ Custom design request saved:', {
      id: customDesignRequest.id,
      userType: isLoggedUser ? 'logged' : 'guest',
      userId: finalUserId,
      customerName,
      imageUrl
    });

    // Send emails (if configured)
    try {
      if (process.env.EMAIL_USER) {
        const transporter = createTransporter();

        // Prepare email content
        const measurementText = measurements ? `
MEASUREMENTS:
${measurements.providedByCustomer ? 'Customer will provide measurements separately' : `
• Chest: ${measurements.chest || 'Not provided'}
• Waist: ${measurements.waist || 'Not provided'}
• Hips: ${measurements.hips || 'Not provided'}
• Shoulders: ${measurements.shoulders || 'Not provided'}
• Inseam: ${measurements.inseam || 'Not provided'}
• Sleeves: ${measurements.sleeves || 'Not provided'}`}
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
Design Description: ${designDescription}
Submission Type: ${isLoggedUser ? 'Logged-in User Account' : 'Guest Submission'}
${imageUrl ? 'Design Reference: Image uploaded successfully ✅' : 'Design Reference: No image provided'}

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

        // Send customer confirmation (if email provided)
        if (customerEmail) {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: customerEmail,
            subject: `Custom Design Request Confirmation - ${requestId}`,
            text: customerEmailContent,
          });

          // Mark follow-up as sent
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
      // Don't fail the entire request if email fails
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

// GET endpoint remains the same
export async function GET(req: NextRequest) {
  try {
    console.log('🔍 GET Custom design requests');

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');
    const userType = searchParams.get('userType');

    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (priority && priority !== 'all') {
      where.priority = priority;
    }

    // Filter by user type
    if (userType === 'logged') {
      where.userId = { not: null };
    } else if (userType === 'guest') {
      where.userId = null;
    }
    
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } },
        { designDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch requests with pagination
    const [requests, total] = await Promise.all([
      prisma.customDesignRequest.findMany({
        where,
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
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.customDesignRequest.count({ where }),
    ]);

    // Add user type information to each request
    const enhancedRequests = requests.map(request => ({
      ...request,
      userType: request.userId ? 'logged' : 'guest',
      customerDisplayName: request.customerName || 
        (request.user ? `${request.user.firstName || ''} ${request.user.lastName || ''}`.trim() : null) ||
        'Unknown Customer',
      customerDisplayEmail: request.customerEmail || request.user?.email || 'No email provided'
    }));

    // Calculate type statistics
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