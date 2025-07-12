// app/api/ws/admin/route.ts - Fixed WebSocket implementation using Server-Sent Events
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// Store for SSE connections
interface SSEConnection {
  id: string;
  controller: ReadableStreamDefaultController;
  subscriptions: Set<string>;
}

class AdminSSEManager {
  private static instance: AdminSSEManager;
  private connections: Map<string, SSEConnection> = new Map();

  private constructor() {}

  static getInstance(): AdminSSEManager {
    if (!AdminSSEManager.instance) {
      AdminSSEManager.instance = new AdminSSEManager();
    }
    return AdminSSEManager.instance;
  }

  addConnection(id: string, controller: ReadableStreamDefaultController) {
    this.connections.set(id, {
      id,
      controller,
      subscriptions: new Set(['orders', 'customers', 'payments'])
    });
  }

  removeConnection(id: string) {
    this.connections.delete(id);
  }

  broadcast(topic: string, data: any) {
    const message = `data: ${JSON.stringify({
      type: topic,
      data,
      timestamp: new Date().toISOString()
    })}\n\n`;

    this.connections.forEach((connection) => {
      if (connection.subscriptions.has(topic)) {
        try {
          connection.controller.enqueue(new TextEncoder().encode(message));
        } catch (error) {
          console.error(`Error sending to connection ${connection.id}:`, error);
          this.removeConnection(connection.id);
        }
      }
    });
  }

  // Public methods for broadcasting updates
  broadcastOrderUpdate(orderId: string, orderData: any) {
    this.broadcast('order_update', { id: orderId, ...orderData });
  }

  broadcastNewOrder(orderData: any) {
    this.broadcast('new_order', orderData);
  }

  broadcastCustomerUpdate(customerId: string, customerData: any) {
    this.broadcast('customer_update', { id: customerId, ...customerData });
  }

  broadcastNewCustomer(customerData: any) {
    this.broadcast('new_customer', customerData);
  }

  broadcastPaymentUpdate(paymentId: string, paymentData: any) {
    this.broadcast('payment_update', { id: paymentId, ...paymentData });
  }

  broadcastNewPayment(paymentData: any) {
    this.broadcast('new_payment', paymentData);
  }

  getConnectionCount(): number {
    return this.connections.size;
  }
}

// Export singleton instance
export const adminSSEManager = AdminSSEManager.getInstance();

// API route handler for Server-Sent Events
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const connectionId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const stream = new ReadableStream({
      start(controller) {
        // Add connection
        adminSSEManager.addConnection(connectionId, controller);

        // Send initial connection message
        const initialMessage = `data: ${JSON.stringify({
          type: 'connected',
          connectionId,
          timestamp: new Date().toISOString()
        })}\n\n`;
        
        controller.enqueue(new TextEncoder().encode(initialMessage));

        // Send keep-alive every 30 seconds
        const keepAlive = setInterval(() => {
          try {
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'ping',
              timestamp: new Date().toISOString()
            })}\n\n`));
          } catch (error) {
            clearInterval(keepAlive);
            adminSSEManager.removeConnection(connectionId);
          }
        }, 30000);

        // Cleanup on close
        request.signal.addEventListener('abort', () => {
          clearInterval(keepAlive);
          adminSSEManager.removeConnection(connectionId);
        });
      },
      cancel() {
        adminSSEManager.removeConnection(connectionId);
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });
  } catch (error) {
    console.error('SSE connection error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Utility functions for triggering updates from other parts of the app
export async function notifyOrderUpdate(orderId: string, updates: any) {
  adminSSEManager.broadcastOrderUpdate(orderId, updates);
}

export async function notifyNewOrder(orderData: any) {
  adminSSEManager.broadcastNewOrder(orderData);
}

export async function notifyCustomerUpdate(customerId: string, updates: any) {
  adminSSEManager.broadcastCustomerUpdate(customerId, updates);
}

export async function notifyNewCustomer(customerData: any) {
  adminSSEManager.broadcastNewCustomer(customerData);
}

export async function notifyPaymentUpdate(paymentId: string, updates: any) {
  adminSSEManager.broadcastPaymentUpdate(paymentId, updates);
}

export async function notifyNewPayment(paymentData: any) {
  adminSSEManager.broadcastNewPayment(paymentData);
}