// src/app/(store)/checkout/page.tsx - Complete updated version
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { RazorpayPayment } from '@/components/payment/RazorpayPayment';
import { 
  ShoppingCart, 
  CreditCard, 
  Truck, 
  IndianRupee,
  Loader2,
  Package,
  MapPin,
  User,
  Mail,
  Phone
} from 'lucide-react';
import { toast } from 'sonner';

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

type PaymentMethod = 'cod' | 'razorpay';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [orderLoading, setOrderLoading] = useState(false);
  const [showRazorpayPayment, setShowRazorpayPayment] = useState(false);
  const [currentOrderNumber, setCurrentOrderNumber] = useState('');
  const [currentOrderData, setCurrentOrderData] = useState<any>(null);

  // Pre-fill form if user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setShippingInfo(prev => ({
        ...prev,
        fullName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || '',
        email: user.email || '',
      }));
    }
  }, [isAuthenticated, user]);

  // Calculate totals
  const subtotal = items ? items.reduce((sum: number, item: any) => {
    const price = parseFloat(item.price) || 0;
    const quantity = item.quantity || 1;
    return sum + (price * quantity);
  }, 0) : 0;
  
 // const shippingCost = subtotal > 999 ? 0 : 99;
  const shippingCost = 0; 
  const taxRate = 0; // 18% GST
  const taxAmount = subtotal * taxRate;
  const orderTotal = subtotal + shippingCost + taxAmount;

  const validateForm = (): boolean => {
    const requiredFields: (keyof ShippingInfo)[] = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
    const isValid = requiredFields.every(field => shippingInfo[field].trim() !== '');
    
    if (!isValid) {
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingInfo.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(shippingInfo.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }

    // Pincode validation
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(shippingInfo.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }

    return true;
  };

  const handleInputChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value as PaymentMethod);
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
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
        isGuestOrder: !isAuthenticated, // Flag for guest orders
        userId: isAuthenticated ? user?.id : null,
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

      // Store order details for guest users
      if (!isAuthenticated && typeof window !== 'undefined') {
        const guestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
        const guestOrderData = {
          orderNumber,
          email: shippingInfo.email,
          orderDate: new Date().toISOString(),
          totalAmount: orderTotal,
          paymentMethod,
          status: 'pending',
          items: items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            size: item.size,
            color: item.color,
          })),
          shippingAddress: shippingInfo,
        };
        guestOrders.push(guestOrderData);
        localStorage.setItem('guestOrders', JSON.stringify(guestOrders));
      }

      // Handle different payment methods
      if (paymentMethod === 'cod') {
        // For COD, redirect to success page immediately
        clearCart();
        router.push(`/order-success?orderNumber=${orderNumber}&payment=cod&email=${encodeURIComponent(shippingInfo.email)}`);
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
    router.push(`/order-success?orderNumber=${currentOrderNumber}&payment=razorpay&transactionId=${transactionId}&email=${encodeURIComponent(shippingInfo.email)}`);
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
            <Button onClick={() => router.push('/shop')}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Checkout</h1>
          <p className="text-gray-600">
            {isAuthenticated ? `Welcome back, ${user?.name || user?.firstName}!` : 'Complete your order below'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="fullName"
                        placeholder="Enter your full name"
                        value={shippingInfo.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={shippingInfo.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      placeholder="10-digit mobile number"
                      value={shippingInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-10"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    placeholder="House number, street name, area"
                    value={shippingInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="City"
                      value={shippingInfo.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      placeholder="State"
                      value={shippingInfo.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      placeholder="6-digit pincode"
                      value={shippingInfo.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      maxLength={6}
                      required
                    />
                  </div>
                </div>
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
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Truck className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Cash on Delivery</div>
                        <div className="text-sm text-gray-600">Pay when your order arrives</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="razorpay" id="razorpay" />
                    <Label htmlFor="razorpay" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CreditCard className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Online Payment</div>
                        <div className="text-sm text-gray-600">Pay securely with Razorpay</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {items.map((item: any) => (
                    <div key={`${item.productId}-${item.size}-${item.color}`} className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.name}</h4>
                        <div className="text-xs text-gray-600 space-y-1">
                          {item.size && <p>Size: {item.size}</p>}
                          {item.color && <p>Color: {item.color}</p>}
                          <p>Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                        <p className="text-xs text-gray-600">₹{parseFloat(item.price).toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    {/*<span className={shippingCost === 0 ? 'text-green-600' : ''}>
                      {shippingCost === 0 ? 'FREE' : `₹${shippingCost.toFixed(2)}`}
                    </span>*/}
                  </div>
                 {/* <div className="flex justify-between text-sm">
                    <span>Tax (GST 18%)</span>
                    <span>₹{taxAmount.toFixed(2)}</span>
                  </div>*/}
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="flex items-center">
                      <IndianRupee className="h-4 w-4" />
                      {orderTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Free Shipping Notice */}
                {subtotal < 999 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-600">
                      Add ₹{(999 - subtotal).toFixed(2)} more for FREE shipping!
                    </p>
                  </div>
                )}

                {/* Place Order Button */}
                <Button 
                  onClick={handlePlaceOrder} 
                  disabled={orderLoading}
                  className="w-full"
                  size="lg"
                >
                  {orderLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      Place Order • ₹{orderTotal.toFixed(2)}
                    </>
                  )}
                </Button>

                {/* Security Notice */}
                <div className="text-xs text-gray-500 text-center">
                  🔒 Your information is secure and encrypted
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Razorpay Payment Modal */}
        {showRazorpayPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Complete Payment</h3>
              <p className="text-sm text-gray-600 mb-4">
                Order: {currentOrderNumber}
              </p>
              <RazorpayPayment
                amount={orderTotal}
                onSuccess={handleRazorpaySuccess}
                onError={handleRazorpayError}
                guestInfo={{
                  name: shippingInfo.fullName,
                  email: shippingInfo.email,
                  phone: shippingInfo.phone
                }}
              />
              <Button
                variant="outline"
                onClick={() => setShowRazorpayPayment(false)}
                className="w-full mt-4"
              >
                Cancel Payment
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}