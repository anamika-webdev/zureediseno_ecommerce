// src/app/dashboard/admin/payments/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Eye, 
  Download, 
  CreditCard, 
  Banknote, 
  RefreshCw,
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface Payment {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  paymentMethod: 'cod' | 'razorpay';
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  transactionId?: string;
  gatewayResponse?: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
}

interface PaymentStats {
  totalRevenue: number;
  totalTransactions: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  refundedAmount: number;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch payments data
  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments');
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      } else {
        throw new Error('Failed to fetch payments');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payment data');
      // Fallback to empty array if API fails
      setPayments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPayments();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPayments();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Calculate stats
  const stats: PaymentStats = {
    totalRevenue: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    totalTransactions: payments.length,
    successfulPayments: payments.filter(p => p.status === 'completed').length,
    failedPayments: payments.filter(p => p.status === 'failed').length,
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    refundedAmount: payments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + p.amount, 0)
  };

  // Calculate payment method stats
  const paymentMethodStats = {
    razorpay: {
      count: payments.filter(p => p.paymentMethod === 'razorpay').length,
      revenue: payments.filter(p => p.paymentMethod === 'razorpay' && p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
    },
    cod: {
      count: payments.filter(p => p.paymentMethod === 'cod').length,
      revenue: payments.filter(p => p.paymentMethod === 'cod' && p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
    }
  };

  // Filter payments
  useEffect(() => {
    let filtered = payments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    // Method filter
    if (methodFilter !== 'all') {
      filtered = filtered.filter(payment => payment.paymentMethod === methodFilter);
    }

    setFilteredPayments(filtered);
  }, [payments, searchTerm, statusFilter, methodFilter]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      case 'refunded': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'refunded': return <RotateCcw className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'cod': return <Banknote className="h-4 w-4" />;
      case 'razorpay': return <CreditCard className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const getMethodDisplayName = (method: string) => {
    switch (method) {
      case 'cod': return 'Cash on Delivery';
      case 'razorpay': return 'Razorpay';
      default: return method.toUpperCase();
    }
  };

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDialogOpen(true);
  };

  const handleRefreshPayments = async () => {
    setRefreshing(true);
    await fetchPayments();
    toast.success('Payments data refreshed successfully');
  };

  const handleExportPayments = () => {
    // Create CSV content
    const csvContent = [
      ['Order Number', 'Customer', 'Amount', 'Method', 'Status', 'Transaction ID', 'Date'],
      ...filteredPayments.map(payment => [
        payment.orderNumber,
        payment.customerName,
        payment.amount,
        getMethodDisplayName(payment.paymentMethod),
        payment.status,
        payment.transactionId || '',
        new Date(payment.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Payments data exported successfully');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN');
  };

  const successRate = stats.totalTransactions > 0 
    ? ((stats.successfulPayments / stats.totalTransactions) * 100).toFixed(1)
    : '0';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading payment data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-gray-600">Monitor and manage all payment transactions</p>
          <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshPayments} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportPayments}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              From {stats.successfulPayments} successful transactions
            </p>
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">{successRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {stats.successfulPayments} of {stats.totalTransactions} transactions
            </p>
          </CardContent>
        </Card>

        {/* Razorpay Orders */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Razorpay Orders</p>
                <p className="text-2xl font-bold">{paymentMethodStats.razorpay.count}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Revenue: {formatCurrency(paymentMethodStats.razorpay.revenue)}
            </p>
          </CardContent>
        </Card>

        {/* COD Orders */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">COD Orders</p>
                <p className="text-2xl font-bold">{paymentMethodStats.cod.count}</p>
              </div>
              <Banknote className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Revenue: {formatCurrency(paymentMethodStats.cod.revenue)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders, customers, or transaction IDs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Method Filter */}
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cod">Cash on Delivery</SelectItem>
                <SelectItem value="razorpay">Razorpay</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Payment Transactions ({filteredPayments.length})
          </CardTitle>
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
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.orderNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.customerName}</p>
                        <p className="text-sm text-gray-600">{payment.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getMethodIcon(payment.paymentMethod)}
                        <span>{getMethodDisplayName(payment.paymentMethod)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(payment.status)} className="flex items-center gap-1 w-fit">
                        {getStatusIcon(payment.status)}
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {payment.transactionId || '-'}
                    </TableCell>
                    <TableCell>{formatDate(payment.createdAt)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewPayment(payment)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {payments.length === 0 ? 'No payment data available.' : 'No payments found matching your criteria.'}
              </p>
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
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Order Number</Label>
                  <p className="font-mono">{selectedPayment.orderNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Amount</Label>
                  <p className="text-lg font-bold">{formatCurrency(selectedPayment.amount)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Payment Method</Label>
                  <div className="flex items-center gap-2">
                    {getMethodIcon(selectedPayment.paymentMethod)}
                    <span>{getMethodDisplayName(selectedPayment.paymentMethod)}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge variant={getStatusBadgeVariant(selectedPayment.status)} className="flex items-center gap-1 w-fit">
                    {getStatusIcon(selectedPayment.status)}
                    {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <Label className="text-sm font-medium text-gray-600">Customer Information</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{selectedPayment.customerName}</p>
                  <p className="text-sm text-gray-600">{selectedPayment.customerEmail}</p>
                </div>
              </div>

              {/* Transaction Details */}
              {selectedPayment.transactionId && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Transaction Details</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Transaction ID</p>
                        <p className="font-mono text-sm">{selectedPayment.transactionId}</p>
                      </div>
                      {selectedPayment.gatewayResponse && (
                        <div>
                          <p className="text-sm text-gray-600">Gateway Response</p>
                          <p className="text-sm">{selectedPayment.gatewayResponse}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div>
                <Label className="text-sm font-medium text-gray-600">Timeline</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Created:</span>
                    <span className="text-sm font-mono">{formatDate(selectedPayment.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Updated:</span>
                    <span className="text-sm font-mono">{formatDate(selectedPayment.updatedAt)}</span>
                  </div>
                  {selectedPayment.processedAt && (
                    <div className="flex justify-between">
                      <span className="text-sm">Processed:</span>
                      <span className="text-sm font-mono">{formatDate(selectedPayment.processedAt)}</span>
                    </div>
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