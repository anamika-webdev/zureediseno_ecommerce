// src/app/dashboard/admin/payments/page.tsx
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
  CreditCard, 
  Search, 
  Filter, 
  Eye, 
  Download,
  RefreshCw,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

interface Payment {
  id: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  method: string; // 'cod', 'razorpay', 'stripe', etc.
  status: string; // 'pending', 'completed', 'failed', 'refunded'
  transactionId?: string;
  gatewayResponse?: any;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  refundedAt?: string;
  refundAmount?: number;
  fees?: number;
}

interface PaymentStats {
  totalRevenue: number;
  todayRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  refundedAmount: number;
  averageTransactionValue: number;
  successRate: number;
  revenueGrowth: number;
  paymentMethodBreakdown: {
    cod: number;
    razorpay: number;
    stripe: number;
    other: number;
  };
}

export default function AdminPaymentsPage() {
  const { user, loading: authLoading, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    totalTransactions: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
    pendingTransactions: 0,
    refundedAmount: 0,
    averageTransactionValue: 0,
    successRate: 0,
    revenueGrowth: 0,
    paymentMethodBreakdown: {
      cod: 0,
      razorpay: 0,
      stripe: 0,
      other: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Check authentication and admin access
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/signin?redirect=/dashboard/admin/payments');
        return;
      }
      
      if (!isAdmin) {
        router.push('/');
        return;
      }
      
      fetchPayments();
      fetchPaymentStats();
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  // Real-time data refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPayments(currentPage, false); // Silent refresh
      fetchPaymentStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [currentPage]);

  const fetchPayments = async (page = 1, showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: searchTerm,
        status: statusFilter,
        method: methodFilter,
        date: dateFilter
      });

      const response = await fetch(`/api/admin/payments?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }

      const data = await response.json();
      setPayments(data.payments || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching payments:', error);
      if (showLoading) {
        toast.error('Failed to load payments');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      const response = await fetch('/api/admin/payments/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    }
  };

  const handleViewPayment = async (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDialogOpen(true);
  };

  const handleRefundPayment = async (paymentId: string, amount: number) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      if (response.ok) {
        toast.success('Refund initiated successfully');
        fetchPayments(currentPage);
        fetchPaymentStats();
      } else {
        throw new Error('Failed to initiate refund');
      }
    } catch (error) {
      console.error('Error initiating refund:', error);
      toast.error('Failed to initiate refund');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'refunded':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      case 'refunded':
        return 'outline';
      default:
        return 'secondary';
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.method === methodFilter;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading payments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Payment Management</h1>
          <p className="text-gray-600">Monitor and manage all payment transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => fetchPayments(currentPage)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{stats.revenueGrowth}% this month
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.todayRevenue)}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.successfulTransactions}/{stats.totalTransactions} transactions
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pendingTransactions}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Refunded</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.refundedAmount)}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Cash on Delivery</span>
                <span className="font-bold">{formatCurrency(stats.paymentMethodBreakdown.cod)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Razorpay</span>
                <span className="font-bold">{formatCurrency(stats.paymentMethodBreakdown.razorpay)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Stripe</span>
                <span className="font-bold">{formatCurrency(stats.paymentMethodBreakdown.stripe)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Other</span>
                <span className="font-bold">{formatCurrency(stats.paymentMethodBreakdown.other)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Monthly Revenue</span>
                <span className="font-bold text-green-600">{formatCurrency(stats.monthlyRevenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Yearly Revenue</span>
                <span className="font-bold text-blue-600">{formatCurrency(stats.yearlyRevenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Average Transaction</span>
                <span className="font-bold">{formatCurrency(stats.averageTransactionValue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Failed Transactions</span>
                <span className="font-bold text-red-600">{stats.failedTransactions}</span>
              </div>
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
                placeholder="Search by order, customer, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cod">Cash on Delivery</SelectItem>
                <SelectItem value="razorpay">Razorpay</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="font-medium">{payment.orderNumber}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.customerName}</div>
                          <div className="text-sm text-gray-500">{payment.customerEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold">{formatCurrency(payment.amount)}</div>
                        {payment.fees && (
                          <div className="text-sm text-gray-500">Fee: {formatCurrency(payment.fees)}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.method.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(payment.status)}
                          <Badge variant={getStatusBadgeVariant(payment.status)}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {payment.transactionId || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(payment.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewPayment(payment)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          {payment.status === 'completed' && payment.method !== 'cod' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleRefundPayment(payment.id, payment.amount)}
                            >
                              Refund
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500">
                      No payments found matching your criteria.
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
                  onClick={() => fetchPayments(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchPayments(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Transaction Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Order:</strong> {selectedPayment.orderNumber}</p>
                    <p><strong>Amount:</strong> {formatCurrency(selectedPayment.amount)}</p>
                    <p><strong>Currency:</strong> {selectedPayment.currency}</p>
                    <p><strong>Method:</strong> {selectedPayment.method.toUpperCase()}</p>
                    <p><strong>Status:</strong> {selectedPayment.status}</p>
                    {selectedPayment.transactionId && (
                      <p><strong>Transaction ID:</strong> {selectedPayment.transactionId}</p>
                    )}
                    {selectedPayment.fees && (
                      <p><strong>Processing Fee:</strong> {formatCurrency(selectedPayment.fees)}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedPayment.customerName}</p>
                    <p><strong>Email:</strong> {selectedPayment.customerEmail}</p>
                    <p><strong>Customer ID:</strong> {selectedPayment.customerId}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Timeline</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Created:</strong> {formatDate(selectedPayment.createdAt)}</p>
                  <p><strong>Updated:</strong> {formatDate(selectedPayment.updatedAt)}</p>
                  {selectedPayment.completedAt && (
                    <p><strong>Completed:</strong> {formatDate(selectedPayment.completedAt)}</p>
                  )}
                  {selectedPayment.refundedAt && (
                    <p><strong>Refunded:</strong> {formatDate(selectedPayment.refundedAt)}</p>
                  )}
                  {selectedPayment.refundAmount && (
                    <p><strong>Refund Amount:</strong> {formatCurrency(selectedPayment.refundAmount)}</p>
                  )}
                </div>
              </div>
              {selectedPayment.gatewayResponse && (
                <div>
                  <h3 className="font-semibold mb-2">Gateway Response</h3>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(selectedPayment.gatewayResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}