// src/app/api/orders/track/route.ts
import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const { orderNumber, email } = await request.json();

    if (!orderNumber || !email) {
      return NextResponse.json(
        { error: 'Order number and email are required' },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    // Search for order by order number and email
    const [orders] = await connection.execute(`
      SELECT 
        o.*,
        GROUP_CONCAT(
          JSON_OBJECT(
            'name', oi.product_name,
            'quantity', oi.quantity,
            'price', oi.price,
            'size', oi.size,
            'color', oi.color
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.order_number = ? AND o.shipping_email = ?
      GROUP BY o.id
    `, [orderNumber, email]);

    if ((orders as any).length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = (orders as any)[0];
    
    // Parse items JSON
    let items = [];
    if (order.items) {
      try {
        const itemsArray = order.items.split(',');
        items = itemsArray.map((item: string) => JSON.parse(item));
      } catch (error) {
        console.error('Error parsing order items:', error);
        items = [];
      }
    }

    const orderDetails = {
      orderNumber: order.order_number,
      email: order.shipping_email,
      orderDate: order.created_at,
      totalAmount: parseFloat(order.total_amount),
      paymentMethod: order.payment_method || 'cod',
      status: order.status || 'pending',
      items: items,
      shippingAddress: {
        fullName: order.shipping_name,
        address: order.shipping_address,
        city: order.shipping_city,
        state: order.shipping_state,
        pincode: order.shipping_pincode,
      }
    };

    return NextResponse.json({
      success: true,
      order: orderDetails
    });

  } catch (error) {
    console.error('Error tracking order:', error);
    
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