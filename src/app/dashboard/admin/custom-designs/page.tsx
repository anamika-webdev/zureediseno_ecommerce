// src/app/dashboard/admin/custom-designs/page.tsx - FIXED WITH DETAILED LOGGING
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
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
  Users, 
  Palette, 
  ImageIcon, 
  Ruler,
  Filter,
  Settings,
  Mail,
  UserCheck,
  UserX,
  Loader2,
  Search,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { Pagination } from '@/components/admin/Pagination';

// Types
interface CustomDesignRequest {
  id: string;
  customerName?: string;
  customerEmail?: string;
  customerDisplayName?: string;
  customerDisplayEmail?: string;
  phoneNumber: string;
  designDescription: string;
  colorDescription?: string;
  fabricPreference?: string;
  imageUrl?: string;
  imageName?: string;
  measurementData?: any;
  status: string;
  priority: string;
  estimatedPrice?: number;
  adminNotes?: string;
  notes?: string;
  userType: 'logged' | 'guest';
  createdAt: string;
  updatedAt: string;
  contactedAt?: string;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  assignedTo?: string;
}

const statusColors: { [key: string]: string } = {
  pending: 'bg-yellow-100 text-yellow-800',
  contacted: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const priorityColors: { [key: string]: string } = {
  low: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

export default function CustomDesignsPage() {
  const { toast } = useToast();
  
  // State
  const [requests, setRequests] = useState<CustomDesignRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<CustomDesignRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;
  
  // Update form
  const [updateStatus, setUpdateStatus] = useState('');
  const [updatePriority, setUpdatePriority] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [sendStatusEmail, setSendStatusEmail] = useState(false);

  // Fetch requests with enhanced debugging
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(priorityFilter !== 'all' && { priority: priorityFilter }),
        ...(userTypeFilter !== 'all' && { userType: userTypeFilter }),
      });

      const url = `/api/custom-design?${params}`;
      console.log('🔍 Fetching custom designs from:', url);
      console.log('📋 Request params:', {
        page: currentPage,
        limit: itemsPerPage,
        searchTerm,
        statusFilter,
        priorityFilter,
        userTypeFilter
      });

      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      console.log('📡 Response headers:', {
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
      });

      const data = await response.json();
      console.log('📦 Response data:', data);
      console.log('📦 Data structure:', {
        hasSuccess: 'success' in data,
        hasRequests: 'requests' in data,
        hasError: 'error' in data,
        requestsType: Array.isArray(data.requests) ? 'array' : typeof data.requests,
        requestsLength: data.requests?.length,
        hasPagination: 'pagination' in data,
      });

      // Handle response - FIXED: Check both response.ok AND data.success
      if (response.ok || data.success || (data.requests && Array.isArray(data.requests))) {
        console.log('✅ Success! Setting requests:', data.requests?.length || 0);
        setRequests(data.requests || []);
        setTotalPages(data.pagination?.pages || data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
        
        if (data.requests?.length === 0) {
          console.log('⚠️ No requests found in response');
          toast({
            title: 'No Records',
            description: 'No custom design requests found. Try adjusting filters or create a new request.',
          });
        } else {
          console.log(`✅ Loaded ${data.requests?.length} requests`);
        }
      } else {
        console.error('❌ Request failed:', data.error || 'Unknown error');
        toast({
          title: 'Error',
          description: data.error || data.message || 'Failed to fetch custom design requests',
          variant: 'destructive',
        });
        setRequests([]);
      }
    } catch (error) {
      console.error('❌ Error fetching requests:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred while fetching requests',
        variant: 'destructive',
      });
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh hook - refreshes data every 30 seconds
  useAutoRefresh({
    refreshInterval: 30000,
    enabled: true,
    onRefresh: fetchRequests,
  });

  useEffect(() => {
    console.log('🔄 Effect triggered - fetching requests');
    fetchRequests();
  }, [currentPage, statusFilter, priorityFilter, userTypeFilter]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('🔍 Search term changed:', searchTerm);
      if (currentPage === 1) {
        fetchRequests();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleViewRequest = (request: CustomDesignRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  const handleOpenUpdateDialog = (request: CustomDesignRequest) => {
    setSelectedRequest(request);
    setUpdateStatus(request.status);
    setUpdatePriority(request.priority);
    setEstimatedPrice(request.estimatedPrice?.toString() || '');
    setAdminNotes(request.adminNotes || '');
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateRequest = async () => {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`/api/custom-design/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: updateStatus,
          priority: updatePriority,
          estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : null,
          adminNotes,
          sendStatusEmail,
        }),
      });

      const data = await response.json();

      if (response.ok || data.success) {
        toast({
          title: 'Success',
          description: 'Request updated successfully',
        });
        setIsUpdateDialogOpen(false);
        fetchRequests();
      } else {
        throw new Error(data.error || 'Failed to update');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update request',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Custom Design Requests</h1>
          <p className="text-gray-500 mt-1">
            Manage customer design requests • Auto-refreshes every 30s
          </p>
        </div>
        <Button onClick={fetchRequests} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Now
        </Button>
      </div>



      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
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
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>User Type</Label>
              <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="logged">Logged Users</SelectItem>
                  <SelectItem value="guest">Guest Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2">Loading...</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <Palette className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg font-medium">No custom design requests found</p>
              <p className="text-gray-400 text-sm mt-2">
                {statusFilter !== 'all' || priorityFilter !== 'all' || userTypeFilter !== 'all' || searchTerm
                  ? 'Try adjusting your filters or search criteria'
                  : 'Custom design requests will appear here once customers submit them'}
              </p>
              <div className="mt-4 space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setPriorityFilter('all');
                    setUserTypeFilter('all');
                    setCurrentPage(1);
                  }}
                >
                  Clear Filters
                </Button>
                <Button variant="outline" size="sm" onClick={fetchRequests}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Contact
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Priority
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {requests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-medium text-sm">
                                {request.customerDisplayName || request.customerName || 'N/A'}
                              </p>
                              {request.userType === 'logged' && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  Logged User
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Phone className="h-3 w-3" />
                              {request.phoneNumber}
                            </div>
                            {request.customerDisplayEmail && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <Mail className="h-3 w-3" />
                                {request.customerDisplayEmail}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="outline">
                            {request.userType === 'logged' ? (
                              <UserCheck className="h-3 w-3 mr-1" />
                            ) : (
                              <UserX className="h-3 w-3 mr-1" />
                            )}
                            {request.userType}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <Badge className={statusColors[request.status]}>
                            {request.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <Badge className={priorityColors[request.priority]}>
                            {request.priority}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(request.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-4">
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
                              onClick={() => handleOpenUpdateDialog(request)}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalCount}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* View Request Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              Custom Design Request Details
              {selectedRequest?.userType === 'logged' && (
                <Badge variant="outline" className="ml-2">
                  <UserCheck className="h-3 w-3 mr-1" />
                  Logged User
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Customer Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Customer Name</Label>
                  <p className="font-medium">
                    {selectedRequest.customerDisplayName || selectedRequest.customerName || 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Email</Label>
                  <p className="font-medium">
                    {selectedRequest.customerDisplayEmail || selectedRequest.customerEmail || 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Phone</Label>
                  <p className="font-medium">{selectedRequest.phoneNumber}</p>
                </div>
                <div>
                  <Label className="text-gray-500">User Type</Label>
                  <Badge variant="outline">
                    {selectedRequest.userType === 'logged' ? <UserCheck className="h-3 w-3 mr-1" /> : <UserX className="h-3 w-3 mr-1" />}
                    {selectedRequest.userType}
                  </Badge>
                </div>
              </div>

              {/* Design Details */}
              <div className="space-y-4">
                <div>
                  <Label className="font-medium">Design Description:</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded border text-sm">
                    {selectedRequest.designDescription}
                  </div>
                </div>
                {selectedRequest.colorDescription && (
                  <div>
                    <Label className="font-medium">Color Preferences:</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded border text-sm">
                      {selectedRequest.colorDescription}
                    </div>
                  </div>
                )}
                {selectedRequest.fabricPreference && (
                  <div>
                    <Label className="font-medium">Fabric Preference:</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded border text-sm">
                      {selectedRequest.fabricPreference}
                    </div>
                  </div>
                )}
              </div>

              {/* Reference Image */}
              {selectedRequest.imageUrl && (
                <div>
                  <Label className="font-medium">Reference Image:</Label>
                  <div className="mt-2">
                    <img 
                      src={selectedRequest.imageUrl} 
                      alt="Design reference" 
                      className="max-w-md rounded border"
                    />
                  </div>
                </div>
              )}

              {/* Measurements */}
              {selectedRequest.measurementData && (
                <div>
                  <Label className="font-medium">Measurements:</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded border">
                    <pre className="text-sm">
                      {JSON.stringify(selectedRequest.measurementData, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Status Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <Badge className={statusColors[selectedRequest.status]}>
                    {selectedRequest.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-gray-500">Priority</Label>
                  <Badge className={priorityColors[selectedRequest.priority]}>
                    {selectedRequest.priority}
                  </Badge>
                </div>
                {selectedRequest.estimatedPrice && (
                  <div>
                    <Label className="text-gray-500">Estimated Price</Label>
                    <p className="font-medium">₹{selectedRequest.estimatedPrice.toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <Label className="text-gray-500">Created</Label>
                  <p className="text-sm">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Admin Notes */}
              {selectedRequest.adminNotes && (
                <div>
                  <Label className="font-medium">Admin Notes:</Label>
                  <div className="mt-1 p-3 bg-yellow-50 rounded border text-sm">
                    {selectedRequest.adminNotes}
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              {selectedRequest.notes && (
                <div>
                  <Label className="font-medium">Additional Notes:</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded border text-sm">
                    {selectedRequest.notes}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
            {selectedRequest && (
              <Button onClick={() => {
                setIsDialogOpen(false);
                handleOpenUpdateDialog(selectedRequest);
              }}>
                Update Request
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Request Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Request</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Status */}
            <div>
              <Label>Status</Label>
              <Select value={updateStatus} onValueChange={setUpdateStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div>
              <Label>Priority</Label>
              <Select value={updatePriority} onValueChange={setUpdatePriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estimated Price */}
            <div>
              <Label>Estimated Price (₹)</Label>
              <Input
                type="number"
                placeholder="Enter estimated price"
                value={estimatedPrice}
                onChange={(e) => setEstimatedPrice(e.target.value)}
              />
            </div>

            {/* Admin Notes */}
            <div>
              <Label>Admin Notes</Label>
              <Textarea
                placeholder="Add internal notes about this request..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
              />
            </div>

            {/* Send Email Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendEmail"
                checked={sendStatusEmail}
                onCheckedChange={(checked) => setSendStatusEmail(checked as boolean)}
              />
              <Label htmlFor="sendEmail" className="cursor-pointer">
                Send status update email to customer
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRequest}>
              Update Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}