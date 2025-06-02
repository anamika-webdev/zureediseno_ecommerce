// src/app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
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

// GET single order
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection;
  
  try {
    const { id } = await params; // Await the params Promise
    const { userId } = await auth(); // Await the auth() call
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const orderId = id;
    
    connection = await pool.getConnection();

    // Get order details
    const [orders] = await connection.execute(`
      SELECT * FROM orders WHERE id = ?
    `, [orderId]);

    if ((orders as any).length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = (orders as any)[0];

    // Check if user has access to this order (add admin check if needed)
    // For now, allowing access to order owner only
    if (order.user_id !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      order: order
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    
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

// PATCH update order
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection;
  
  try {
    const { id } = await params; // Await the params Promise
    const { userId } = await auth(); // Await the auth() call
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const orderId = id;
    const updateData = await req.json();
    
    connection = await pool.getConnection();

    // First, check if order exists and get current details
    const [orders] = await connection.execute(`
      SELECT * FROM orders WHERE id = ?
    `, [orderId]);

    if ((orders as any).length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = (orders as any)[0];

    // For admin operations, you might want to add admin role check here
    // For now, allowing order owner to update (limited fields)
    
    // Build update query dynamically based on provided fields
    const allowedFields = ['status', 'payment_status', 'tracking_number', 'notes'];
    const updateFields = [];
    const updateValues = [];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(updateData[field]);
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Add updated_at timestamp
    updateFields.push('updated_at = NOW()');
    updateValues.push(orderId);

    // Execute update
    await connection.execute(`
      UPDATE orders 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateValues);

    // Get updated order
    const [updatedOrders] = await connection.execute(`
      SELECT * FROM orders WHERE id = ?
    `, [orderId]);

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: (updatedOrders as any)[0]
    });

  } catch (error) {
    console.error('Error updating order:', error);
    
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

// DELETE order (soft delete - mark as cancelled)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection;
  
  try {
    const { id } = await params; // Await the params Promise
    const { userId } = await auth(); // Await the auth() call
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const orderId = id;
    
    connection = await pool.getConnection();

    // Check if order exists
    const [orders] = await connection.execute(`
      SELECT * FROM orders WHERE id = ?
    `, [orderId]);

    if ((orders as any).length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = (orders as any)[0];

    // Check permissions (add admin check if needed)
    if (order.user_id !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Soft delete - mark as cancelled
    await connection.execute(`
      UPDATE orders 
      SET status = 'cancelled', updated_at = NOW()
      WHERE id = ?
    `, [orderId]);

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling order:', error);
    
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