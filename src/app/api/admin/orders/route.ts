// src/app/api/orders/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'zureediesno_ecommerce',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    connection = await pool.getConnection();

    // FIXED: Use correct column names that match your database
    let query = `
      SELECT 
        o.id,
        o.order_number,
        o.user_id,
        o.total_amount,
        o.status,
        o.payment_status,
        o.payment_method,
        o.shipping_name,
        o.shipping_email,
        o.shipping_phone,
        o.shipping_address,
        o.shipping_city,
        o.shipping_state,
        o.shipping_pincode,
        o.shipping_country,
        o.created_at,
        o.updated_at,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ?
      GROUP BY o.id 
      ORDER BY o.created_at DESC 
      LIMIT ? OFFSET ?
    `;

    const [orders] = await connection.execute(query, [user.id, limit, offset]);

    // Get total count for pagination
    const [countResult] = await connection.execute(`
      SELECT COUNT(*) as total FROM orders WHERE user_id = ?
    `, [user.id]);
    
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

// POST endpoint to create orders
export async function POST(req: NextRequest) {
  let connection;
  
  try {
    const user = await getCurrentUser();
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
      // Insert order - FIXED: use correct column names
      const [orderResult] = await connection.execute(`
        INSERT INTO orders (
          id,
          order_number,
          user_id,
          guest_order,
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate ID
        orderNumber,
        user ? user.id : null,
        user ? false : true, // guest_order flag
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
        orderData.shippingAddress.country || 'India'
      ]);

      const orderId = (orderResult as any).insertId;

      // Insert order items - FIXED: use correct column names
      for (const item of orderData.items) {
        await connection.execute(`
          INSERT INTO order_items (
            id,
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
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate ID
          orderId,
          item.productId || null,
          item.name,
          item.slug || '',
          item.quantity,
          item.price,
          item.size || null,
          item.color || null,
          item.image || null
        ]);
      }

      // Commit transaction
      await connection.commit();

      console.log('Order created successfully:', {
        id: orderId,
        orderNumber,
        paymentMethod: orderData.paymentMethod
      });

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