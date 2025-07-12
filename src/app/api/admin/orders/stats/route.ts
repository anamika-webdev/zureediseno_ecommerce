// app/api/admin/orders/stats/route.ts - Fixed version with correct imports
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all orders count by status
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
      cancelledOrders,
      todayOrders,
      todayRevenue
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.count({ where: { status: 'processing' } }),
      prisma.order.count({ where: { status: 'delivered' } }),
      prisma.order.count({ where: { status: 'cancelled' } }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        },
        _sum: {
          totalAmount: true
        }
      })
    ]);

    const stats = {
      total: totalOrders,
      pending: pendingOrders,
      processing: processingOrders,
      completed: completedOrders,
      cancelled: cancelledOrders,
      todayCount: todayOrders,
      todayRevenue: todayRevenue._sum.totalAmount || 0
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching order stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order stats' },
      { status: 500 }
    );
  }
}