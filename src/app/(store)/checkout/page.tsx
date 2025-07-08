// src/app/(store)/checkout/page.tsx - Fixed version
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { RazorpayPayment } from '@/components/payment/RazorpayPayment';
import { 
  ShoppingCart, 
  CreditCard, 
  Banknote, 
  Shield, 
  CheckCircle,
  Truck,
  Package,
  MapPin,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

// Define proper types
type PaymentMethod = 'cod' | 'razorpay';

interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export default function CheckoutPage() {  
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { items, total, itemCount, clearCart } = useCart();
  
  const [orderLoading, setOrderLoading] = useState(false); // Renamed to avoid conflict
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [showRazorpayPayment, setShowRazorpayPayment] = useState(false);
  const [currentOrderNumber, setCurrentOrderNumber] = useState('');
  const [currentOrderData, setCurrentOrderData] = useState<any>(null);
  
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });

  // Pre-fill user information
  useEffect(() => {
    if (user) {
      setShippingInfo(prev => ({
        ...prev,
        fullName: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email || ''
      }));
    }
  }, [user]);

  // Calculate totals
  const subtotal = total || (items ? items.reduce((sum: number, item: any) => {
    const price = parseFloat(item.price) || 0;
    const quantity = item.quantity || 1;
    return sum + (price * quantity);
  }, 0) : 0);
  
  const shippingCost = subtotal > 999 ? 0 : 99;
  const taxRate = 0.18; // 18% GST
  const taxAmount = subtotal * taxRate;
  const orderTotal = subtotal + shippingCost + taxAmount;

  const validateForm = (): boolean => {
    const requiredFields: (keyof ShippingInfo)[] = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
    return requiredFields.every(field => shippingInfo[field].trim() !== '');
  };

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value as PaymentMethod);
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!items || items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setOrderLoading(true);

    try {
      const orderData = {
        items: items,
        shippingAddress: shippingInfo,
        paymentMethod,
        subtotal,
        shipping: shippingCost,
        tax: taxAmount,
        totalAmount: orderTotal,
        orderDate: new Date().toISOString(),
      };

      // Send order email
      const emailResponse = await fetch('/api/send-order-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!emailResponse.ok) {
        throw new Error('Failed to send order confirmation');
      }

      const { orderNumber } = await emailResponse.json();

      // Handle different payment methods
      if (paymentMethod === 'cod') {
        // For COD, redirect to success page immediately
        clearCart();
        router.push(`/order-success?orderNumber=${orderNumber}&payment=cod`);
      } else if (paymentMethod === 'razorpay') {
        // For Razorpay, initiate payment process
        setShowRazorpayPayment(true);
        setCurrentOrderNumber(orderNumber);
        setCurrentOrderData(orderData);
      }

    } catch (error) {
      console.error('Order placement error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setOrderLoading(false);
    }
  };

  const handleRazorpaySuccess = () => {
    // Get payment details from sessionStorage
    const paymentDetailsString = typeof window !== 'undefined' 
      ? window.sessionStorage.getItem('razorpay_payment_details')
      : null;
    
    let transactionId = '';
    if (paymentDetailsString) {
      try {
        const paymentDetails = JSON.parse(paymentDetailsString);
        transactionId = paymentDetails.razorpay_payment_id;
        // Clean up sessionStorage
        window.sessionStorage.removeItem('razorpay_payment_details');
      } catch (error) {
        console.error('Error parsing payment details:', error);
      }
    }

    console.log('Razorpay payment successful');
    toast.success('Payment completed successfully!');
    clearCart();
    setShowRazorpayPayment(false);
    router.push(`/order-success?orderNumber=${currentOrderNumber}&payment=razorpay&transactionId=${transactionId}`);
  };

  const handleRazorpayError = () => {
    console.error('Razorpay payment error');
    toast.error('Payment failed. Please try again.');
    setShowRazorpayPayment(false);
  };

  // Show loading state if items is undefined
  if (items === undefined) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  // Show empty cart message if cart is empty
  if (!items || items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">
              Please add some items to your cart before proceeding to checkout.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Continue Shopping
                </Button>
              </Link>
              <Link href="/cart">
                <Button variant="outline" className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  View Cart
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/cart">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={shippingInfo.fullName}
                        onChange={(e) => setShippingInfo({...shippingInfo, fullName: e.target.value})}
                        required
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                        required
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                      required
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                      required
                      placeholder="House no, Building, Street"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                        required
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                        required
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        value={shippingInfo.pincode}
                        onChange={(e) => setShippingInfo({...shippingInfo, pincode: e.target.value})}
                        required
                        placeholder="123456"
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={handlePaymentMethodChange}>
                  
                  {/* Cash on Delivery */}
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                      <Banknote className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-gray-600">Pay when your order arrives at your doorstep</p>
                      </div>
                    </Label>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Available</span>
                    </div>
                  </div>

                  {/* Razorpay Payment */}
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="razorpay" id="razorpay" />
                    <Label htmlFor="razorpay" className="flex items-center gap-3 cursor-pointer flex-1">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Razorpay</p>
                        <p className="text-sm text-gray-600">Credit/Debit Card, UPI, Net Banking, Wallets</p>
                      </div>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-blue-600">Secure</span>
                    </div>
                  </div>
                </RadioGroup>

                {/* Payment Method Info */}
                {paymentMethod === 'cod' && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Cash on Delivery Selected</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      You can pay in cash when your order is delivered. Please keep the exact amount ready.
                    </p>
                  </div>
                )}

                {paymentMethod === 'razorpay' && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Razorpay Secure Payment</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      Secure payment processing with multiple options including cards, UPI, net banking, and wallets.
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-blue-600">
                      <span>• Credit/Debit Cards</span>
                      <span>• UPI & QR Code</span>
                      <span>• Net Banking</span>
                      <span>• Digital Wallets</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Summary ({itemCount || items.length} {(itemCount || items.length) === 1 ? 'item' : 'items'})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {items.map((item: any, index: number) => (
                    <div key={`${item.id}-${index}`} className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="h-full w-full object-cover rounded" 
                          />
                        ) : (
                          <Package className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <div className="text-xs text-gray-600 space-y-1">
                          {item.size && <p>Size: {item.size}</p>}
                          {item.color && <p>Color: {item.color}</p>}
                          <p>Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium">
                        ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      Shipping
                    </span>
                    <span className={shippingCost === 0 ? 'text-green-600' : ''}>
                      {shippingCost === 0 ? 'FREE' : `₹${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (GST 18%)</span>
                    <span>₹{taxAmount.toFixed(2)}</span>
                  </div>
                  {shippingCost === 0 && (
                    <p className="text-xs text-green-600">🎉 You saved ₹99 on shipping!</p>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{orderTotal.toFixed(2)}</span>
                </div>

                <Button 
                  onClick={handlePlaceOrder}
                  disabled={orderLoading || !validateForm() || !items || items.length === 0}
                  className="w-full"
                  size="lg"
                >
                  {orderLoading ? 'Processing...' : `Place Order - ₹${orderTotal.toFixed(2)}`}
                </Button>

                <div className="text-xs text-gray-600 text-center">
                  By placing your order, you agree to our Terms of Service and Privacy Policy.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Razorpay Payment Modal */}
      {showRazorpayPayment && currentOrderData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-center">Complete Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Order Number: {currentOrderNumber}</p>
                <p className="text-lg font-semibold">Total: ₹{orderTotal.toFixed(2)}</p>
              </div>
              
              <RazorpayPayment
                amount={orderTotal}
                onSuccess={handleRazorpaySuccess}
                onError={handleRazorpayError}
              />
              
              <Button
                variant="outline"
                onClick={() => setShowRazorpayPayment(false)}
                className="w-full"
              >
                Cancel Payment
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}