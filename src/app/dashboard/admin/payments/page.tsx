// src/app/dashboard/admin/payments/page.tsx - Fixed version
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext'; // FIXED: Added missing import
import { toast } from 'sonner';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { 
  RefreshCw, 
  Search, 
  Eye, 
  CreditCard, 
 IndianRupee,
  TrendingUp,
  CheckCircle, 
  XCircle,
  Clock,
  AlertCircle,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Types
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
  completedAt?: string;
  refundedAt?: string;
  refundAmount?: number;
  fees?: number;
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
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Payment status badge component
const PaymentStatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'completed':
      case 'success':
        return { 
          className: 'bg-green-100 text-green-800', 
          icon: CheckCircle 
        };
      case 'pending':
      case 'processing':
        return { 
          className: 'bg-yellow-100 text-yellow-800', 
          icon: Clock 
        };
      case 'failed':
      case 'error':
        return { 
          className: 'bg-red-100 text-red-800', 
          icon: XCircle 
        };
      case 'refunded':
        return { 
          className: 'bg-gray-100 text-gray-800', 
          icon: AlertCircle 
        };
      default:
        return { 
          className: 'bg-gray-100 text-gray-800', 
          icon: AlertCircle 
        };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  return (
    <Badge className={`${config.className} border-0 flex items-center gap-1`}>
      <IconComponent className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

// Payment method badge component
const PaymentMethodBadge = ({ method }: { method: string }) => {
  const getMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'razorpay':
      case 'stripe':
      case 'paypal':
        return 'bg-blue-100 text-blue-800';
      case 'cod':
      case 'cash':
        return 'bg-green-100 text-green-800';
      case 'upi':
        return 'bg-purple-100 text-purple-800';
      case 'netbanking':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Badge className={`${getMethodColor(method)} border-0`}>
      {method.toUpperCase()}
    </Badge>
  );
};

export default function PaymentsPage() {
  const { user, loading: authLoading, isAuthenticated, isAdmin } = useAdminAuth();
  const router = useRouter();
  
  // Local state
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const itemsPerPage = 10;

  // Stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    successful: 0,
    pending: 0,
    failed: 0,
    successRate: 0
  });

  // Check authentication
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
    }
  }, [authLoading, isAuthenticated, isAdmin, router, currentPage, statusFilter, methodFilter]);

  // Fetch payments
  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(methodFilter !== 'all' && { method: methodFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/admin/payments?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }

      const data = await response.json();
      console.log('Payments API response:', data);

      // Handle different response formats
      let paymentsArray: any[] = [];
      let pagination = { total: 0, totalPages: 1 };

      if (data.success && Array.isArray(data.payments)) {
        paymentsArray = data.payments;
        pagination = data.pagination || pagination;
      } else if (Array.isArray(data)) {
        paymentsArray = data;
      } else {
        console.error('Invalid payments response format:', data);
        paymentsArray = [];
      }
 useAutoRefresh({
    refreshInterval: 30000,
    enabled: true,
    onRefresh: fetchPayments,
  });


      setPayments(paymentsArray);
      setTotalItems(pagination.total);
      setTotalPages(pagination.totalPages);

      // Calculate stats
      const totalRevenue = paymentsArray
        .filter(p => p.status?.toLowerCase() === 'paid' || p.status?.toLowerCase() === 'completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const today = new Date().toDateString();
      const todayRevenue = paymentsArray
        .filter(p => 
          new Date(p.createdAt).toDateString() === today && 
          (p.status?.toLowerCase() === 'paid' || p.status?.toLowerCase() === 'completed')
        )
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const successful = paymentsArray.filter(p => 
        p.status?.toLowerCase() === 'paid' || p.status?.toLowerCase() === 'completed'
      ).length;

      const pending = paymentsArray.filter(p => 
        p.status?.toLowerCase() === 'pending' || p.status?.toLowerCase() === 'processing'
      ).length;

      const failed = paymentsArray.filter(p => 
        p.status?.toLowerCase() === 'failed' || p.status?.toLowerCase() === 'error'
      ).length;

      const successRate = paymentsArray.length > 0 ? 
        ((successful / paymentsArray.length) * 100) : 0;

      setStats({
        totalRevenue,
        todayRevenue,
        successful,
        pending,
        failed,
        successRate
      });

    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle view payment details
  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDialogOpen(true);
  };

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchPayments();
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Filter payments based on search term
  const filteredPayments = payments.filter(payment => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      payment.orderNumber?.toLowerCase().includes(searchLower) ||
      payment.customerName?.toLowerCase().includes(searchLower) ||
      payment.customerEmail?.toLowerCase().includes(searchLower) ||
      payment.transactionId?.toLowerCase().includes(searchLower)
    );
  });

  if (authLoading || loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments Management</h1>
          <p className="text-gray-600">Monitor payment transactions and revenue</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={fetchPayments} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.todayRevenue)}</div>
            <p className="text-xs text-muted-foreground">Revenue today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{stats.successful} successful payments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="razorpay">Razorpay</SelectItem>
                <SelectItem value="cod">Cash on Delivery</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="netbanking">Net Banking</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={handleSearch}>
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-gray-500">
                      <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      No payments found
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.orderNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.customerName}</div>
                        <div className="text-sm text-gray-500">{payment.customerEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      <PaymentMethodBadge method={payment.paymentMethod} />
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={payment.status} />
                    </TableCell>
                    <TableCell>{formatDate(payment.createdAt)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewPayment(payment)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} payments
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => handlePageChange(page)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Payment Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Payment Details - {selectedPayment?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-6">
              {/* Payment Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Payment Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Payment ID:</strong> {selectedPayment.id}</div>
                    <div><strong>Order Number:</strong> {selectedPayment.orderNumber}</div>
                    <div><strong>Amount:</strong> {formatCurrency(selectedPayment.amount)}</div>
                    <div><strong>Method:</strong> <PaymentMethodBadge method={selectedPayment.paymentMethod} /></div>
                    <div><strong>Status:</strong> <PaymentStatusBadge status={selectedPayment.status} /></div>
                    {selectedPayment.transactionId && (
                      <div><strong>Transaction ID:</strong> {selectedPayment.transactionId}</div>
                    )}
                    {selectedPayment.fees && (
                      <div><strong>Processing Fees:</strong> {formatCurrency(selectedPayment.fees)}</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {selectedPayment.customerName}</div>
                    <div><strong>Email:</strong> {selectedPayment.customerEmail}</div>
                  </div>
                  
                  <h3 className="font-semibold mb-3 mt-6">Timeline</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Created:</strong> {formatDate(selectedPayment.createdAt)}</div>
                    <div><strong>Updated:</strong> {formatDate(selectedPayment.updatedAt)}</div>
                    {selectedPayment.completedAt && (
                      <div><strong>Completed:</strong> {formatDate(selectedPayment.completedAt)}</div>
                    )}
                    {selectedPayment.refundedAt && (
                      <div><strong>Refunded:</strong> {formatDate(selectedPayment.refundedAt)}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Gateway Response */}
              {selectedPayment.gatewayResponse && (
                <div>
                  <h3 className="font-semibold mb-3">Gateway Response</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(selectedPayment.gatewayResponse, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Refund Information */}
              {selectedPayment.refundAmount && (
                <div>
                  <h3 className="font-semibold mb-3">Refund Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Refund Amount:</strong> {formatCurrency(selectedPayment.refundAmount)}</div>
                    {selectedPayment.refundedAt && (
                      <div><strong>Refunded Date:</strong> {formatDate(selectedPayment.refundedAt)}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}