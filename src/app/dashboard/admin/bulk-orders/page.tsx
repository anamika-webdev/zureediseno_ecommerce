// ============================================
// FILE 4: src/app/dashboard/admin/bulk-orders/page.tsx
// ============================================
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Eye, 
  Phone, 
  Calendar, 
  Package, 
  Loader2,
  Search,
  Mail,
  Building2,
  User,
  FileText,
  DollarSign,
  Truck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Types
interface BulkOrderRequest {
  id: string;
  requestId: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  productType: string;
  quantity: number;
  description?: string;
  deliveryDate?: string;
  status: string;
  priority: string;
  estimatedPrice?: number;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Options
const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'processing', label: 'Processing' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const priorityOptions = [
  { value: 'all', label: 'All Priority' },
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

// Color mappings
const statusColors: { [key: string]: string } = {
  pending: 'bg-yellow-100 text-yellow-800',
  contacted: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-green-600 text-white',
  cancelled: 'bg-red-100 text-red-800',
};

const priorityColors: { [key: string]: string } = {
  low: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

export default function BulkOrdersPage() {
  const [requests, setRequests] = useState<BulkOrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<BulkOrderRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const { toast } = useToast();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Update form
  const [updateForm, setUpdateForm] = useState({
    status: '',
    priority: '',
    estimatedPrice: '',
    adminNotes: '',
    sendStatusEmail: false,
  });

  useEffect(() => {
    fetchRequests();
  }, [currentPage, statusFilter, priorityFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(priorityFilter !== 'all' && { priority: priorityFilter }),
        ...(searchTerm && { search: searchTerm }),
      });

      console.log('Fetching bulk orders with params:', params.toString());

      const response = await fetch(`/api/bulk-order?${params}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || data.details || `HTTP ${response.status}`);
      }
      
      setRequests(data.requests || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotalCount(data.pagination?.total || 0);
      
      console.log('Successfully loaded', data.requests?.length || 0, 'requests');
    } catch (error) {
      console.error('Error fetching bulk orders:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch bulk order requests. Check console for details.',
        variant: 'destructive',
      });
      // Set empty state
      setRequests([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchRequests();
  };

  const handleViewRequest = (request: BulkOrderRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  const handleUpdateRequest = (request: BulkOrderRequest) => {
    setSelectedRequest(request);
    setUpdateForm({
      status: request.status,
      priority: request.priority,
      estimatedPrice: request.estimatedPrice?.toString() || '',
      adminNotes: request.adminNotes || '',
      sendStatusEmail: false,
    });
    setIsUpdateDialogOpen(true);
  };

  const submitUpdate = async () => {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`/api/bulk-order/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: updateForm.status,
          priority: updateForm.priority,
          estimatedPrice: updateForm.estimatedPrice ? parseFloat(updateForm.estimatedPrice) : null,
          adminNotes: updateForm.adminNotes,
          sendStatusEmail: updateForm.sendStatusEmail,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Bulk order request updated successfully',
        });
        setIsUpdateDialogOpen(false);
        fetchRequests();
      } else {
        throw new Error('Failed to update request');
      }
    } catch (error) {
      console.error('Error updating bulk order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update bulk order request',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Bulk Order Requests</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage and track bulk order inquiries
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Processing</p>
                <p className="text-2xl font-bold">
                  {requests.filter(r => r.status === 'processing' || r.status === 'contacted').length}
                </p>
              </div>
              <Truck className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold">
                  {requests.filter(r => r.status === 'completed').length}
                </p>
              </div>
              <Package className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label>Search</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search by company, contact, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Order Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No bulk order requests found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Request ID</th>
                    <th className="text-left p-3">Company</th>
                    <th className="text-left p-3">Contact</th>
                    <th className="text-left p-3">Product</th>
                    <th className="text-left p-3">Quantity</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Priority</th>
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-3 font-mono text-sm">{request.requestId}</td>
                      <td className="p-3">{request.companyName}</td>
                      <td className="p-3">
                        <div className="text-sm">
                          <div>{request.contactPerson}</div>
                          <div className="text-gray-500">{request.phone}</div>
                        </div>
                      </td>
                      <td className="p-3">{request.productType}</td>
                      <td className="p-3">{request.quantity} pcs</td>
                      <td className="p-3">
                        <Badge className={statusColors[request.status]}>
                          {request.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge className={priorityColors[request.priority]}>
                          {request.priority}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">{formatDate(request.createdAt)}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewRequest(request)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateRequest(request)}
                          >
                            Update
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && requests.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      currentPage === pageNum
                        ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Order Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              {/* Request Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Request ID</Label>
                  <p className="font-mono">{selectedRequest.requestId}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <div className="mt-1">
                    <Badge className={statusColors[selectedRequest.status]}>
                      {selectedRequest.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Company Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Company Name</Label>
                    <p>{selectedRequest.companyName}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Contact Person</Label>
                    <p>{selectedRequest.contactPerson}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Email</Label>
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {selectedRequest.email}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Phone</Label>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {selectedRequest.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Product Type</Label>
                    <p>{selectedRequest.productType}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Quantity</Label>
                    <p className="font-semibold">{selectedRequest.quantity} pieces</p>
                  </div>
                  {selectedRequest.deliveryDate && (
                    <div>
                      <Label className="text-gray-500">Expected Delivery</Label>
                      <p>{formatDate(selectedRequest.deliveryDate)}</p>
                    </div>
                  )}
                  {selectedRequest.estimatedPrice && (
                    <div>
                      <Label className="text-gray-500">Estimated Price</Label>
                      <p className="font-semibold">₹{selectedRequest.estimatedPrice.toLocaleString()}</p>
                    </div>
                  )}
                </div>
                {selectedRequest.description && (
                  <div>
                    <Label className="text-gray-500">Additional Details</Label>
                    <p className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded border">
                      {selectedRequest.description}
                    </p>
                  </div>
                )}
                {selectedRequest.adminNotes && (
                  <div>
                    <Label className="text-gray-500">Admin Notes</Label>
                    <p className="mt-1 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border">
                      {selectedRequest.adminNotes}
                    </p>
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-gray-500">Created</Label>
                  <p className="text-sm">{new Date(selectedRequest.createdAt).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Last Updated</Label>
                  <p className="text-sm">{new Date(selectedRequest.updatedAt).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsDialogOpen(false);
              if (selectedRequest) handleUpdateRequest(selectedRequest);
            }}>
              Update Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Bulk Order Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Status</Label>
              <Select value={updateForm.status} onValueChange={(value) => setUpdateForm({...updateForm, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.filter(o => o.value !== 'all').map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Priority</Label>
              <Select value={updateForm.priority} onValueChange={(value) => setUpdateForm({...updateForm, priority: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.filter(o => o.value !== 'all').map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Estimated Price (₹)</Label>
              <Input
                type="number"
                value={updateForm.estimatedPrice}
                onChange={(e) => setUpdateForm({...updateForm, estimatedPrice: e.target.value})}
                placeholder="Enter estimated price"
              />
            </div>

            <div>
              <Label>Admin Notes</Label>
              <Textarea
                value={updateForm.adminNotes}
                onChange={(e) => setUpdateForm({...updateForm, adminNotes: e.target.value})}
                placeholder="Add notes for internal reference"
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sendEmail"
                checked={updateForm.sendStatusEmail}
                onChange={(e) => setUpdateForm({...updateForm, sendStatusEmail: e.target.checked})}
                className="rounded border-gray-300"
              />
              <label htmlFor="sendEmail" className="text-sm">
                Send status update email to customer
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitUpdate}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}