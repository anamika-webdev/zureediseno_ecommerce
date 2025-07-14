// src/components/order/OrderTracking.tsx - Customer Order Tracking Component
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

interface TrackingData {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  shipping: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
    imageUrl?: string;
    total: number;
  }>;
  customer: {
    name: string;
    email: string;
  };
  timeline: Array<{
    status: string;
    label: string;
    description: string;
    date: string;
    completed: boolean;
    icon: string;
  }>;
  estimatedDelivery: string;
  statusDisplay: {
    order: {
      label: string;
      color: string;
      description: string;
    };
    payment: {
      label: string;
      color: string;
    };
  };
}

export function OrderTracking() {
  const [formData, setFormData] = useState({
    orderNumber: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.orderNumber.trim() || !formData.email.trim()) {
      toast.error('Please enter both order number and email address');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setTrackingData(null);

      const response = await fetch('/api/track-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNumber: formData.orderNumber.trim(),
          email: formData.email.trim().toLowerCase()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to track order');
      }

      setTrackingData(data.order);
      toast.success('Order found successfully!');

    } catch (error) {
      console.error('Error tracking order:', error);
      setError(error instanceof Error ? error.message : 'Failed to track order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (iconString: string) => {
    const iconMap: Record<string, any> = {
      '📋': Clock,
      '📦': Package,
      '🚚': Truck,
      '✅': CheckCircle,
      '❌': XCircle,
      '↩️': RotateCcw
    };
    return iconMap[iconString] || Clock;
  };

  const getStatusColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="space-y-8">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Track Your Order
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orderNumber">Order Number</Label>
                <Input
                  id="orderNumber"
                  type="text"
                  placeholder="e.g., ORD-2024-001234"
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({...formData, orderNumber: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              {loading ? 'Tracking...' : 'Track Order'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tracking Results */}
      {trackingData && (
        <div className="space-y-6">
          {/* Order Header */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">Order {trackingData.orderNumber}</CardTitle>
                  <p className="text-gray-600">
                    Placed on {new Date(trackingData.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge className={getStatusColor(trackingData.statusDisplay.order.color)}>
                    {trackingData.statusDisplay.order.label}
                  </Badge>
                  <Badge className={getStatusColor(trackingData.statusDisplay.payment.color)}>
                    {trackingData.statusDisplay.payment.label}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>
                    <strong>Estimated Delivery:</strong> {trackingData.estimatedDelivery}
                  </span>
                </div>
                {trackingData.trackingNumber && (
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-500" />
                    <span>
                      <strong>Tracking:</strong> {trackingData.trackingNumber}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <span>
                    <strong>Total:</strong> ₹{trackingData.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trackingData.timeline.map((step, index) => {
                  const Icon = getStatusIcon(step.icon);
                  const isLast = index === trackingData.timeline.length - 1;
                  
                  return (
                    <div key={step.status} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center border-2
                          ${step.completed 
                            ? 'bg-green-100 border-green-300 text-green-600' 
                            : 'bg-gray-100 border-gray-300 text-gray-400'
                          }
                        `}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {!isLast && (
                          <div className={`
                            w-px h-8 mt-2
                            ${step.completed ? 'bg-green-300' : 'bg-gray-300'}
                          `} />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <h4 className={`font-medium ${step.completed ? 'text-green-600' : 'text-gray-500'}`}>
                              {step.label}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                          </div>
                          {step.date && (
                            <div className="text-xs text-gray-500 mt-2 md:mt-0">
                              {new Date(step.date).toLocaleString('en-IN')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trackingData.items.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{item.productName}</h5>
                        <div className="text-xs text-gray-600 mt-1">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.size && item.color && <span> • </span>}
                          {item.color && <span>Color: {item.color}</span>}
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm">Qty: {item.quantity}</span>
                          <span className="font-medium">₹{item.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h5 className="font-medium text-sm mb-2">Delivery Address</h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">{trackingData.shipping.name}</div>
                        <div>{trackingData.shipping.address}</div>
                        <div>{trackingData.shipping.city}, {trackingData.shipping.state} {trackingData.shipping.pincode}</div>
                        <div>{trackingData.shipping.country}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h5 className="font-medium text-sm mb-2">Contact Information</h5>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{trackingData.shipping.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{trackingData.shipping.phone}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Notes */}
          {trackingData.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{trackingData.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}