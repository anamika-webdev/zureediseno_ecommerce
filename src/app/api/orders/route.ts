// src/app/api/orders/route.ts - Fixed Customer Orders API
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// Mock function to simulate database connection
// Replace this with your actual database connection
async function getOrdersFromDatabase(userId: string) {
  // This is a mock implementation
  // Replace with your actual database query
  try {
    // Mock orders data - replace with actual database query
    const mockOrders = [
      {
        id: '1',
        orderNumber: 'ORD-2024-001',
        userId: userId,
        totalAmount: 2499.00,
        status: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'razorpay',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-18T14:20:00Z',
        items: [
          {
            id: '1',
            productName: 'Cotton T-Shirt',
            quantity: 2,
            price: 799.00,
            size: 'M',
            color: 'Blue',
            imageUrl: '/uploads/tshirt-blue.jpg'
          },
          {
            id: '2',
            productName: 'Denim Jeans',
            quantity: 1,
            price: 1499.00,
            size: '32',
            color: 'Dark Blue',
            imageUrl: '/uploads/jeans-dark.jpg'
          }
        ],
        shippingAddress: {
          fullName: 'John Doe',
          address: '123 Main Street, Apartment 4B',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India'
        }
      }
    ];

    return mockOrders;
    
    // Real database implementation would look like:
    /*
    const connection = await pool.getConnection();
    try {
      const [orders] = await connection.execute(`
        SELECT 
          o.id,
          o.order_number as orderNumber,
          o.total_amount as totalAmount,
          o.status,
          o.payment_status as paymentStatus,
          o.payment_method as paymentMethod,
          o.created_at as createdAt,
          o.updated_at as updatedAt,
          o.shipping_name as shippingName,
          o.shipping_address as shippingAddress,
          o.shipping_city as shippingCity,
          o.shipping_state as shippingState,
          o.shipping_pincode as shippingPincode,
          o.shipping_country as shippingCountry
        FROM orders o 
        WHERE o.user_id = ? 
        ORDER BY o.created_at DESC
      `, [userId]);

      // Fetch items for each order
      for (const order of orders as any[]) {
        const [items] = await connection.execute(`
          SELECT 
            oi.id,
            oi.product_name as productName,
            oi.quantity,
            oi.price,
            oi.size,
            oi.color,
            oi.image_url as imageUrl
          FROM order_items oi 
          WHERE oi.order_id = ?
        `, [order.id]);
        
        order.items = items;
        order.shippingAddress = {
          fullName: order.shippingName,
          address: order.shippingAddress,
          city: order.shippingCity,
          state: order.shippingState,
          pincode: order.shippingPincode,
          country: order.shippingCountry
        };
      }

      return orders;
    } finally {
      connection.release();
    }
    */
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch orders from database');
  }
}

// GET endpoint to fetch customer's orders
export async function GET(req: NextRequest) {
  try {
    console.log('📦 Customer orders API called');
    
    // Get current user
    const user = await getCurrentUser();
    
    if (!user) {
      console.log('❌ Unauthorized access to orders');
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to view orders' },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', user.id);

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log('📄 Fetching orders - Page:', page, 'Limit:', limit);

    // Fetch orders from database
    const orders = await getOrdersFromDatabase(user.id);
    
    console.log('✅ Orders fetched successfully:', orders.length);

    return NextResponse.json({
      success: true,
      orders: orders || [],
      pagination: {
        page,
        limit,
        total: orders.length,
        totalPages: Math.ceil(orders.length / limit)
      }
    });

  } catch (error) {
    console.error('❌ Error in customer orders API:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST endpoint for creating orders (existing functionality)
export async function POST(req: NextRequest) {
  try {
    console.log('🛒 Create order API called');
    
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Here you would typically:
    // 1. Start a database transaction
    // 2. Insert order record
    // 3. Insert order items
    // 4. Update product inventory
    // 5. Send confirmation email
    // 6. Commit transaction

    console.log('✅ Order created successfully:', orderNumber);

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: Date.now().toString(),
        orderNumber: orderNumber,
        status: 'pending',
        paymentStatus: orderData.paymentMethod === 'cod' ? 'pending' : 'pending',
        paymentMethod: orderData.paymentMethod,
        totalAmount: orderData.totalAmount,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error creating order:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}