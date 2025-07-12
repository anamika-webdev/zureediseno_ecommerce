// src/app/api/admin/orders/stats/route.ts - Fixed version
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Get query parameters for date filtering
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const period = searchParams.get('period') || '30d' // 7d, 30d, 90d, 1y

    // Calculate date range based on period
    const now = new Date()
    let dateFilter: any = {}

    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }
    } else {
      // Default period-based filtering
      const daysAgo = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365
      const startOfPeriod = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000))
      
      dateFilter = {
        createdAt: {
          gte: startOfPeriod
        }
      }
    }

    // Get total orders count
    const totalOrders = await prisma.order.count({
      where: dateFilter
    })

    // Get orders by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      where: dateFilter,
      _count: {
        id: true
      }
    })

    // Get revenue statistics
    const revenueStats = await prisma.order.aggregate({
      where: {
        ...dateFilter,
        paymentStatus: 'completed'
      },
      _sum: {
        totalAmount: true
      },
      _avg: {
        totalAmount: true
      },
      _count: {
        id: true
      }
    })

    // Get daily orders for chart (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))
    const dailyOrders = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: {
        id: true
      },
      _sum: {
        totalAmount: true
      }
    })

    // Process daily data for chart
    const chartData = dailyOrders.map(day => ({
      date: day.createdAt.toISOString().split('T')[0],
      orders: day._count.id,
      revenue: day._sum.totalAmount || 0
    }))

    // Get top products (most ordered)
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productName'],
      where: {
        order: dateFilter
      },
      _sum: {
        quantity: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 10
    })

    // Get pending orders count
    const pendingOrders = await prisma.order.count({
      where: {
        ...dateFilter,
        status: 'pending'
      }
    })

    // Get payment method statistics
    const paymentMethods = await prisma.order.groupBy({
      by: ['paymentMethod'],
      where: dateFilter,
      _count: {
        id: true
      }
    })

    // Calculate growth rate (compare with previous period)
    const previousPeriodStart = new Date(thirtyDaysAgo.getTime() - (30 * 24 * 60 * 60 * 1000))
    const previousPeriodOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: previousPeriodStart,
          lt: thirtyDaysAgo
        }
      }
    })

    const currentPeriodOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    const growthRate = previousPeriodOrders > 0 
      ? ((currentPeriodOrders - previousPeriodOrders) / previousPeriodOrders) * 100 
      : 0

    return NextResponse.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        ordersByStatus: ordersByStatus.map(item => ({
          status: item.status,
          count: item._count.id
        })),
        revenue: {
          total: revenueStats._sum.totalAmount || 0,
          average: revenueStats._avg.totalAmount || 0,
          orderCount: revenueStats._count.id
        },
        chartData,
        topProducts: topProducts.map(item => ({
          name: item.productName,
          quantity: item._sum.quantity || 0,
          orders: item._count.id
        })),
        paymentMethods: paymentMethods.map(item => ({
          method: item.paymentMethod,
          count: item._count.id
        })),
        growthRate: Math.round(growthRate * 100) / 100,
        period
      }
    })

  } catch (error) {
    console.error('Error fetching order stats:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch order statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}