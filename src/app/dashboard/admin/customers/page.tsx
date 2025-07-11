// src/app/dashboard/admin/customers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
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
} from '@/components/ui/dialog';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Edit,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: string;
}

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  averageCustomerValue: number;
  topSpendingCustomers: Customer[];
  customerGrowthRate: number;
}

export default function AdminCustomersPage() {
  const { user, loading: authLoading, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats>({
    totalCustomers: 0,
    activeCustomers: 0,
    newCustomersThisMonth: 0,
    averageCustomerValue: 0,
    topSpendingCustomers: [],
    customerGrowthRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Check authentication and admin access
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
      
      fetchCustomers();
      fetchCustomerStats();
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  // Real-time data refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCustomers(currentPage, false); // Silent refresh
      fetchCustomerStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [currentPage]);

  const fetchCustomers = async (page = 1, showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: searchTerm,
        role: roleFilter,
        status: statusFilter
      });

      const response = await fetch(`/api/admin/customers?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const data = await response.json();
      setCustomers(data.customers || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching customers:', error);
      if (showLoading) {
        toast.error('Failed to load customers');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchCustomerStats = async () => {
    try {
      const response = await fetch('/api/admin/customers/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching customer stats:', error);
    }
  };

  const handleViewCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleToggleCustomerStatus = async (customerId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        toast.success(`Customer ${!isActive ? 'activated' : 'deactivated'} successfully`);
        fetchCustomers(currentPage);
      } else {
        throw new Error('Failed to update customer status');
      }
    } catch (error) {
      console.error('Error updating customer status:', error);
      toast.error('Failed to update customer status');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || customer.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && customer.isActive) ||
                         (statusFilter === 'inactive' && !customer.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading customers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Customer Management</h1>
          <p className="text-gray-600">Manage and analyze customer data</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => fetchCustomers(currentPage)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold">{stats.totalCustomers.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{stats.customerGrowthRate}% this month
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold">{stats.activeCustomers.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {((stats.activeCustomers / stats.totalCustomers) * 100).toFixed(1)}% of total
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New This Month</p>
                <p className="text-2xl font-bold">{stats.newCustomersThisMonth}</p>
              </div>
              <UserPlus className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Customer Value</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.averageCustomerValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="SELLER">Seller</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Last Order</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                          {customer.phone && (
                            <div className="text-sm text-gray-500">{customer.phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={customer.role === 'ADMIN' ? 'default' : 'secondary'}>
                          {customer.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={customer.isActive ? 'default' : 'secondary'}>
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{customer.totalOrders}</TableCell>
                      <TableCell>{formatCurrency(customer.totalSpent)}</TableCell>
                      <TableCell>
                        {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'Never'}
                      </TableCell>
                      <TableCell>{formatDate(customer.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewCustomer(customer)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleToggleCustomerStatus(customer.id, customer.isActive)}
                          >
                            {customer.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500">
                      No customers found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchCustomers(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchCustomers(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Personal Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedCustomer.firstName} {selectedCustomer.lastName}</p>
                    <p><strong>Email:</strong> {selectedCustomer.email}</p>
                    {selectedCustomer.phone && (
                      <p><strong>Phone:</strong> {selectedCustomer.phone}</p>
                    )}
                    <p><strong>Role:</strong> {selectedCustomer.role}</p>
                    <p><strong>Status:</strong> {selectedCustomer.isActive ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Order Statistics</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Total Orders:</strong> {selectedCustomer.totalOrders}</p>
                    <p><strong>Total Spent:</strong> {formatCurrency(selectedCustomer.totalSpent)}</p>
                    <p><strong>Average Order:</strong> {formatCurrency(selectedCustomer.averageOrderValue)}</p>
                    <p><strong>Last Order:</strong> {selectedCustomer.lastOrderDate ? formatDate(selectedCustomer.lastOrderDate) : 'Never'}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Account Information</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Joined:</strong> {formatDate(selectedCustomer.createdAt)}</p>
                  {selectedCustomer.lastLoginAt && (
                    <p><strong>Last Login:</strong> {formatDate(selectedCustomer.lastLoginAt)}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}