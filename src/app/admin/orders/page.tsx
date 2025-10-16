// src/app/admin/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  Edit,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Shield,
  AlertCircle,
  Calendar,
  IndianRupee,
  TrendingUp,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  image_url?: string;
}

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

export default function AdminOrdersPage() {
  const { user, loading: authLoading, isAuthenticated, isAdmin } = useAdminAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Check authentication and admin access
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/signin?redirect=/admin/orders');
        return;
      }
      
      if (!isAdmin) {
        router.push('/');
        return;
      }
      
      fetchOrders();
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/orders?page=${page}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/items`);
      if (response.ok) {
        const data = await response.json();
        setOrderItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching order items:', error);
      setOrderItems([]);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Refresh orders
      await fetchOrders(currentPage);
      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const updatePaymentStatus = async (orderId: number, newPaymentStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }

      // Refresh orders
      await fetchOrders(currentPage);
      toast.success('Payment status updated successfully');
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    fetchOrderItems(order.id);
    setIsDialogOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'secondary';
      case 'confirmed': return 'default';
      case 'processing': return 'outline';
      case 'shipped': return 'default';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'secondary';
      case 'paid': return 'default';
      case 'failed': return 'destructive';
      case 'refunded': return 'outline';
      default: return 'secondary';
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shipping_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shipping_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Order Management</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchOrders(currentPage)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'delivered').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(orders.reduce((sum, o) => sum + o.total_amount, 0))}
                </p>
              </div>
              <IndianRupee className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order number, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.shipping_name}</div>
                        <div className="text-sm text-muted-foreground">{order.shipping_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{order.item_count} items</TableCell>
                    <TableCell className="font-medium">{formatCurrency(order.total_amount)}</TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {order.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.payment_status}
                        onValueChange={(value) => updatePaymentStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <Badge variant={getPaymentStatusBadgeVariant(order.payment_status)}>
                            {order.payment_status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchOrders(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchOrders(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Order Number:</span> {selectedOrder.order_number}</div>
                    <div><span className="font-medium">Status:</span> <Badge variant={getStatusBadgeVariant(selectedOrder.status)}>{selectedOrder.status}</Badge></div>
                    <div><span className="font-medium">Payment Status:</span> <Badge variant={getPaymentStatusBadgeVariant(selectedOrder.payment_status)}>{selectedOrder.payment_status}</Badge></div>
                    <div><span className="font-medium">Total:</span> {formatCurrency(selectedOrder.total_amount)}</div>
                    <div><span className="font-medium">Order Date:</span> {formatDate(selectedOrder.created_at)}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Shipping Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedOrder.shipping_name}</div>
                    <div><span className="font-medium">Email:</span> {selectedOrder.shipping_email}</div>
                    <div><span className="font-medium">Phone:</span> {selectedOrder.shipping_phone}</div>
                    <div><span className="font-medium">Address:</span> {selectedOrder.shipping_address}</div>
                    <div><span className="font-medium">City:</span> {selectedOrder.shipping_city}</div>
                    <div><span className="font-medium">State:</span> {selectedOrder.shipping_state}</div>
                    <div><span className="font-medium">Pincode:</span> {selectedOrder.shipping_pincode}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.image_url && (
                              <img 
                                src={item.image_url} 
                                alt={item.product_name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            )}
                            <div>
                              <div className="font-medium">{item.product_name}</div>
                              {(item.size || item.color) && (
                                <div className="text-sm text-muted-foreground">
                                  {item.size && `Size: ${item.size}`}
                                  {item.size && item.color && ', '}
                                  {item.color && `Color: ${item.color}`}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.price)}</TableCell>
                        <TableCell>{formatCurrency(item.price * item.quantity)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}