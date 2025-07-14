// src/app/api/admin/customers/route.ts - Fixed version
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/adminAuth'; // FIXED: Use getCurrentAdmin
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // FIXED: Check admin authentication
    const user = await getCurrentAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';

    // Build where clause for filtering
    const where: any = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role && role !== 'all') {
      where.role = role;
    }

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    // Fetch customers with order statistics
    const customers = await prisma.user.findMany({
      where,
      include: {
        orders: {
          select: {
            id: true,
            totalAmount: true,
            createdAt: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Transform customers to include computed fields
    const transformedCustomers = customers.map(customer => {
      const orderCount = customer.orders.length;
      const totalSpent = customer.orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const lastOrderDate = customer.orders.length > 0 
        ? customer.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
        : null;

      return {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown',
        role: customer.role,
        imageUrl: customer.imageUrl,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
        orderCount,
        totalSpent,
        lastOrderDate,
        isActive: true, // Default since field might not exist in schema
      };
    });

    return NextResponse.json({
      success: true,
      customers: transformedCustomers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching admin customers:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}