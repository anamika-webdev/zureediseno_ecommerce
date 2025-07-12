// hooks/useRealTimeAdminData.ts - Fixed implementation using Server-Sent Events
import { useState, useEffect, useRef, useCallback } from 'react';

interface Order {
  id: number;
  order_number: string;
  user_id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  shipping_country: string;
  created_at: string;
  updated_at: string;
  item_count: number;
}

interface Customer {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  role: string;
  createdAt: string;
  lastLoginAt?: string;
  totalOrders: number;
  totalSpent: number;
  imageUrl?: string; // ✅ Added missing property
}

interface Payment {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  paymentMethod: string;
  status: string;
  transactionId?: string;
  gatewayResponse?: any;
  createdAt: string;
  updatedAt: string;
}

interface AdminStats {
  orders: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
    todayCount: number;
    todayRevenue: number;
  };
  customers: {
    total: number;
    active: number;
    newToday: number;
    topSpenders: Customer[];
  };
  payments: {
    totalRevenue: number;
    todayRevenue: number;
    successful: number;
    pending: number;
    failed: number;
    successRate: number;
  };
}

interface UseRealTimeAdminDataOptions {
  refreshInterval?: number; // milliseconds
  enableSSE?: boolean; // Use Server-Sent Events instead of WebSocket
  enableOrderUpdates?: boolean;
  enableCustomerUpdates?: boolean;
  enablePaymentUpdates?: boolean;
}

