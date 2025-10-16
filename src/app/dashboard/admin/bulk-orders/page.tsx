// src/app/dashboard/admin/bulk-orders/page.tsx - COMPLETE FIXED VERSION
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
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
  ChevronRight,
  RefreshCw,
  Clock
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

  // Fetch requests function
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

  // ✅ Auto-refresh hook - PLACED HERE, AFTER fetchRequests definition
  useAutoRefresh({
    refreshInterval: 30000,
    enabled: true,
    onRefresh: fetchRequests,
  });

  // Initial load and filter changes
  useEffect(() => {
    fetchRequests();
  }, [currentPage, statusFilter, priorityFilter]);

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
          estimatedPrice: updateForm.estimatedPrice ? parseFloat(updateForm.estimatedPrice) : undefined,
          adminNotes: updateForm.adminNotes,
          sendStatusEmail: updateForm.sendStatusEmail,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Request updated successfully',
        });
        setIsUpdateDialogOpen(false);
        fetchRequests();
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.error || 'Failed to update request',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while updating the request',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="w-8 h-8" />
            Bulk Order Requests
          </h1>
          <p className="text-gray-500 mt-1">
            Manage bulk order requests from companies • Auto-refreshes every 30s
          </p>
        </div>
        <Button onClick={fetchRequests} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Now
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.filter(r => r.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.filter(r => r.status === 'processing').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.filter(r => r.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by company, contact, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
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
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardContent className="pt-6">
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
                    <tr key={request.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono text-sm">{request.requestId}</td>
                      <td className="p-3">{request.companyName}</td>
                      <td className="p-3">
                        <div className="text-sm">
                          <div>{request.contactPerson}</div>
                          <div className="text-gray-500">{request.phone}</div>
                        </div>
                      </td>
                      <td className="p-3">{request.productType}</td>
                      <td className="p-3">{request.quantity}</td>
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
                      <td className="p-3">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {requests.length} of {totalCount} requests
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Bulk Order Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Request ID</Label>
                  <p className="font-mono">{selectedRequest.requestId}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <Badge className={statusColors[selectedRequest.status]}>
                    {selectedRequest.status}
                  </Badge>
                </div>
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
                  <p>{selectedRequest.email}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Phone</Label>
                  <p>{selectedRequest.phone}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Product Type</Label>
                  <p>{selectedRequest.productType}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Quantity</Label>
                  <p>{selectedRequest.quantity} units</p>
                </div>
              </div>
              {selectedRequest.description && (
                <div>
                  <Label className="text-gray-500">Description</Label>
                  <p className="mt-1 p-3 bg-gray-50 rounded border">
                    {selectedRequest.description}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
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
              <Select 
                value={updateForm.status} 
                onValueChange={(value) => setUpdateForm({...updateForm, status: value})}
              >
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
              <Select 
                value={updateForm.priority} 
                onValueChange={(value) => setUpdateForm({...updateForm, priority: value})}
              >
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
                placeholder="Enter estimated price"
                value={updateForm.estimatedPrice}
                onChange={(e) => setUpdateForm({...updateForm, estimatedPrice: e.target.value})}
              />
            </div>
            <div>
              <Label>Admin Notes</Label>
              <Textarea
                placeholder="Add internal notes..."
                value={updateForm.adminNotes}
                onChange={(e) => setUpdateForm({...updateForm, adminNotes: e.target.value})}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitUpdate}>
              Update Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}