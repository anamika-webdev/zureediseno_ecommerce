// src/app/api/orders/route.ts - Updated with NextAuth
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import mysql from 'mysql2/promise';

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'your_database_name',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

export async function POST(req: NextRequest) {
  let connection;
  
  try {
    // Check if user is authenticated
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - User must be signed in' },
        { status: 401 }
      );
    }

    // Parse the request body
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

    // Get database connection
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
          payment_method,
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        orderNumber,
        user.id,
        orderData.totalAmount,
        'pending',
        orderData.paymentMethod === 'cod' ? 'pending' : 'pending',
        orderData.paymentMethod || 'cod',
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

      console.log('Order created successfully:', {
        id: orderId,
        orderNumber,
        paymentMethod: orderData.paymentMethod
      });

      // Return success response
      return NextResponse.json({
        success: true,
        message: 'Order created successfully',
        order: {
          id: orderId,
          orderNumber: orderNumber,
          status: 'pending',
          paymentStatus: orderData.paymentMethod === 'cod' ? 'pending' : 'pending',
          paymentMethod: orderData.paymentMethod,
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
    console.error('Error creating order:', error);
    
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

// GET endpoint to fetch orders (for user's own orders)
export async function GET(req: NextRequest) {
  let connection;
  
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get('admin') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    connection = await pool.getConnection();

    let query = `
      SELECT 
        o.*,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
    `;
    
    let queryParams = [];
    
    // If not admin, filter by user
    if (!isAdmin || user.role !== 'ADMIN') {
      query += ` WHERE o.user_id = ?`;
      queryParams.push(user.id);
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
    let countParams = [];
    
    if (!isAdmin || user.role !== 'ADMIN') {
      countQuery += ` WHERE o.user_id = ?`;
      countParams.push(user.id);
    }

    const [countResult] = await connection.execute(countQuery, countParams);
    const totalOrders = (countResult as any)[0].total;

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total: totalOrders,
        totalPages: Math.ceil(totalOrders / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    
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