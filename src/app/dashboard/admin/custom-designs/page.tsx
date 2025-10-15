// src/app/dashboard/admin/custom-designs/page.tsx - COMPLETE CORRECTED VERSION
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  ExternalLink
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
  assignedTo?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

// Helper component to display design details
function DesignDetailsDisplay({ designDescription }: { designDescription: string }) {
  const lines = designDescription.split('\n').filter(line => line.trim());
  
  const designMatch = lines.find(l => l.startsWith('Design:'));
  const fabricTypeMatch = lines.find(l => l.startsWith('Fabric Type:'));
  const fabricPatternMatch = lines.find(l => l.startsWith('Fabric Pattern:'));
  const colorsMatch = lines.find(l => l.startsWith('Colors:'));
  const additionalMatch = lines.find(l => l.startsWith('Additional Details:'));
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {designMatch && (
        <div>
          <Label className="font-medium text-gray-700">Design Type:</Label>
          <div className="mt-1 p-3 bg-blue-50 rounded border border-blue-200 text-sm font-semibold text-blue-900">
            {designMatch.replace('Design:', '').trim()}
          </div>
        </div>
      )}
      
      {fabricTypeMatch && (
        <div>
          <Label className="font-medium text-gray-700">Fabric Type:</Label>
          <div className="mt-1 p-3 bg-green-50 rounded border border-green-200 text-sm font-semibold text-green-900">
            {fabricTypeMatch.replace('Fabric Type:', '').trim()}
          </div>
        </div>
      )}
      
      {fabricPatternMatch && (
        <div>
          <Label className="font-medium text-gray-700">Fabric Pattern:</Label>
          <div className="mt-1 p-3 bg-amber-50 rounded border border-amber-200 text-sm font-semibold text-amber-900">
            {fabricPatternMatch.replace('Fabric Pattern:', '').trim()}
          </div>
        </div>
      )}
      
      {colorsMatch && (
        <div className="md:col-span-2">
          <Label className="font-medium text-gray-700">Selected Colors:</Label>
          <div className="mt-1 p-3 bg-purple-50 rounded border border-purple-200">
            <div className="flex flex-wrap gap-2">
              {colorsMatch.replace('Colors:', '').trim().split(',').map((color, idx) => {
                const trimmedColor = color.trim();
                return (
                  <div key={idx} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border shadow-sm">
                    <div 
                      className="w-5 h-5 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: trimmedColor }}
                    />
                    <span className="text-xs font-mono text-gray-700">{trimmedColor}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      {additionalMatch && (
        <div className="md:col-span-2">
          <Label className="font-medium text-gray-700">Additional Details:</Label>
          <div className="mt-1 p-3 bg-gray-50 rounded border text-sm">
            {additionalMatch.replace('Additional Details:', '').trim()}
          </div>
        </div>
      )}
    </div>
  );
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

  // Fetch requests
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

      const response = await fetch(`/api/custom-design?${params}`);
      const data = await response.json();

      if (response.ok) {
        setRequests(data.requests || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotalCount(data.pagination?.total || 0);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch custom design requests',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while fetching requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentPage, statusFilter, priorityFilter, userTypeFilter]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchRequests();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // View request details
  const handleViewRequest = (request: CustomDesignRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  // Open update dialog
  const handleOpenUpdateDialog = (request: CustomDesignRequest) => {
    setSelectedRequest(request);
    setUpdateStatus(request.status);
    setUpdatePriority(request.priority);
    setEstimatedPrice(request.estimatedPrice?.toString() || '');
    setAdminNotes(request.adminNotes || '');
    setSendStatusEmail(false);
    setIsUpdateDialogOpen(true);
  };

  // Update request
  const handleUpdateRequest = async () => {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`/api/custom-design/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: updateStatus,
          priority: updatePriority,
          estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : undefined,
          adminNotes,
          sendStatusEmail,
          contactedAt: updateStatus === 'contacted' ? new Date().toISOString() : undefined,
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

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setUserTypeFilter('all');
    setCurrentPage(1);
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
                  placeholder="Search by name, phone, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
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

            {/* Priority Filter */}
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

            {/* User Type Filter */}
            <div>
              <Label>User Type</Label>
              <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {userTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reset Button */}
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Design Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <Palette className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No custom design requests found</p>
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
                              {request.userType === 'guest' && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  <UserX className="h-3 w-3 mr-1" />
                                  Guest
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm">
                            <div className="flex items-center gap-1 text-gray-900">
                              <Phone className="h-3 w-3" />
                              {request.phoneNumber}
                            </div>
                            {request.customerDisplayEmail && (
                              <div className="flex items-center gap-1 text-gray-500 mt-1">
                                <Mail className="h-3 w-3" />
                                {request.customerDisplayEmail}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-1">
                            {request.imageUrl && (
                              <Badge variant="secondary" className="text-xs">
                                <ImageIcon className="h-3 w-3 mr-1" />
                                Image
                              </Badge>
                            )}
                            {request.measurementData && (
                              <Badge variant="secondary" className="text-xs">
                                <Ruler className="h-3 w-3 mr-1" />
                                Measurements
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge className={statusColors[request.status] || 'bg-gray-100'}>
                            {request.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <Badge className={priorityColors[request.priority] || 'bg-gray-100'}>
                            {request.priority.toUpperCase()}
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

              {/* Pagination */}
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
                    <p className="mt-1 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {selectedRequest.phoneNumber}
                    </p>
                  </div>
                  {selectedRequest.customerDisplayEmail && (
                    <div>
                      <Label className="font-medium">Email:</Label>
                      <p className="mt-1 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {selectedRequest.customerDisplayEmail}
                      </p>
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
                
                <DesignDetailsDisplay designDescription={selectedRequest.designDescription} />
                
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900">
                    View Full Description
                  </summary>
                  <div className="mt-2 p-3 bg-gray-50 rounded border text-sm whitespace-pre-line">
                    {selectedRequest.designDescription}
                  </div>
                </details>
              </div>

              {/* Reference Image */}
              {selectedRequest.imageUrl && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Reference Image
                  </h3>
                  <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
                    <img
                      src={selectedRequest.imageUrl}
                      alt="Design reference"
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                  {selectedRequest.imageName && (
                    <p className="text-xs text-gray-500">
                      Filename: {selectedRequest.imageName}
                    </p>
                  )}
                  
                    href={selectedRequest.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open in New Tab
                  </a>
                </div>
              )}

              {/* Measurements */}
              {selectedRequest.measurementData && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Ruler className="h-5 w-5" />
                    Body Measurements
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(selectedRequest.measurementData as Record<string, any>).map(([key, value]) => {
                      if (key === 'providedByCustomer') return null;
                      return (
                        <div key={key} className="bg-blue-50 p-3 rounded border border-blue-200">
                          <Label className="text-xs text-blue-700 capitalize font-medium">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </Label>
                          <p className="text-sm font-semibold text-blue-900 mt-1">{value || 'Not provided'}</p>
                        </div>
                      );
                    })}
                  </div>
                  {(selectedRequest.measurementData as any).providedByCustomer && (
                    <p className="text-xs text-gray-500 italic">
                      * Customer will provide measurements separately
                    </p>
                  )}
                </div>
              )}

          {/* Request Status & Notes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Request Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Status:</Label>
                    <div className="mt-1">
                      <Badge className={statusColors[selectedRequest.status]}>
                        {selectedRequest.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="font-medium">Priority:</Label>
                    <div className="mt-1">
                      <Badge className={priorityColors[selectedRequest.priority]}>
                        {selectedRequest.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  {selectedRequest.estimatedPrice && (
                    <div>
                      <Label className="font-medium">Estimated Price:</Label>
                      <p className="mt-1 text-lg font-semibold">₹{selectedRequest.estimatedPrice}</p>
                    </div>
                  )}
                  <div>
                    <Label className="font-medium">Submitted:</Label>
                    <p className="mt-1 text-sm">
                      {new Date(selectedRequest.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {selectedRequest.adminNotes && (
                  <div>
                    <Label className="font-medium">Admin Notes:</Label>
                    <div className="mt-1 p-3 bg-yellow-50 rounded border border-yellow-200 text-sm">
                      {selectedRequest.adminNotes}
                    </div>
                  </div>
                )}
                {selectedRequest.notes && (
                  <div>
                    <Label className="font-medium">Additional Notes:</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded border text-sm">
                      {selectedRequest.notes}
                    </div>
                  </div>
                )}
              </div>
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
                value={estimatedPrice}
                onChange={(e) => setEstimatedPrice(e.target.value)}
                placeholder="Enter estimated price"
              />
            </div>

            {/* Admin Notes */}
            <div>
              <Label>Admin Notes</Label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes..."
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
              <label
                htmlFor="sendEmail"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Send status update email to customer
              </label>
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
                value={estimatedPrice}
                onChange={(e) => setEstimatedPrice(e.target.value)}
                placeholder="Enter estimated price"
              />
            </div>

            {/* Admin Notes */}
            <div>
              <Label>Admin Notes</Label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes..."
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
              <label
                htmlFor="sendEmail"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Send status update email to customer
              </label>
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