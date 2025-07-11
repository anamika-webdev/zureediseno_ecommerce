// src/components/order/OrderTracking.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface OrderDetails {
  orderNumber: string;
  email: string;
  orderDate: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
  }>;
  shippingAddress?: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export function OrderTracking() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [error, setError] = useState('');

  const handleTrackOrder = async () => {
    if (!orderNumber.trim() || !email.trim()) {
      toast.error('Please enter both order number and email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First, check localStorage for guest orders
      if (typeof window !== 'undefined') {
        const guestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
        const foundOrder = guestOrders.find((order: any) => 
          order.orderNumber === orderNumber && order.email.toLowerCase() === email.toLowerCase()
        );

        if (foundOrder) {
          setOrderDetails(foundOrder);
          setLoading(false);
          return;
        }
      }

      // If not found in localStorage, try API call
      const response = await fetch(`/api/orders/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderNumber, email }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Order not found. Please check your order number and email address.');
        }
        throw new Error('Failed to fetch order details');
      }

      const data = await response.json();
      setOrderDetails(data.order);

    } catch (error: any) {
      console.error('Error tracking order:', error);
      setError(error.message || 'Failed to track order');
      toast.error(error.message || 'Failed to track order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'confirmed':
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'default';
      case 'shipped':
        return 'default';
      case 'confirmed':
      case 'processing':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Track Your Order
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orderNumber">Order Number</Label>
              <Input
                id="orderNumber"
                placeholder="e.g., ORD-1234567890"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleTrackOrder} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Tracking...' : 'Track Order'}
          </Button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {orderDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">{orderDetails.orderNumber}</h3>
                <p className="text-gray-600">Placed on {formatDate(orderDetails.orderDate)}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(orderDetails.status)}
                <Badge variant={getStatusBadgeVariant(orderDetails.status)}>
                  {orderDetails.status}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Order Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Payment Method:</span>
                  <span className="capitalize">{orderDetails.paymentMethod}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Total Amount:</span>
                  <span className="font-semibold">₹{orderDetails.totalAmount.toFixed(2)}</span>
                </div>

                <div className="flex items-start gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <span className="font-medium">Email:</span>
                    <br />
                    <span>{orderDetails.email}</span>
                  </div>
                </div>
              </div>

              {orderDetails.shippingAddress && (
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <span className="font-medium">Shipping Address:</span>
                      <br />
                      <span>{orderDetails.shippingAddress.fullName}</span>
                      <br />
                      <span>{orderDetails.shippingAddress.address}</span>
                      <br />
                      <span>
                        {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} - {orderDetails.shippingAddress.pincode}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            {orderDetails.items && orderDetails.items.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {orderDetails.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h5 className="font-medium">{item.name}</h5>
                          <div className="text-sm text-gray-600">
                            {item.size && <span>Size: {item.size}</span>}
                            {item.size && item.color && <span> • </span>}
                            {item.color && <span>Color: {item.color}</span>}
                            <br />
                            <span>Quantity: {item.quantity}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-sm text-gray-600">₹{item.price.toFixed(2)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Status Timeline */}
            <Separator />
            <div>
              <h4 className="font-medium mb-3">Order Status</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-700">
                  {getStatusIcon(orderDetails.status)}
                  <span className="font-medium">Current Status: {orderDetails.status}</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  {orderDetails.status === 'pending' && 'Your order has been received and is being processed.'}
                  {orderDetails.status === 'confirmed' && 'Your order has been confirmed and is being prepared.'}
                  {orderDetails.status === 'processing' && 'Your order is currently being processed.'}
                  {orderDetails.status === 'shipped' && 'Your order has been shipped and is on its way.'}
                  {orderDetails.status === 'delivered' && 'Your order has been delivered successfully.'}
                  {orderDetails.status === 'cancelled' && 'Your order has been cancelled.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}