// src/app/dashboard/page.tsx - Fixed as direct client component
'use client';

import { useAdminAuth } from '@/context/AdminAuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity,
  Calendar,
  RefreshCw
} from 'lucide-react';

interface DashboardStats {
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  totalRevenue: number;
  recentOrders: any[];
  pendingOrders: number;
}

export default function DashboardPage() {
  const { user, loading: authLoading, isAuthenticated, isAdmin } = useAdminAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    recentOrders: [],
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/signin');
        return;
      }
      
      if (user?.role === 'USER') {
        router.push('/');
        return;
      }
      
      fetchDashboardStats();
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard statistics
      const [ordersRes, productsRes] = await Promise.all([
        fetch('/api/admin/orders?limit=5'),
        fetch('/api/admin/products?limit=1')
      ]);

      const ordersData = ordersRes.ok ? await ordersRes.json() : { orders: [], pagination: { total: 0 } };
      const productsData = productsRes.ok ? await productsRes.json() : { pagination: { total: 0 } };

      // Calculate stats
      const totalRevenue = ordersData.orders?.reduce((sum: number, order: any) => sum + order.total_amount, 0) || 0;
      const pendingOrders = ordersData.orders?.filter((order: any) => order.status === 'pending').length || 0;

      setStats({
        totalOrders: ordersData.pagination?.total || 0,
        totalProducts: productsData.pagination?.total || 0,
        totalCustomers: 0, // You can implement this when you have customers API
        totalRevenue,
        recentOrders: ordersData.orders?.slice(0, 5) || [],
        pendingOrders
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
          </h1>
          <p className="text-gray-600">Welcome back, {user?.name || user?.firstName}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardStats}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingOrders} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Active products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From {stats.totalOrders} orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-gray-600">{order.shipping_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.total_amount)}</p>
                      <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent orders</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isAdmin && (
                <>
                  <button
                    onClick={() => router.push('/dashboard/admin/products')}
                    className="w-full flex items-center gap-3 p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Package className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Manage Products</p>
                      <p className="text-sm text-gray-600">Add, edit, or remove products</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => router.push('/dashboard/admin/orders')}
                    className="w-full flex items-center gap-3 p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ShoppingCart className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">View Orders</p>
                      <p className="text-sm text-gray-600">Process and manage orders</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => router.push('/dashboard/admin/customers')}
                    className="w-full flex items-center gap-3 p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Users className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Customer Management</p>
                      <p className="text-sm text-gray-600">View and manage customers</p>
                    </div>
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}