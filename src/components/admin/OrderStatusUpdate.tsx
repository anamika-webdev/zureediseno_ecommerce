// src/components/admin/OrderStatusUpdate.tsx - Admin Order Status Update Component
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Edit, Package, CreditCard, Truck, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  tracking_number?: string;
  notes?: string;
  total_amount: number;
  shipping_name: string;
  shipping_email: string;
  created_at: string;
  customer?: {
    name: string;
    email: string;
  };
}

interface OrderStatusUpdateProps {
  order: Order;
  onOrderUpdate: (orderId: string, updates: any) => void;
}

export function OrderStatusUpdate({ order, onOrderUpdate }: OrderStatusUpdateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: order.status,
    paymentStatus: order.payment_status,
    trackingNumber: order.tracking_number || '',
    notes: order.notes || ''
  });

  const orderStatuses = [
    { value: 'pending', label: 'Pending', icon: Package, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'processing', label: 'Processing', icon: Package, color: 'bg-blue-100 text-blue-800' },
    { value: 'shipped', label: 'Shipped', icon: Truck, color: 'bg-purple-100 text-purple-800' },
    { value: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'bg-red-100 text-red-800' },
    { value: 'returned', label: 'Returned', icon: RotateCcw, color: 'bg-gray-100 text-gray-800' }
  ];

  const paymentStatuses = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
    { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
    { value: 'refunded', label: 'Refunded', color: 'bg-blue-100 text-blue-800' }
  ];

  const getStatusBadge = (status: string, type: 'order' | 'payment') => {
    const statuses = type === 'order' ? orderStatuses : paymentStatuses;
    const statusObj = statuses.find(s => s.value === status);
    const Icon = type === 'order' && statusObj ? (statusObj as any).icon : CreditCard;
    
    return (
      <Badge className={statusObj?.color || 'bg-gray-100 text-gray-800'}>
        <Icon className="w-3 h-3 mr-1" />
        {statusObj?.label || status}
      </Badge>
    );
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: formData.status,
          paymentStatus: formData.paymentStatus,
          trackingNumber: formData.trackingNumber.trim() || null,
          notes: formData.notes.trim() || null
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update order');
      }

      const data = await response.json();
      
      // Update parent component
      onOrderUpdate(order.id, data.order);
      
      toast.success('Order status updated successfully');
      setIsOpen(false);

    } catch (error) {
      console.error('Error updating order:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update order');
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    return (
      formData.status !== order.status ||
      formData.paymentStatus !== order.payment_status ||
      formData.trackingNumber !== (order.tracking_number || '') ||
      formData.notes !== (order.notes || '')
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4 mr-2" />
          Update Status
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Update Order Status - {order.order_number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Customer:</span> {order.customer?.name || order.shipping_name}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {order.customer?.email || order.shipping_email}
                </div>
                <div>
                  <span className="font-medium">Amount:</span> ₹{order.total_amount.toFixed(2)}
                </div>
                <div>
                  <span className="font-medium">Date:</span> {new Date(order.created_at).toLocaleDateString()}
                </div>
              </div>
              
              <Separator />
              
              <div className="flex gap-4">
                <div>
                  <span className="font-medium text-sm">Current Status:</span>
                  <div className="mt-1">
                    {getStatusBadge(order.status, 'order')}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-sm">Payment Status:</span>
                  <div className="mt-1">
                    {getStatusBadge(order.payment_status, 'payment')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Update Form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Order Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select order status" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatuses.map((status) => {
                      const Icon = status.icon;
                      return (
                        <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center">
                            <Icon className="w-4 h-4 mr-2" />
                            {status.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Status */}
              <div className="space-y-2">
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select value={formData.paymentStatus} onValueChange={(value) => setFormData({...formData, paymentStatus: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-2" />
                          {status.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tracking Number */}
              <div className="space-y-2">
                <Label htmlFor="trackingNumber">Tracking Number (Optional)</Label>
                <Input
                  id="trackingNumber"
                  value={formData.trackingNumber}
                  onChange={(e) => setFormData({...formData, trackingNumber: e.target.value})}
                  placeholder="Enter tracking number"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Add any internal notes about this order..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !hasChanges()}
              className="min-w-[120px]"
            >
              {loading ? 'Updating...' : 'Update Order'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}