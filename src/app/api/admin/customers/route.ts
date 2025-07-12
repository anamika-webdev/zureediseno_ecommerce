// app/api/admin/customers/route.ts - Real-time database implementation
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyCustomerUpdate, notifyNewCustomer } from '@/app/api/ws/admin/route';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';

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

    // Note: isActive field doesn't exist in your schema, so we'll simulate it
    // You may need to add this field to your User model if needed

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

    // Transform data with calculated statistics
    const transformedCustomers = customers.map(customer => {
      const orders = customer.orders || [];
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const completedOrders = orders.filter(order => order.status === 'delivered');
      
      return {
        id: customer.id,
        name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: null, // Add phone field to User model if needed
        isActive: true, // Add isActive field to User model if needed
        role: customer.role,
        createdAt: customer.createdAt.toISOString(),
        lastLoginAt: null, // Add lastLoginAt field to User model if needed
        totalOrders,
        totalSpent,
        averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
        lastOrderDate: orders.length > 0 ? orders[0].createdAt.toISOString() : null,
        imageUrl: customer.imageUrl
      };
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      customers: transformedCustomers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const customerData = await request.json();

    // Create new customer
    const newCustomer = await prisma.user.create({
      data: {
        email: customerData.email,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        role: customerData.role || 'USER',
        imageUrl: customerData.imageUrl
      }
    });

    // Transform for response
    const transformedCustomer = {
      id: newCustomer.id,
      name: `${newCustomer.firstName || ''} ${newCustomer.lastName || ''}`.trim() || newCustomer.email,
      firstName: newCustomer.firstName,
      lastName: newCustomer.lastName,
      email: newCustomer.email,
      phone: null,
      isActive: true,
      role: newCustomer.role,
      createdAt: newCustomer.createdAt.toISOString(),
      lastLoginAt: null,
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      lastOrderDate: null,
      imageUrl: newCustomer.imageUrl
    };

    // Notify real-time subscribers about new customer
    await notifyNewCustomer(transformedCustomer);

    return NextResponse.json({
      success: true,
      customer: transformedCustomer,
      message: 'Customer created successfully'
    });

  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}