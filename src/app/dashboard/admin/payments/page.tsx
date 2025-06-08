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
import { 
  Search, 
  Eye, 
  Download, 
  CreditCard, 
  Banknote, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

interface Payment {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  paymentMethod: 'cod' | 'razorpay' | 'stripe' | 'upi';
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

const mockPayments: Payment[] = [
  {
    id: '1',
    orderId: 'order_1',
    orderNumber: 'ORD-2024-001',
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    amount: 2999,
    paymentMethod: 'razorpay',
    status: 'completed',
    transactionId: 'txn_razorpay_123456',
    gatewayResponse: 'Payment successful',
    createdAt: '2024-11-22T10:30:00Z',
    updatedAt: '2024-11-22T10:31:00Z',
    processedAt: '2024-11-22T10:31:00Z'
  },
  {
    id: '2',
    orderId: 'order_2',
    orderNumber: 'ORD-2024-002',
    customerName: 'Jane Smith',
    customerEmail: 'jane.smith@example.com',
    amount: 1599,
    paymentMethod: 'cod',
    status: 'pending',
    createdAt: '2024-11-22T11:15:00Z',
    updatedAt: '2024-11-22T11:15:00Z'
  },
  {
    id: '3',
    orderId: 'order_3',
    orderNumber: 'ORD-2024-003',
    customerName: 'Robert Johnson',
    customerEmail: 'robert.j@example.com',
    amount: 4299,
    paymentMethod: 'upi',
    status: 'failed',
    transactionId: 'txn_upi_789012',
    gatewayResponse: 'Transaction declined by bank',
    createdAt: '2024-11-22T09:45:00Z',
    updatedAt: '2024-11-22T09:46:00Z'
  },
  {
    id: '4',
    orderId: 'order_4',
    orderNumber: 'ORD-2024-004',
    customerName: 'Emily Davis',
    customerEmail: 'emily.davis@example.com',
    amount: 3599,
    paymentMethod: 'razorpay',
    status: 'refunded',
    transactionId: 'txn_razorpay_345678',
    gatewayResponse: 'Refund processed successfully',
    createdAt: '2024-11-21T16:20:00Z',
    updatedAt: '2024-11-22T14:30:00Z',
    processedAt: '2024-11-21T16:22:00Z'
  },
  {
    id: '5',
    orderId: 'order_5',
    orderNumber: 'ORD-2024-005',
    customerName: 'Michael Brown',
    customerEmail: 'michael.brown@example.com',
    amount: 5999,
    paymentMethod: 'razorpay',
    status: 'completed',
    transactionId: 'txn_razorpay_567890',
    gatewayResponse: 'Payment successful',
    createdAt: '2024-11-22T08:30:00Z',
    updatedAt: '2024-11-22T08:31:00Z',
    processedAt: '2024-11-22T08:31:00Z'
  }
];

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>(mockPayments);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Calculate stats
  const stats: PaymentStats = {
    totalRevenue: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    totalTransactions: payments.length,
    successfulPayments: payments.filter(p => p.status === 'completed').length,
    failedPayments: payments.filter(p => p.status === 'failed').length,
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    refundedAmount: payments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + p.amount, 0)
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

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'cod': return <Banknote className="h-4 w-4" />;
      case 'razorpay': 
      case 'stripe': 
      case 'upi': return <CreditCard className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const getMethodDisplayName = (method: string) => {
    switch (method) {
      case 'cod': return 'Cash on Delivery';
      case 'razorpay': return 'Razorpay';
      case 'stripe': return 'Stripe';
      case 'upi': return 'UPI';
      default: return method.toUpperCase();
    }
  };

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDialogOpen(true);
  };

  const handleRefreshPayments = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Payments refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh payments');
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-gray-600">Monitor and manage all payment transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshPayments} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleExportPayments}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stats.successfulPayments} successful
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
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-blue-600">{successRate}%</p>
                <p className="text-xs text-gray-500">{stats.successfulPayments}/{stats.totalTransactions} transactions</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
                <p className="text-xs text-gray-500">Awaiting payment</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Refunded</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.refundedAmount)}</p>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Amount refunded
                </p>
              </div>
              <RefreshCw className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by order number, customer, or transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:w-48">
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="cod">Cash on Delivery</SelectItem>
                  <SelectItem value="razorpay">Razorpay</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions ({filteredPayments.length})</CardTitle>
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
                        <div>
                          <p className="font-medium">{payment.orderNumber}</p>
                          <p className="text-sm text-gray-600">Order ID: {payment.orderId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.customerName}</p>
                          <p className="text-sm text-gray-600">{payment.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMethodIcon(payment.paymentMethod)}
                          <span>{getMethodDisplayName(payment.paymentMethod)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(payment.status)}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {payment.transactionId ? (
                            <span title={payment.transactionId}>
                              {payment.transactionId.length > 15 
                                ? `${payment.transactionId.substring(0, 15)}...`
                                : payment.transactionId
                              }
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDate(payment.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewPayment(payment)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">No payments found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
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
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Payment Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Order Number</p>
                        <p className="font-mono">{selectedPayment.orderNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Amount</p>
                        <p className="text-lg font-bold">{formatCurrency(selectedPayment.amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Payment Method</p>
                        <div className="flex items-center gap-2">
                          {getMethodIcon(selectedPayment.paymentMethod)}
                          <span>{getMethodDisplayName(selectedPayment.paymentMethod)}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Status</p>
                        <Badge variant={getStatusBadgeVariant(selectedPayment.status)}>
                          {selectedPayment.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer & Transaction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Customer</p>
                        <p>{selectedPayment.customerName}</p>
                        <p className="text-sm text-gray-600">{selectedPayment.customerEmail}</p>
                      </div>
                      {selectedPayment.transactionId && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Transaction ID</p>
                          <p className="font-mono text-sm break-all">{selectedPayment.transactionId}</p>
                        </div>
                      )}
                      {selectedPayment.gatewayResponse && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Gateway Response</p>
                          <p className="text-sm">{selectedPayment.gatewayResponse}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Created</p>
                      <p>{formatDate(selectedPayment.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Last Updated</p>
                      <p>{formatDate(selectedPayment.updatedAt)}</p>
                    </div>
                    {selectedPayment.processedAt && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Processed</p>
                        <p>{formatDate(selectedPayment.processedAt)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
                {selectedPayment.status === 'completed' && (
                  <Button variant="destructive">
                    Process Refund
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