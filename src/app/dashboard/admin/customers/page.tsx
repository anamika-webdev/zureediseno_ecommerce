"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useRealTimeAdminData } from '@/hooks/useRealTimeAdminData';
import { toast } from 'react-hot-toast';

// Individual UI component imports
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { 
  RefreshCw, 
  Search, 
  Eye, 
  Users, 
  UserPlus, 
  UserCheck,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  ShoppingBag,
  Wifi,
  WifiOff,
  Ban,
  CheckCircle
} from 'lucide-react';

// Types
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
  imageUrl?: string;
}

interface TopSpender {
  id: string;
  name: string;
  totalSpent: number;
}

// Format currency helper
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

// Format date helper
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Safe array access helper - Fixed generic syntax
function safeArrayAccess<T>(array: T[] | undefined, index: number, defaultValue: T | null = null): T | null {
  return (array && Array.isArray(array) && array.length > index) ? array[index] : defaultValue;
}

export default function AdminCustomersPage() {
  const { user, loading: authLoading, isAuthenticated, isAdmin } = useAdminAuth();
  const router = useRouter();
  
  // Use the real-time hook with proper error handling
  const realTimeDataResult = useRealTimeAdminData({
    refreshInterval: 20000,
    enableSSE: true,
    enableOrderUpdates: false,
    enableCustomerUpdates: true,
    enablePaymentUpdates: false,
  });

  // Safe destructuring with fallbacks
  const customers = realTimeDataResult?.customers || [];
  const stats = realTimeDataResult?.stats || {
    customers: {
      total: 0,
      active: 0,
      newToday: 0,
      topSpenders: []
    }
  };
  const loading = realTimeDataResult?.loading || false;
  const error = realTimeDataResult?.error || null;
  const lastUpdated = realTimeDataResult?.lastUpdated || '';
  const isConnected = realTimeDataResult?.isConnected || false;
  const refreshData = realTimeDataResult?.refreshData || (() => {});
  const updateCustomer = realTimeDataResult?.updateCustomer || (async () => false);

  // Local state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const itemsPerPage = 10;

  // Check authentication
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/signin?redirect=/dashboard/admin/customers');
        return;
      }
      
      if (!isAdmin) {
        router.push('/');
        return;
      }
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  // Filter customers with safe array check
  const filteredCustomers = (customers || []).filter((customer: Customer) => {
    const matchesSearch = !searchTerm || 
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || customer.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && customer.isActive) ||
      (statusFilter === 'inactive' && !customer.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Paginate customers
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Fetch customer orders
  const fetchCustomerOrders = async (customerId: string) => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}/orders`);
      if (response.ok) {
        const data = await response.json();
        setCustomerOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      setCustomerOrders([]);
    }
  };

  // Handle customer status toggle
  const handleToggleCustomerStatus = async (customerId: string, isActive: boolean) => {
    try {
      const success = await updateCustomer(customerId, { isActive: !isActive });
      if (success) {
        toast.success(`Customer ${!isActive ? 'activated' : 'deactivated'} successfully`);
      } else {
        toast.error('Failed to update customer status');
      }
    } catch (error) {
      toast.error('Error updating customer status');
    }
  };

  // Handle view customer
  const handleViewCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    await fetchCustomerOrders(customer.id);
    setIsDialogOpen(true);
  };

  // Get status badge variant
  const getStatusBadgeVariant = (isActive: boolean): "default" | "secondary" | "destructive" | "outline" | null | undefined => {
    return isActive ? "default" : "secondary";
  };

  // Safe stats access with defaults
  const safeStats = {
    customers: {
      total: stats?.customers?.total || 0,
      active: stats?.customers?.active || 0,
      newToday: stats?.customers?.newToday || 0,
      topSpenders: stats?.customers?.topSpenders || [],
    }
  };

  // Get top spender safely
  const topSpender = safeArrayAccess<TopSpender>(safeStats.customers.topSpenders, 0);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-gray-600 mt-1">
            Manage customer accounts and view customer analytics
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {new Date(lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">Offline</span>
              </>
            )}
          </div>
          
          <Button onClick={() => refreshData()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.customers.total}</div>
            <p className="text-xs text-muted-foreground">
              {safeStats.customers.newToday} new today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.customers.active}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((safeStats.customers.active / Math.max(safeStats.customers.total, 1)) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Today</CardTitle>
            <UserPlus className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.customers.newToday}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Spender</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topSpender 
                ? formatCurrency(topSpender.totalSpent || 0)
                : formatCurrency(0)
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {topSpender?.name || 'No data'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={(value: string) => setRoleFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="SELLER">Seller</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value: string) => setStatusFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCustomers.map((customer: Customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={customer.imageUrl} alt={customer.name} />
                            <AvatarFallback>
                              {customer.name?.charAt(0) || customer.email?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{customer.name || customer.email}</div>
                            <div className="text-sm text-gray-500">{customer.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{customer.email}</span>
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">{customer.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={customer.role === 'ADMIN' ? 'destructive' : 'outline'}>
                          {customer.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(customer.isActive)}>
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4 text-gray-400" />
                          <span>{customer.totalOrders || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {formatCurrency(customer.totalSpent || 0)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{formatDate(customer.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleViewCustomer(customer)}
                            size="sm"
                            variant="outline"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          {customer.role !== 'ADMIN' && (
                            <Button
                              onClick={() => handleToggleCustomerStatus(customer.id, customer.isActive)}
                              size="sm"
                              variant={customer.isActive ? "destructive" : "default"}
                            >
                              {customer.isActive ? <Ban className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of{' '}
                    {filteredCustomers.length} customers
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      size="sm"
                      variant="outline"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      size="sm"
                      variant="outline"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-500">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'No customers have been registered yet'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details - {selectedCustomer?.name || selectedCustomer?.email}</DialogTitle>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="font-medium">Name:</span>
                      <span className="ml-2">{selectedCustomer.name || 'N/A'}</span>
                    </div>
                    
                    <div>
                      <span className="font-medium">Email:</span>
                      <span className="ml-2">{selectedCustomer.email}</span>
                    </div>
                    
                    {selectedCustomer.phone && (
                      <div>
                        <span className="font-medium">Phone:</span>
                        <span className="ml-2">{selectedCustomer.phone}</span>
                      </div>
                    )}
                    
                    <div>
                      <span className="font-medium">Role:</span>
                      <Badge className="ml-2" variant={selectedCustomer.role === 'ADMIN' ? 'destructive' : 'outline'}>
                        {selectedCustomer.role}
                      </Badge>
                    </div>
                    
                    <div>
                      <span className="font-medium">Status:</span>
                      <Badge className="ml-2" variant={getStatusBadgeVariant(selectedCustomer.isActive)}>
                        {selectedCustomer.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div>
                      <span className="font-medium">Member Since:</span>
                      <span className="ml-2">{formatDate(selectedCustomer.createdAt)}</span>
                    </div>
                    
                    {selectedCustomer.lastLoginAt && (
                      <div>
                        <span className="font-medium">Last Login:</span>
                        <span className="ml-2">{formatDate(selectedCustomer.lastLoginAt)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Customer Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedCustomer.totalOrders || 0}
                        </div>
                        <div className="text-sm text-blue-600">Total Orders</div>
                      </div>
                      
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(selectedCustomer.totalSpent || 0)}
                        </div>
                        <div className="text-sm text-green-600">Total Spent</div>
                      </div>
                    </div>
                    
                    {(selectedCustomer.totalOrders || 0) > 0 && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-600">
                          {formatCurrency((selectedCustomer.totalSpent || 0) / (selectedCustomer.totalOrders || 1))}
                        </div>
                        <div className="text-sm text-gray-600">Average Order Value</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Customer Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {customerOrders.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customerOrders.slice(0, 10).map((order: any) => (
                          <TableRow key={order.id}>
                            <TableCell>{order.orderNumber}</TableCell>
                            <TableCell>{formatDate(order.createdAt)}</TableCell>
                            <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{order.status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No orders found for this customer</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
                {selectedCustomer.role !== 'ADMIN' && (
                  <Button 
                    variant={selectedCustomer.isActive ? "destructive" : "default"}
                    onClick={() => handleToggleCustomerStatus(selectedCustomer.id, selectedCustomer.isActive)}
                  >
                    {selectedCustomer.isActive ? 'Deactivate' : 'Activate'} Customer
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}