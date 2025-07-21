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
} from '@/components/ui/dialog';
import { 
  Eye, 
  Phone, 
  Calendar, 
  Users, 
  Palette, 
  ImageIcon, 
  Ruler,
  ChevronLeft,
  ChevronRight,
  Filter,
  Settings,
  Clock,
  Mail,
  UserCheck,
  UserX,
  Loader2
} from 'lucide-react';

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
  const [requests, setRequests] = useState<CustomDesignRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<CustomDesignRequest | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { toast } = useToast();

  // Fetch requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        status: statusFilter,
        priority: priorityFilter,
        userType: userTypeFilter,
        search: searchQuery,
      });

      // Try admin endpoint first, fallback to main endpoint
      let response = await fetch(`/api/admin/custom-designs?${params}`);
      
      if (!response.ok) {
        console.log('Admin endpoint not available, trying main endpoint...');
        // Fallback to main custom-design endpoint
        response = await fetch(`/api/custom-design?${params}`);
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch requests: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      // Handle different response structures
      if (data.success === false) {
        throw new Error(data.error || 'Failed to fetch requests');
      }
      
      const requests = data.requests || data.data || [];
      const totalCount = data.totalCount || data.total || requests.length;
      const totalPages = data.totalPages || Math.ceil(totalCount / 10);
      
      setRequests(requests);
      setTotalPages(totalPages);
      setTotalCount(totalCount);
      
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch custom design requests. Please check if the API endpoint exists.",
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
  const updateRequestStatus = async (
    id: string, 
    status: string, 
    priority?: string, 
    price?: number, 
    notes?: string
  ) => {
    try {
      setIsUpdating(true);
      
      const response = await fetch(`/api/custom-design/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          priority,
          estimatedPrice: price,
          adminNotes: notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update request');
      }

      const updatedRequest = await response.json();
      
      // Update the requests list
      setRequests(prev => prev.map(req => 
        req.id === id ? { ...req, ...updatedRequest.request } : req
      ));

      // Update selected request if it's the same one
      if (selectedRequest?.id === id) {
        setSelectedRequest({ ...selectedRequest, ...updatedRequest.request });
      }

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
  }, [page, statusFilter, priorityFilter, userTypeFilter, searchQuery]);

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Custom Design Requests</h1>
          <p className="text-gray-600 mt-1">
            Manage and track custom design requests from customers
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total Requests</p>
          <p className="text-2xl font-bold">{totalCount}</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Search</Label>
              <Input
                placeholder="Search by name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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

            <div>
              <Label>User Type</Label>
              <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                <SelectTrigger>
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
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading requests...</span>
          </div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600">No custom design requests found</p>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
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
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {request.phoneNumber}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(request.createdAt)}
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3 line-clamp-2">
                      {request.designDescription}
                    </p>

                    <div className="flex flex-wrap gap-2 text-xs">
                      {request.colorDescription && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          <Palette className="h-3 w-3 inline mr-1" />
                          Colors specified
                        </span>
                      )}
                      {request.fabricPreference && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                          Fabric: {request.fabricPreference}
                        </span>
                      )}
                      {request.imageUrl && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          <ImageIcon className="h-3 w-3 inline mr-1" />
                          Image attached
                        </span>
                      )}
                      {request.measurementData && (
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          <Ruler className="h-3 w-3 inline mr-1" />
                          Measurements provided
                        </span>
                      )}
                      {request.estimatedPrice && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          ₹{request.estimatedPrice}
                        </span>
                      )}
                      {request.user && (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                          <Users className="h-3 w-3 inline mr-1" />
                          Account linked
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            Custom Design Request Details 
                            {request.userType === 'logged' ? 
                              <span className="text-green-600"> (Logged User)</span> : 
                              <span className="text-blue-600"> (Guest)</span>
                            }
                          </DialogTitle>
                        </DialogHeader>
                        {selectedRequest && (
                          <RequestDetailsDialog
                            request={selectedRequest}
                            onUpdate={updateRequestStatus}
                            isUpdating={isUpdating}
                          />
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`tel:${request.phoneNumber}`)}
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          
          <span className="flex items-center px-4">
            Page {page} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

// Enhanced Request Details Dialog Component
function RequestDetailsDialog({
  request,
  onUpdate,
  isUpdating,
}: {
  request: CustomDesignRequest;
  onUpdate: (id: string, status: string, priority?: string, price?: number, notes?: string) => void;
  isUpdating: boolean;
}) {
  const [status, setStatus] = useState(request.status);
  const [priority, setPriority] = useState(request.priority);
  const [estimatedPrice, setEstimatedPrice] = useState(request.estimatedPrice?.toString() || '');
  const [adminNotes, setAdminNotes] = useState(request.adminNotes || '');

  const handleUpdate = () => {
    onUpdate(
      request.id,
      status,
      priority,
      estimatedPrice ? parseFloat(estimatedPrice) : undefined,
      adminNotes
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Parse measurements data
  const measurements = request.measurementData ? 
    (typeof request.measurementData === 'string' ? 
      JSON.parse(request.measurementData) : 
      request.measurementData) : null;

  return (
    <div className="space-y-6">
      {/* Customer Information with User Type */}
      <div className={`p-4 rounded-lg ${
        request.userType === 'logged' ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'
      }`}>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          {request.userType === 'logged' ? (
            <UserCheck className="h-5 w-5 text-green-600" />
          ) : (
            <UserX className="h-5 w-5 text-blue-600" />
          )}
          Customer Information 
          <Badge className={
            request.userType === 'logged' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
          }>
            {request.userType === 'logged' ? 'Logged User' : 'Guest User'}
          </Badge>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="font-medium">Name:</Label>
            <p className="mt-1 p-2 bg-white rounded border">
              {request.customerDisplayName || request.customerName || 'Not provided'}
            </p>
          </div>
          <div>
            <Label className="font-medium">Email:</Label>
            <p className="mt-1 p-2 bg-white rounded border">
              {request.customerDisplayEmail || request.customerEmail || 'Not provided'}
            </p>
          </div>
          <div>
            <Label className="font-medium">Phone:</Label>
            <p className="mt-1 p-2 bg-white rounded border flex items-center gap-2">
              {request.phoneNumber}
              <button
                onClick={() => window.open(`tel:${request.phoneNumber}`)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Phone className="h-4 w-4" />
              </button>
            </p>
          </div>
          <div>
            <Label className="font-medium">Submitted:</Label>
            <p className="mt-1 p-2 bg-white rounded border">{formatDate(request.createdAt)}</p>
          </div>
          {request.user && (
            <div className="md:col-span-2">
              <Label className="font-medium">Account Details:</Label>
              <p className="mt-1 p-2 bg-white rounded border text-green-700">
                ✅ Linked to user account (ID: {request.user.id})
                <br />
                User: {request.user.firstName} {request.user.lastName} ({request.user.email})
              </p>
            </div>
          )}
          {!request.user && request.userType === 'guest' && (
            <div className="md:col-span-2">
              <Label className="font-medium">Account Status:</Label>
              <p className="mt-1 p-2 bg-white rounded border text-blue-700">
                👤 Guest submission - No account linked
              </p>
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
          <div className="mt-1 p-3 bg-gray-50 rounded border text-sm max-h-40 overflow-y-auto">
            {request.designDescription}
          </div>
        </div>

        {request.colorDescription && (
          <div>
            <Label className="font-medium">Color Preferences:</Label>
            <div className="mt-1 p-3 bg-purple-50 rounded border text-sm">
              {request.colorDescription}
            </div>
          </div>
        )}

        {request.fabricPreference && (
          <div>
            <Label className="font-medium">Fabric Preference:</Label>
            <div className="mt-1 p-3 bg-green-50 rounded border text-sm">
              {request.fabricPreference}
            </div>
          </div>
        )}

        {request.imageUrl && (
          <div>
            <Label className="font-medium">Reference Image:</Label>
            <div className="mt-1">
              <img 
                src={request.imageUrl} 
                alt="Design reference" 
                className="max-w-xs max-h-48 object-contain rounded border shadow-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                {request.imageName && `Original filename: ${request.imageName}`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Measurements Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Ruler className="h-5 w-5" />
          Measurements
        </h3>
        
        {measurements ? (
          <div className="space-y-3">
            {measurements.providedByCustomer ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Customer will provide measurements separately</span>
                </div>
                <p className="text-sm text-yellow-700">
                  📞 Customer has indicated they will provide measurements via phone call or visit.
                  Contact them using the phone number above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                {[
                  { label: 'Chest', value: measurements.chest },
                  { label: 'Waist', value: measurements.waist },
                  { label: 'Hips', value: measurements.hips },
                  { label: 'Shoulders', value: measurements.shoulders },
                  { label: 'Inseam', value: measurements.inseam },
                  { label: 'Sleeves', value: measurements.sleeves }
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white p-3 rounded border">
                    <Label className="text-xs font-medium text-gray-600">{label}:</Label>
                    <p className="text-sm font-semibold">
                      {value ? `${value}"` : 'Not provided'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-600">No measurement data provided</p>
          </div>
        )}
      </div>

      {/* Request Status and Management */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Request Management
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="font-medium">Status:</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="mt-1">
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
            <Label className="font-medium">Priority:</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="mt-1">
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
            <Label className="font-medium">Estimated Price (₹):</Label>
            <Input
              type="number"
              placeholder="e.g., 2500"
              value={estimatedPrice}
              onChange={(e) => setEstimatedPrice(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="font-medium">Request ID:</Label>
            <p className="mt-1 p-2 bg-gray-100 rounded border text-sm font-mono">
              {request.id}
            </p>
          </div>
        </div>

        <div>
          <Label className="font-medium">Admin Notes:</Label>
          <Textarea
            placeholder="Add internal notes about this request..."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            className="mt-1 h-24"
          />
        </div>

        {/* Existing admin notes */}
        {request.adminNotes && request.adminNotes !== adminNotes && (
          <div>
            <Label className="font-medium">Previous Notes:</Label>
            <div className="mt-1 p-3 bg-gray-50 border rounded text-sm">
              {request.adminNotes}
            </div>
          </div>
        )}
      </div>

      {/* Timeline/Activity */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activity Timeline
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded border">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">Request Submitted</p>
              <p className="text-xs text-gray-600">{formatDate(request.createdAt)}</p>
            </div>
          </div>
          
          {request.updatedAt !== request.createdAt && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-xs text-gray-600">{formatDate(request.updatedAt)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="flex-1"
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Request'
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={() => window.open(`tel:${request.phoneNumber}`)}
          className="flex items-center gap-2"
        >
          <Phone className="h-4 w-4" />
          Call Customer
        </Button>
        
        {(request.customerDisplayEmail || request.customerEmail) && (
          <Button
            variant="outline"
            onClick={() => window.open(`mailto:${request.customerDisplayEmail || request.customerEmail}`)}
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Email
          </Button>
        )}
      </div>
    </div>
  );
}