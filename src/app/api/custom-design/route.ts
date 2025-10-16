// src/app/api/custom-design/route.ts - COMPLETE FIXED VERSION WITH DUAL AUTH
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getCurrentAdmin } from '@/lib/adminAuth';
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

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'custom-designs');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filepath = path.join(uploadsDir, filename);

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

// POST - Create new custom design request (PUBLIC - No auth required)
export async function POST(req: NextRequest) {
  try {
    console.log('📨 Custom design request received');

    const formData = await req.formData();

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

    // Validate required fields
    if (!phoneNumber || !designDescription) {
      return NextResponse.json(
        { success: false, error: 'Phone number and design description are required' },
        { status: 400 }
      );
    }

    const measurements = measurementsJson ? JSON.parse(measurementsJson) : null;

    let imageUrl = null;
    let imageName = null;
    const imageFile = formData.get('image') as File | null;

    if (imageFile && imageFile.size > 0) {
      console.log('📸 Processing image upload:', imageFile.name);
      const uploadResult = await handleImageUpload(imageFile);
      imageUrl = uploadResult.url;
      imageName = uploadResult.filename;
      console.log('✅ Image uploaded:', imageUrl);
    }

    const isLoggedUser = userType === 'logged' && userId;
    const finalUserId = isLoggedUser ? userId : null;

    const requestId = `CD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const customDesignRequest = await prisma.customDesignRequest.create({
      data: {
        customerName,
        customerEmail,
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

    console.log('✅ Custom design request saved:', customDesignRequest.id);

    // Send emails (optional)
    try {
      if (process.env.EMAIL_USER && process.env.ADMIN_EMAIL) {
        const transporter = createTransporter();
        
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.ADMIN_EMAIL,
          subject: `🎨 New Custom Design Request - ${requestId}`,
          text: `New custom design request received from ${customerName || 'Guest'}`,
        });

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

// GET - Fetch custom design requests (ADMIN ONLY - Auth required)
export async function GET(req: NextRequest) {
  try {
    console.log('🔍 GET /api/custom-design - Request received');

    // ⚠️ CRITICAL: Check BOTH admin session and regular session
    // Try admin session first (for admin portal users)
    let currentUser: any = await getCurrentAdmin();
    let authType = 'admin-session';
    
    // If no admin session, try regular user session
    if (!currentUser) {
      currentUser = await getCurrentUser();
      authType = 'user-session';
    }

    console.log('👤 Authentication check:', currentUser ? {
      id: currentUser.id,
      email: currentUser.email,
      role: currentUser.role,
      authType
    } : 'No user session found (checked both admin and user sessions)');

    // Verify user is authenticated
    if (!currentUser) {
      console.log('❌ Authentication failed: No session found');
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication required',
          message: 'Please login to access custom design requests. You need to be logged in as an ADMIN or SELLER.'
        },
        { status: 401 }
      );
    }

    // Verify user has admin/seller role
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'SELLER' && currentUser.role !== 'SUPER_ADMIN') {
      console.log('❌ Authorization failed: User role is', currentUser.role);
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized',
          message: `Access denied. Your role (${currentUser.role}) does not have permission to view custom design requests. Required role: ADMIN or SELLER.`
        },
        { status: 403 }
      );
    }

    console.log(`✅ User authenticated via ${authType} and authorized:`, currentUser.role);

    const { searchParams } = new URL(req.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const userType = searchParams.get('userType');
    const search = searchParams.get('search');

    console.log('🔍 Query params:', { page, limit, status, priority, userType, search });

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

    console.log('📊 Fetching from database with filters:', where);

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

    console.log(`📊 Database returned: ${requests.length} requests out of ${total} total`);

    // Enhance requests with display names
    const enhancedRequests = requests.map(request => ({
      ...request,
      userType: request.userId ? 'logged' as const : 'guest' as const,
      customerDisplayName: request.customerName || 
        (request.user ? `${request.user.firstName || ''} ${request.user.lastName || ''}`.trim() : null) ||
        'Unknown Customer',
      customerDisplayEmail: request.customerEmail || request.user?.email || 'No email provided'
    }));

    const loggedUserRequests = requests.filter(r => r.userId).length;
    const guestRequests = requests.filter(r => !r.userId).length;

    console.log(`✅ Returning response with ${enhancedRequests.length} requests`);

    // IMPORTANT: Return success: true for frontend compatibility
    return NextResponse.json({
      success: true,
      requests: enhancedRequests,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        totalPages: Math.ceil(total / limit), // Added for compatibility
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
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch custom design requests', 
        details: error instanceof Error ? error.message : 'Unknown error',
        message: 'An error occurred while fetching custom design requests'
      },
      { status: 500 }
    );
  }
}