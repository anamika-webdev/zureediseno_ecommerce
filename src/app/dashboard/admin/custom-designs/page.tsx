// src/app/dashboard/admin/custom-designs/page.tsx - Enhanced Universal Version
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Eye,
  Phone,
  Mail,
  User,
  Calendar,
  Image as ImageIcon,
  Ruler,
  Palette,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Edit,
  UserCheck,
  UserX,
  Users,
  Filter,
} from 'lucide-react';

interface CustomDesignRequest {
  id: string;
  customerName: string | null;
  customerEmail: string | null;
  phoneNumber: string;
  designDescription: string;
  colorDescription: string | null;
  fabricPreference: string | null;
  imageUrl: string | null;
  imageName: string | null;
  measurementData: any;
  status: string;
  priority: string;
  estimatedPrice: number | null;
  notes: string | null;
  adminNotes: string | null;
  followUpSent: boolean;
  followUpSentAt: string | null;
  contactedAt: string | null;
  createdAt: string;
  updatedAt: string;
  userType: 'logged' | 'guest';
  customerDisplayName: string;
  customerDisplayEmail: string;
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);

  const { toast } = useToast();

  // Enhanced stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    contacted: 0,
    inProgress: 0,
    completed: 0,
    loggedUsers: 0,
    guests: 0,
    loggedUsersTotal: 0,
    guestsTotal: 0,
  });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(priorityFilter !== 'all' && { priority: priorityFilter }),
        ...(userTypeFilter !== 'all' && { userType: userTypeFilter }),
        ...(searchTerm && { search: searchTerm }),
      });

      console.log('🔍 Fetching requests with params:', params.toString());
      
      const response = await fetch(`/api/custom-design?${params}`);
      if (!response.ok) throw new Error('Failed to fetch requests');

      const data = await response.json();
      setRequests(data.requests || []);
      setTotalPages(data.pagination?.pages || 1);

      // Enhanced stats with user type breakdown
      const total = data.pagination?.total || 0;
      const pending = (data.requests || []).filter((r: any) => r.status === 'pending').length;
      const contacted = (data.requests || []).filter((r: any) => r.status === 'contacted').length;
      const inProgress = (data.requests || []).filter((r: any) => r.status === 'in_progress').length;
      const completed = (data.requests || []).filter((r: any) => r.status === 'completed').length;

      setStats({
        total,
        pending,
        contacted,
        inProgress,
        completed,
        loggedUsers: data.statistics?.loggedUsers || 0,
        guests: data.statistics?.guests || 0,
        loggedUsersTotal: data.statistics?.loggedUsersTotal || 0,
        guestsTotal: data.statistics?.guestsTotal || 0,
      });

      console.log('✅ Requests fetched successfully:', {
        total: data.requests?.length,
        loggedUsers: data.statistics?.loggedUsers,
        guests: data.statistics?.guests
      });

    } catch (error) {
      console.error('❌ Error fetching requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch custom design requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, statusFilter, priorityFilter, userTypeFilter, searchTerm]);

  const updateRequestStatus = async (
    requestId: string,
    status: string,
    priority?: string,
    estimatedPrice?: number,
    adminNotes?: string
  ) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/custom-design/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          priority,
          estimatedPrice,
          adminNotes,
          contactedAt: status === 'contacted' ? new Date().toISOString() : undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to update request');

      toast({
        title: 'Success',
        description: 'Request updated successfully',
      });

      fetchRequests();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: 'Error',
        description: 'Failed to update request',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
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

  const exportRequests = () => {
    const csvData = requests.map(request => ({
      'Request ID': request.id,
      'Customer Name': request.customerDisplayName,
      'Email': request.customerDisplayEmail,
      'Phone': request.phoneNumber,
      'User Type': request.userType === 'logged' ? 'Logged User' : 'Guest',
      'Status': request.status,
      'Priority': request.priority,
      'Created At': formatDate(request.createdAt),
      'Design Description': request.designDescription.replace(/,/g, ';'),
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `custom-design-requests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Custom Design Requests</h1>
          <p className="text-gray-600">Manage requests from both logged users and guests</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={exportRequests} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={fetchRequests} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time: {stats.loggedUsersTotal + stats.guestsTotal}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logged Users</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.loggedUsers}</div>
            <p className="text-xs text-muted-foreground">Total: {stats.loggedUsersTotal}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guest Users</CardTitle>
            <UserX className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.guests}</div>
            <p className="text-xs text-muted-foreground">Total: {stats.guestsTotal}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <AlertCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, phone, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="User type" />
              </SelectTrigger>
              <SelectContent>
                {userTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
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
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || userTypeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No custom design requests have been submitted yet.'}
              </p>
              <div className="mt-4">
                <Button 
                  onClick={() => window.open('/tailoredoutfit', '_blank')}
                  variant="outline"
                >
                  Test Custom Design Form
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {request.customerDisplayName}
                      </h3>
                      
                      {/* User Type Badge */}
                      {request.userType === 'logged' ? (
                        <Badge className="bg-green-100 text-green-800">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Logged User
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-800">
                          <UserX className="h-3 w-3 mr-1" />
                          Guest
                        </Badge>
                      )}
                      
                      <Badge className={statusColors[request.status]}>
                        {request.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={priorityColors[request.priority]}>
                        {request.priority}
                      </Badge>
                      {!request.followUpSent && (
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          No Follow-up
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {request.phoneNumber}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {request.customerDisplayEmail}
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

  return (
    <div className="space-y-6">
      {/* Customer Information with User Type */}
      <div className={`p-4 rounded-lg ${
        request.userType === 'logged' ? 'bg-green-50' : 'bg-blue-50'
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
            <p>{request.customerDisplayName}</p>
          </div>
          <div>
            <Label className="font-medium">Email:</Label>
            <p>{request.customerDisplayEmail}</p>
          </div>
          <div>
            <Label className="font-medium">Phone:</Label>
            <p>{request.phoneNumber}</p>
          </div>
          <div>
            <Label className="font-medium">Submitted:</Label>
            <p>{formatDate(request.createdAt)}</p>
          </div>
          {request.user && (
            <div className="md:col-span-2">
              <Label className="font-medium">Account Details:</Label>
              <p className="text-green-700">
                ✅ Linked to user account (ID: {request.user.id})
              </p>
            </div>
          )}
          {!request.user && request.userType === 'guest' && (
            <div className="md:col-span-2">
              <Label className="font-medium">Account Status:</Label>
              <p className="text-blue-700">
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
          <p className="mt-1 p-3 bg-gray-50 rounded border text-sm">
            {request.designDescription}
          </p>
        </div>

        {request.colorDescription && (
          <div>
            <Label className="font-medium">Color Preferences:</Label>
            <p className="mt-1 p-3 bg-gray-50 rounded border text-sm">
              {request.colorDescription}
            </p>
          </div>
        )}

        {request.fabricPreference && (
          <div>
            <Label className="font-medium">Fabric Preference:</Label>
            <p className="mt-1 p-3 bg-gray-50 rounded border text-sm">
              {request.fabricPreference}
            </p>
          </div>
        )}
      </div>

      {/* Admin Controls */}
      <div className="bg-yellow-50 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Edit className="h-5 w-5" />
          Admin Controls
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
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

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
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

          <div>
            <Label htmlFor="price">Estimated Price (₹)</Label>
            <Input
              id="price"
              type="number"
              placeholder="0"
              value={estimatedPrice}
              onChange={(e) => setEstimatedPrice(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="adminNotes">Admin Notes</Label>
          <Textarea
            id="adminNotes"
            placeholder="Add internal notes about this request..."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={4}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4 border-t">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.open(`tel:${request.phoneNumber}`)}
          >
            <Phone className="h-4 w-4 mr-2" />
            Call Customer
          </Button>
          
          {request.customerDisplayEmail !== 'No email provided' && (
            <Button
              variant="outline"
              onClick={() => window.open(`mailto:${request.customerDisplayEmail}`)}
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleUpdate}
            disabled={isUpdating}
            className="bg-black hover:bg-gray-800 text-white"
          >
            {isUpdating ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Updating...
              </div>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Update Request
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}