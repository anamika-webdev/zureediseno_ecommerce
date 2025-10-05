// src/app/dashboard/admin/custom-designs/page.tsx - COMPLETE VERSION WITH PAGINATION
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
  DialogTrigger,
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
  Search
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
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  assignedTo?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

// Options
const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'in_progress', label: 'In Progress' },
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

const userTypeOptions = [
  { value: 'all', label: 'All Users' },
  { value: 'logged', label: 'Logged Users' },
  { value: 'guest', label: 'Guest Users' },
];

// Color mappings
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
  // State
  const [requests, setRequests] = useState<CustomDesignRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<CustomDesignRequest | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Update form state
  const [updateStatus, setUpdateStatus] = useState('');
  const [updatePriority, setUpdatePriority] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const { toast } = useToast();

  // Fetch requests with pagination
  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        status: statusFilter,
        priority: priorityFilter,
        userType: userTypeFilter,
        search: searchQuery,
      });

      // Try admin endpoint first, fallback to main endpoint
      let response = await fetch(`/api/admin/custom-designs?${params}`);
      
      if (!response.ok) {
        console.log('Admin endpoint not available, trying main endpoint...');
        response = await fetch(`/api/custom-design?${params}`);
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch requests: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Custom designs API response:', data);
      
      // Handle different response structures
      if (data.success === false) {
        throw new Error(data.error || 'Failed to fetch requests');
      }
      
      const requests = data.requests || data.data || [];
      const totalCount = data.totalCount || data.total || requests.length;
      const totalPages = data.totalPages || Math.ceil(totalCount / itemsPerPage);
      
      setRequests(requests);
      setTotalPages(totalPages);
      setTotalCount(totalCount);
      
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch custom design requests",
        variant: "destructive",
      });
      
      // Set empty state on error
      setRequests([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Update request status
  const updateRequestStatus = async () => {
    if (!selectedRequest) return;

    try {
      setIsUpdating(true);
      
      const response = await fetch(`/api/custom-design/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: updateStatus,
          priority: updatePriority,
          estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : undefined,
          adminNotes: adminNotes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update request');
      }

      const updatedData = await response.json();
      
      toast({
        title: "Success",
        description: "Request updated successfully",
      });

      // Refresh the list
      fetchRequests();
      
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: "Error",
        description: "Failed to update request",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchRequests();
  }, [currentPage, itemsPerPage, statusFilter, priorityFilter, userTypeFilter]);

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchRequests();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Page change handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Open detail dialog
  const openDetailDialog = (request: CustomDesignRequest) => {
    setSelectedRequest(request);
    setUpdateStatus(request.status);
    setUpdatePriority(request.priority);
    setEstimatedPrice(request.estimatedPrice?.toString() || '');
    setAdminNotes(request.adminNotes || '');
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading custom design requests...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Palette className="w-8 h-8" />
            Custom Design Requests
          </h1>
          <p className="text-gray-500 mt-1">
            Manage and track custom design requests from customers ({totalCount} total requests)
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search by name, email, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div>
              <Label htmlFor="statusFilter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="statusFilter">
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

            {/* Priority Filter */}
            <div>
              <Label htmlFor="priorityFilter">Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger id="priorityFilter">
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

            {/* User Type Filter */}
            <div>
              <Label htmlFor="userTypeFilter">User Type</Label>
              <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                <SelectTrigger id="userTypeFilter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {userTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Items per page */}
          <div className="flex items-center gap-2 mt-4">
            <Label htmlFor="itemsPerPage" className="whitespace-nowrap text-sm">
              Items per page:
            </Label>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger id="itemsPerPage" className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Palette className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || userTypeFilter !== 'all'
                ? 'No custom design requests found matching your filters.'
                : 'No custom design requests yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {request.customerDisplayName || request.customerName || 'Unknown Customer'}
                        </h3>
                        <Badge className={statusColors[request.status] || 'bg-gray-100 text-gray-800'}>
                          {request.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge className={priorityColors[request.priority] || 'bg-gray-100 text-gray-800'}>
                          {request.priority.toUpperCase()}
                        </Badge>
                        {request.userType === 'logged' ? (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <UserCheck className="h-3 w-3" />
                            Logged User
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <UserX className="h-3 w-3" />
                            Guest
                          </Badge>
                        )}
                      </div>

                      {/* Contact Info */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {request.phoneNumber}
                        </div>
                        {request.customerDisplayEmail && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {request.customerDisplayEmail}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(request.createdAt)}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-700 mb-3 line-clamp-2">
                        {request.designDescription}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 text-xs">
                        {request.colorDescription && (
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded flex items-center gap-1">
                            <Palette className="h-3 w-3" />
                            Colors specified
                          </span>
                        )}
                        {request.fabricPreference && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                            Fabric: {request.fabricPreference}
                          </span>
                        )}
                        {request.imageUrl && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" />
                            Image attached
                          </span>
                        )}
                        {request.measurementData && (
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded flex items-center gap-1">
                            <Ruler className="h-3 w-3" />
                            Measurements provided
                          </span>
                        )}
                        {request.estimatedPrice && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-medium">
                            ₹{request.estimatedPrice}
                          </span>
                        )}
                        {request.user && (
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Account linked
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDetailDialog(request)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              Custom Design Request Details
                              {request.userType === 'logged' && (
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
                              <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                  <Users className="h-5 w-5" />
                                  Customer Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label className="font-medium">Name:</Label>
                                    <p className="mt-1">{selectedRequest.customerDisplayName || selectedRequest.customerName || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <Label className="font-medium">Phone:</Label>
                                    <p className="mt-1">{selectedRequest.phoneNumber}</p>
                                  </div>
                                  {selectedRequest.customerDisplayEmail && (
                                    <div>
                                      <Label className="font-medium">Email:</Label>
                                      <p className="mt-1">{selectedRequest.customerDisplayEmail}</p>
                                    </div>
                                  )}
                                  {selectedRequest.user && (
                                    <div className="md:col-span-2">
                                      <Label className="font-medium">Account Details:</Label>
                                      <div className="mt-1 p-3 bg-green-50 rounded border border-green-200">
                                        <p className="text-green-700 text-sm">
                                          ✅ Linked to user account
                                          <br />
                                          User: {selectedRequest.user.firstName} {selectedRequest.user.lastName} ({selectedRequest.user.email})
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Design Details */}
                              <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                  <Palette className="h-5 w-5" />
                                  Design Requirements
                                </h3>
                                <div>
                                  <Label className="font-medium">Design Description:</Label>
                                  <div className="mt-1 p-3 bg-gray-50 rounded border text-sm">
                                    {selectedRequest.designDescription}
                                  </div>
                                </div>
                                {selectedRequest.colorDescription && (
                                  <div>
                                    <Label className="font-medium">Color Preferences:</Label>
                                    <div className="mt-1 p-3 bg-purple-50 rounded border text-sm">
                                      {selectedRequest.colorDescription}
                                    </div>
                                  </div>
                                )}
                                {selectedRequest.fabricPreference && (
                                  <div>
                                    <Label className="font-medium">Fabric Preference:</Label>
                                    <div className="mt-1 p-3 bg-green-50 rounded border text-sm">
                                      {selectedRequest.fabricPreference}
                                    </div>
                                  </div>
                                )}
                                {selectedRequest.imageUrl && (
                                  <div>
                                    <Label className="font-medium">Reference Image:</Label>
                                    <div className="mt-1">
                                      <img
                                        src={selectedRequest.imageUrl}
                                        alt="Design reference"
                                        className="max-w-md max-h-64 object-contain rounded border shadow-sm"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Measurements */}
                              {selectedRequest.measurementData && (
                                <div className="space-y-4">
                                  <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Ruler className="h-5 w-5" />
                                    Measurements
                                  </h3>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {Object.entries(selectedRequest.measurementData).map(([key, value]) => (
                                      <div key={key} className="p-2 bg-gray-50 rounded border">
                                        <Label className="text-xs text-gray-600">{key}:</Label>
                                        <p className="text-sm font-medium">{value as string || 'Not provided'}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Request Management */}
                              <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                  <Settings className="h-5 w-5" />
                                  Request Management
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="updateStatus">Status:</Label>
                                    <Select value={updateStatus} onValueChange={setUpdateStatus}>
                                      <SelectTrigger id="updateStatus" className="mt-1">
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
                                  <div>
                                    <Label htmlFor="updatePriority">Priority:</Label>
                                    <Select value={updatePriority} onValueChange={setUpdatePriority}>
                                      <SelectTrigger id="updatePriority" className="mt-1">
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
                                  <div>
                                    <Label htmlFor="estimatedPrice">Estimated Price (₹):</Label>
                                    <Input
                                      id="estimatedPrice"
                                      type="number"
                                      placeholder="e.g., 2500"
                                      value={estimatedPrice}
                                      onChange={(e) => setEstimatedPrice(e.target.value)}
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label>Request ID:</Label>
                                    <div className="mt-1 p-2 bg-gray-100 rounded border text-sm font-mono">
                                      {selectedRequest.id}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor="adminNotes">Admin Notes:</Label>
                                  <Textarea
                                    id="adminNotes"
                                    placeholder="Add internal notes about this request..."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    className="mt-1"
                                    rows={4}
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          <DialogFooter>
                            <Button
                              onClick={updateRequestStatus}
                              disabled={isUpdating}
                            >
                              {isUpdating ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Updating...
                                </>
                              ) : (
                                'Update Request'
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={totalCount}
            />
          )}
        </>
      )}
    </div>
  );
}