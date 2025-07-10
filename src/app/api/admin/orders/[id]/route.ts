// src/app/api/admin/orders/[id]/route.ts
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection;
  
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    connection = await pool.getConnection();

    // Get order details with items
    const [orders] = await connection.execute(`
      SELECT * FROM orders WHERE id = ?
    `, [id]);

    if ((orders as any).length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = (orders as any)[0];

    // Get order items
    const [items] = await connection.execute(`
      SELECT * FROM order_items WHERE order_id = ? ORDER BY created_at ASC
    `, [id]);

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        items: items
      }
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection;
  
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { status, paymentStatus } = body;

    connection = await pool.getConnection();

    // Build update query dynamically
    const updateFields = [];
    const updateParams = [];

    if (status) {
      updateFields.push('status = ?');
      updateParams.push(status);
    }

    if (paymentStatus) {
      updateFields.push('payment_status = ?');
      updateParams.push(paymentStatus);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Add updated_at timestamp
    updateFields.push('updated_at = NOW()');
    updateParams.push(id);

    const updateQuery = `
      UPDATE orders 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `;

    await connection.execute(updateQuery, updateParams);

    // Get updated order
    const [orders] = await connection.execute(`
      SELECT * FROM orders WHERE id = ?
    `, [id]);

    const updatedOrder = (orders as any)[0];

    return NextResponse.json({
      success: true,
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection;
  
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    connection = await pool.getConnection();

    // Start transaction
    await connection.beginTransaction();

    try {
      // Delete order items first (foreign key constraint)
      await connection.execute(`
        DELETE FROM order_items WHERE order_id = ?
      `, [id]);

      // Delete the order
      const [result] = await connection.execute(`
        DELETE FROM orders WHERE id = ?
      `, [id]);

      if ((result as any).affectedRows === 0) {
        await connection.rollback();
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: 'Order deleted successfully'
      });

    } catch (transactionError) {
      await connection.rollback();
      throw transactionError;
    }

  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}