export function useRealTimeAdminData(options: UseRealTimeAdminDataOptions = {}) {
  const {
    refreshInterval = 30000, // 30 seconds
    enableSSE = true,
    enableOrderUpdates = true,
    enableCustomerUpdates = true,
    enablePaymentUpdates = true,
  } = options;

  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    orders: {
      total: 0,
      pending: 0,
      processing: 0,
      completed: 0,
      cancelled: 0,
      todayCount: 0,
      todayRevenue: 0,
    },
    customers: {
      total: 0,
      active: 0,
      newToday: 0,
      topSpenders: [],
    },
    payments: {
      totalRevenue: 0,
      todayRevenue: 0,
      successful: 0,
      pending: 0,
      failed: 0,
      successRate: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);

  // Refs
  const eventSourceRef = useRef<EventSource | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch functions
  const fetchOrders = useCallback(async (showLoading = false) => {
    if (!enableOrderUpdates) return;
    
    try {
      if (showLoading) setLoading(true);
      
      const response = await fetch('/api/admin/orders?limit=50');
      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      if (showLoading) {
        setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      }
    }
  }, [enableOrderUpdates]);

  const fetchCustomers = useCallback(async (showLoading = false) => {
    if (!enableCustomerUpdates) return;
    
    try {
      if (showLoading) setLoading(true);
      
      const response = await fetch('/api/admin/customers?limit=50');
      if (!response.ok) throw new Error('Failed to fetch customers');
      
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
      if (showLoading) {
        setError(err instanceof Error ? err.message : 'Failed to fetch customers');
      }
    }
  }, [enableCustomerUpdates]);

  const fetchPayments = useCallback(async (showLoading = false) => {
    if (!enablePaymentUpdates) return;
    
    try {
      if (showLoading) setLoading(true);
      
      const response = await fetch('/api/admin/payments?limit=50');
      if (!response.ok) throw new Error('Failed to fetch payments');
      
      const data = await response.json();
      setPayments(data.payments || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
      if (showLoading) {
        setError(err instanceof Error ? err.message : 'Failed to fetch payments');
      }
    }
  }, [enablePaymentUpdates]);

  const fetchStats = useCallback(async () => {
    try {
      const requests = [];
      
      if (enableOrderUpdates) {
        requests.push(fetch('/api/admin/orders/stats'));
      }
      if (enableCustomerUpdates) {
        requests.push(fetch('/api/admin/customers/stats'));
      }
      if (enablePaymentUpdates) {
        requests.push(fetch('/api/admin/payments/stats'));
      }

      const responses = await Promise.all(requests);
      const data = await Promise.all(
        responses.map(res => res.ok ? res.json() : { stats: {} })
      );

      let orderStats = stats.orders;
      let customerStats = stats.customers;
      let paymentStats = stats.payments;

      let dataIndex = 0;
      if (enableOrderUpdates) {
        orderStats = data[dataIndex].stats || stats.orders;
        dataIndex++;
      }
      if (enableCustomerUpdates) {
        customerStats = data[dataIndex].stats || stats.customers;
        dataIndex++;
      }
      if (enablePaymentUpdates) {
        paymentStats = data[dataIndex].stats || stats.payments;
      }

      setStats({
        orders: orderStats,
        customers: customerStats,
        payments: paymentStats,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [enableOrderUpdates, enableCustomerUpdates, enablePaymentUpdates, stats]);

  // Fetch all data
  const fetchAllData = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      await Promise.all([
        fetchOrders(false),
        fetchCustomers(false),
        fetchPayments(false),
        fetchStats(),
      ]);

      setLastUpdated(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [fetchOrders, fetchCustomers, fetchPayments, fetchStats]);

  // Server-Sent Events setup
  useEffect(() => {
    if (!enableSSE) return;

    const connectSSE = () => {
      try {
        eventSourceRef.current = new EventSource('/api/ws/admin');

        eventSourceRef.current.onopen = () => {
          console.log('SSE connected');
          setIsConnected(true);
          setError(null);
        };

        eventSourceRef.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            switch (message.type) {
              case 'order_update':
                if (enableOrderUpdates) {
                  setOrders(prev => prev.map(order => 
                    order.id === message.data.id 
                      ? { ...order, ...message.data }
                      : order
                  ));
                }
                break;
                
              case 'new_order':
                if (enableOrderUpdates) {
                  setOrders(prev => [message.data, ...prev]);
                }
                break;
                
              case 'customer_update':
                if (enableCustomerUpdates) {
                  setCustomers(prev => prev.map(customer => 
                    customer.id === message.data.id 
                      ? { ...customer, ...message.data }
                      : customer
                  ));
                }
                break;
                
              case 'new_customer':
                if (enableCustomerUpdates) {
                  setCustomers(prev => [message.data, ...prev]);
                }
                break;
                
              case 'payment_update':
                if (enablePaymentUpdates) {
                  setPayments(prev => prev.map(payment => 
                    payment.id === message.data.id 
                      ? { ...payment, ...message.data }
                      : payment
                  ));
                }
                break;
                
              case 'new_payment':
                if (enablePaymentUpdates) {
                  setPayments(prev => [message.data, ...prev]);
                }
                break;
                
              case 'connected':
                console.log('SSE connection confirmed:', message.connectionId);
                break;
                
              case 'ping':
                // Keep-alive received
                break;
            }
            
            setLastUpdated(new Date().toISOString());
          } catch (err) {
            console.error('Error parsing SSE message:', err);
          }
        };

        eventSourceRef.current.onerror = () => {
          console.error('SSE connection error');
          setIsConnected(false);
          setError('Connection lost. Attempting to reconnect...');
          
          // Close current connection
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
          }
          
          // Attempt to reconnect after 5 seconds
          setTimeout(connectSSE, 5000);
        };
      } catch (err) {
        console.error('Error setting up SSE:', err);
        setIsConnected(false);
        setError('Failed to establish real-time connection');
      }
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [enableSSE, enableOrderUpdates, enableCustomerUpdates, enablePaymentUpdates]);

  // Polling setup (fallback when SSE is disabled)
  useEffect(() => {
    if (refreshInterval > 0 && !enableSSE) {
      intervalRef.current = setInterval(() => {
        fetchAllData(false);
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refreshInterval, enableSSE, fetchAllData]);

  // Initial fetch
  useEffect(() => {
    fetchAllData(true);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Manual refresh function
  const refreshData = useCallback(async () => {
    await fetchAllData(true);
  }, [fetchAllData]);

  // Update functions
  const updateOrder = useCallback(async (orderId: number, updates: Partial<Order>) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update order');

      const data = await response.json();
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, ...data.order } : order
      ));

      return true;
    } catch (err) {
      console.error('Error updating order:', err);
      return false;
    }
  }, []);

  const updateCustomer = useCallback(async (customerId: string, updates: Partial<Customer>) => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update customer');

      const data = await response.json();
      setCustomers(prev => prev.map(customer => 
        customer.id === customerId ? { ...customer, ...data.customer } : customer
      ));

      return true;
    } catch (err) {
      console.error('Error updating customer:', err);
      return false;
    }
  }, []);

  return {
    // Data
    orders,
    customers,
    payments,
    stats,
    
    // State
    loading,
    error,
    lastUpdated,
    isConnected,
    
    // Actions
    refreshData,
    updateOrder,
    updateCustomer,
    
    // Individual fetchers
    fetchOrders: () => fetchOrders(true),
    fetchCustomers: () => fetchCustomers(true),
    fetchPayments: () => fetchPayments(true),
  };
}