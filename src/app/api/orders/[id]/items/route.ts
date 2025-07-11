// src/app/api/orders/[id]/items/route.ts - Updated with NextAuth
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
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection;
  
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const orderId = id;
    
    connection = await pool.getConnection();

    // Get order items
    const [items] = await connection.execute(`
      SELECT 
        oi.*,
        o.user_id
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.order_id = ?
      ORDER BY oi.created_at ASC
    `, [orderId]);

    // Check if user has access to this order (either owner or admin)
    if ((items as any).length > 0) {
      const orderUserId = (items as any)[0].user_id;
      // Allow access if user owns the order or is admin
      if (orderUserId !== user.id && user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      items: items
    });

  } catch (error) {
    console.error('Error fetching order items:', error);
    
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