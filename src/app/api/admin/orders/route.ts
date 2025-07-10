// src/app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'your_database_name',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

export async function GET(req: NextRequest) {
  let connection;
  
  try {
    // Check authentication and admin role
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    const status = searchParams.get('status');
    const searchTerm = searchParams.get('search');

    connection = await pool.getConnection();

    // Build the query
    let query = `
      SELECT 
        o.*,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
    `;
    
    let queryParams: any[] = [];
    let whereConditions: string[] = [];
    
    // Add status filter
    if (status && status !== 'all') {
      whereConditions.push('o.status = ?');
      queryParams.push(status);
    }
    
    // Add search filter
    if (searchTerm) {
      whereConditions.push(`(
        o.order_number LIKE ? OR 
        o.shipping_name LIKE ? OR 
        o.shipping_email LIKE ?
      )`);
      const searchPattern = `%${searchTerm}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }
    
    // Add WHERE clause if we have conditions
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    query += ` 
      GROUP BY o.id 
      ORDER BY o.created_at DESC 
      LIMIT ? OFFSET ?
    `;
    queryParams.push(limit, offset);

    const [orders] = await connection.execute(query, queryParams);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(DISTINCT o.id) as total FROM orders o`;
    let countParams: any[] = [];
    
    if (whereConditions.length > 0) {
      countQuery += ` WHERE ${whereConditions.join(' AND ')}`;
      countParams = queryParams.slice(0, -2); // Remove limit and offset
    }

    const [countResult] = await connection.execute(countQuery, countParams);
    const totalOrders = (countResult as any)[0].total;

    return NextResponse.json({
      success: true,
      orders: orders || [],
      pagination: {
        page,
        limit,
        total: totalOrders,
        totalPages: Math.ceil(totalOrders / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching admin orders:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function POST(req: NextRequest) {
  let connection;
  
  try {
    // Check authentication and admin role
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const orderData = await req.json();
    
    // Validate required fields
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    if (!orderData.shippingAddress || !orderData.totalAmount) {
      return NextResponse.json(
        { error: 'Shipping address and total amount are required' },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Start transaction
    await connection.beginTransaction();

    try {
      // Insert order into orders table
      const [orderResult] = await connection.execute(`
        INSERT INTO orders (
          order_number, 
          user_id, 
          total_amount, 
          status, 
          payment_status,
          shipping_name,
          shipping_email,
          shipping_phone,
          shipping_address,
          shipping_city,
          shipping_state,
          shipping_pincode,
          shipping_country,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        orderNumber,
        orderData.userId || user.id, // Use provided userId or current admin user
        orderData.totalAmount,
        orderData.status || 'pending',
        orderData.paymentStatus || 'pending',
        orderData.shippingAddress.fullName,
        orderData.shippingAddress.email,
        orderData.shippingAddress.phone,
        orderData.shippingAddress.address,
        orderData.shippingAddress.city,
        orderData.shippingAddress.state,
        orderData.shippingAddress.pincode,
        orderData.shippingAddress.country
      ]);

      const orderId = (orderResult as any).insertId;

      // Insert order items
      for (const item of orderData.items) {
        await connection.execute(`
          INSERT INTO order_items (
            order_id,
            product_id,
            product_name,
            product_slug,
            quantity,
            price,
            size,
            color,
            image_url,
            created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          orderId,
          item.productId,
          item.name,
          item.slug || '',
          item.quantity,
          item.price,
          item.size || '',
          item.color || '',
          item.image || ''
        ]);
      }

      // Commit transaction
      await connection.commit();

      return NextResponse.json({
        success: true,
        message: 'Order created successfully',
        order: {
          id: orderId,
          orderNumber: orderNumber,
          status: orderData.status || 'pending',
          paymentStatus: orderData.paymentStatus || 'pending',
          totalAmount: orderData.totalAmount,
          createdAt: new Date().toISOString()
        }
      });

    } catch (transactionError) {
      // Rollback transaction on error
      await connection.rollback();
      throw transactionError;
    }

  } catch (error) {
    console.error('Error creating admin order:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}