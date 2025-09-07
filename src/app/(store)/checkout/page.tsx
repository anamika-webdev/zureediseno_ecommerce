// src/app/(store)/checkout/page.tsx - Completely fixed version with explicit typing
'use client';
export const dynamic = 'force-dynamic'

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
  Phone,
  Shield,
  AlertCircle
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

interface CartItem {
  id: string;
  name: string;
  price: string | number;
  quantity: number;
  size: string;
  color: string;
  image?: string;
  slug?: string;
}

type PaymentMethod = 'cod' | 'razorpay';

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Helper function to safely convert price to number
const getPriceAsNumber = (price: string | number): number => {
  if (typeof price === 'string') {
    const parsed = parseFloat(price);
    return isNaN(parsed) ? 0 : parsed;
  }
  return typeof price === 'number' ? price : 0;
};

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
  const [razorpayloading, setRazorpayLoading] = useState(false);
  const [razorpayError, setRazorpayError] = useState<string>('');

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

  // Calculate totals with explicit typing
  const subtotal: number = items ? items.reduce((sum: number, item: CartItem) => {
    const price: number = getPriceAsNumber(item.price);
    const quantity: number = item.quantity || 1;
    return sum + (price * quantity);
  }, 0) : 0;
  
  const shippingCost: number = 0; // Free shipping
  const taxRate: number = 0; // No tax for now
  const taxAmount: number = subtotal * taxRate;
  const orderTotal: number = subtotal + shippingCost + taxAmount;

  const validateForm = (): boolean => {
    const requiredFields: { field: keyof ShippingInfo; label: string }[] = [
      { field: 'fullName', label: 'Full Name' },
      { field: 'email', label: 'Email Address' },
      { field: 'phone', label: 'Phone Number' },
      { field: 'address', label: 'Address' },
      { field: 'city', label: 'City' },
      { field: 'state', label: 'State' },
      { field: 'pincode', label: 'Pincode' }
    ];

    // Check for empty required fields
    for (const { field, label } of requiredFields) {
      if (!shippingInfo[field] || shippingInfo[field].trim() === '') {
        toast.error(`Please enter ${label}`);
        // Focus on the first empty field
        const element = document.getElementById(field);
        if (element) {
          element.focus();
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingInfo.email)) {
      toast.error('Please enter a valid email address');
      const emailElement = document.getElementById('email');
      if (emailElement) {
        emailElement.focus();
        emailElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }

    // Phone validation (Indian mobile numbers)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(shippingInfo.phone)) {
      toast.error('Please enter a valid 10-digit Indian mobile number starting with 6-9');
      const phoneElement = document.getElementById('phone');
      if (phoneElement) {
        phoneElement.focus();
        phoneElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }

    // Pincode validation
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(shippingInfo.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      const pincodeElement = document.getElementById('pincode');
      if (pincodeElement) {
        pincodeElement.focus();
        pincodeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
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
    // Always validate form first, regardless of payment method
    if (!validateForm()) {
      return; // validateForm() already shows toast error
    }

    if (!items || items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!paymentMethod) {
      toast.error('Please select a payment method');
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
        isGuestOrder: !isAuthenticated,
        userId: isAuthenticated ? user?.id : null,
      };

      // Handle different payment methods
      if (paymentMethod === 'cod') {
        // For COD, send order email immediately since no payment verification needed
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
            status: 'confirmed', // COD orders are confirmed immediately
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

        // For COD, redirect to success page immediately
        clearCart();
        router.push(`/order-success?orderNumber=${orderNumber}&payment=cod&email=${encodeURIComponent(shippingInfo.email)}`);
        
      } else if (paymentMethod === 'razorpay') {
        // For Razorpay, DON'T send email yet - only prepare order data
        // Store order data temporarily for payment processing
        setCurrentOrderData(orderData);
        setShowRazorpayPayment(true);
        
        // Generate a temporary order number for the payment process
        const tempOrderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setCurrentOrderNumber(tempOrderNumber);
      }

    } catch (error) {
      console.error('Order placement error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setOrderLoading(false);
    }
  };

  // Separate function for Razorpay payment that also validates
  const handleRazorpayPayment = async () => {
    // Re-validate form before processing payment
    if (!validateForm()) {
      return; // validateForm() already shows toast error
    }

    setRazorpayLoading(true);
    setRazorpayError('');

    try {
      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        script.onload = async () => {
          await initiateRazorpayPayment();
        };

        script.onerror = () => {
          setRazorpayLoading(false);
          setRazorpayError('Failed to load payment gateway. Please check your internet connection.');
          toast.error('Failed to load payment gateway');
        };
      } else {
        await initiateRazorpayPayment();
      }
    } catch (error) {
      setRazorpayLoading(false);
      console.error('Payment initialization error:', error);
      setRazorpayError('Payment initialization failed. Please try again.');
      toast.error('Payment initialization failed');
    }
  };

  const initiateRazorpayPayment = async () => {
    try {
      console.log('Creating payment order for amount:', orderTotal);

      // Create order on backend
      const orderResponse = await fetch('/api/payment/create-order-guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: orderTotal }),
      });

      const responseText = await orderResponse.text();
      console.log('Order API response status:', orderResponse.status);

      if (!orderResponse.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          errorData = { error: 'Server error occurred' };
        }
        
        throw new Error(errorData.error || `HTTP ${orderResponse.status}: ${responseText}`);
      }

      const orderData = JSON.parse(responseText);
      console.log('Order created successfully:', orderData);

      if (!orderData.orderId || !orderData.amount) {
        throw new Error('Invalid order data received from server');
      }

      // Configure Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Zuree Diseno',
        description: 'Purchase from Zuree Diseno',
        image: '/logo.png',
        order_id: orderData.orderId,
        prefill: {
          name: shippingInfo.fullName,
          email: shippingInfo.email,
          contact: shippingInfo.phone,
        },
        handler: async (response: any) => {
          await handleRazorpaySuccess(response);
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed by user');
            setRazorpayLoading(false);
            toast.info('Payment cancelled');
            handleRazorpayError();
          },
        },
        theme: {
          color: '#3B82F6',
        },
      };

      console.log('Opening Razorpay checkout');
      const razorpay = new window.Razorpay(options);
      
      // Handle payment failures
      razorpay.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response.error);
        setRazorpayLoading(false);
        setRazorpayError(`Payment failed: ${response.error.description || 'Unknown error'}`);
        toast.error('Payment failed');
        handleRazorpayError();
      });

      razorpay.open();

    } catch (error) {
      setRazorpayLoading(false);
      console.error('Payment creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setRazorpayError(`Failed to create payment order: ${errorMessage}`);
      toast.error('Failed to create payment order');
      handleRazorpayError();
    }
  };

  const handleRazorpaySuccess = async (response: any) => {
    try {
      console.log('Payment response received:', response);

      // Store payment details for later use
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('razorpay_payment_details', JSON.stringify(response));
      }

      // Verify payment on backend
      const verifyResponse = await fetch('/api/payment/verify-guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      });

      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        console.log('Payment verified successfully:', verifyData);
        toast.success('Payment successful!');
        setRazorpayLoading(false);

        // NOW send the order confirmation email after successful payment
        if (currentOrderData) {
          console.log('Sending order confirmation email for Razorpay payment...');
          
          const emailPayload = {
            ...currentOrderData,
            paymentStatus: 'completed',
            transactionId: response.razorpay_payment_id,
            paymentMethod: 'razorpay' // Ensure this is set correctly
          };

          console.log('Email payload:', emailPayload);

          const emailResponse = await fetch('/api/send-order-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailPayload),
          });

          const emailResult = await emailResponse.text();
          console.log('Email API response status:', emailResponse.status);
          console.log('Email API response:', emailResult);

          if (!emailResponse.ok) {
            console.error('Failed to send order confirmation email:', emailResult);
            toast.error('Payment successful but failed to send confirmation email. Please contact support.');
            // Don't fail the entire process, but show a warning
          } else {
            const { orderNumber } = JSON.parse(emailResult);
            console.log('Order confirmation email sent successfully. Order number:', orderNumber);
            toast.success('Order confirmation email sent!');

            // Store order details for guest users with confirmed status
            if (!isAuthenticated && typeof window !== 'undefined') {
              const guestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
              const guestOrderData = {
                orderNumber,
                email: currentOrderData.shippingAddress.email,
                orderDate: new Date().toISOString(),
                totalAmount: currentOrderData.totalAmount,
                paymentMethod: 'razorpay',
                status: 'confirmed', // Payment confirmed
                transactionId: response.razorpay_payment_id,
                items: currentOrderData.items.map((item: CartItem) => ({
                  name: item.name,
                  quantity: item.quantity,
                  price: item.price,
                  size: item.size,
                  color: item.color,
                })),
                shippingAddress: currentOrderData.shippingAddress,
              };
              guestOrders.push(guestOrderData);
              localStorage.setItem('guestOrders', JSON.stringify(guestOrders));
            }

            // Clear cart and redirect to success page
            clearCart();
            router.push(`/order-success?orderNumber=${orderNumber}&payment=razorpay&transactionId=${response.razorpay_payment_id}&email=${encodeURIComponent(currentOrderData.shippingAddress.email)}`);
          }
        } else {
          console.error('No current order data available for email');
          toast.error('Payment successful but order data missing. Please contact support.');
        }
      } else {
        const errorData = await verifyResponse.json();
        console.error('Payment verification failed:', errorData);
        throw new Error(errorData.error || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setRazorpayLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Payment verification failed';
      setRazorpayError(`Payment verification failed: ${errorMessage}`);
      toast.error('Payment verification failed');
      handleRazorpayError();
    }
  };

  const handleRazorpayError = () => {
    console.log('Razorpay payment failed or cancelled');
    toast.error('Payment failed or was cancelled');
    
    // Clear temporary data
    setShowRazorpayPayment(false);
    setCurrentOrderData(null);
    setCurrentOrderNumber('');
    setRazorpayLoading(false);
    setRazorpayError('');
    
    // Don't send any email for failed/cancelled payments
    // User stays on checkout page to retry
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
                      type="tel"
                      placeholder="Enter 10-digit phone number"
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
                    placeholder="Street address, building, apartment"
                    value={shippingInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={shippingInfo.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      disabled
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
                <RadioGroup 
                  value={paymentMethod} 
                  onValueChange={handlePaymentMethodChange}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-medium">Cash on Delivery (COD)</div>
                          <div className="text-sm text-gray-500">
                            Pay when your order is delivered
                          </div>
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="razorpay" id="razorpay" />
                    <Label htmlFor="razorpay" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium">Online Payment</div>
                          <div className="text-sm text-gray-500">
                            Credit/Debit Card, UPI, Net Banking
                          </div>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === 'razorpay' && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      🔒 Order confirmation email will be sent only after successful payment verification
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {items.map((item: CartItem, index: number) => {
                    // Explicitly type and calculate price to avoid TypeScript issues
                    const itemPrice: number = getPriceAsNumber(item.price);
                    const itemQuantity: number = item.quantity || 1;
                    const itemTotal: number = itemPrice * itemQuantity;
                    
                    return (
                      <div key={`${item.id}-${item.size}-${item.color}-${index}`} className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-xs text-gray-500">
                            Size: {item.size} | Color: {item.color} | Qty: {itemQuantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          ₹{itemTotal.toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600">
                      {shippingCost === 0 ? 'FREE' : `₹${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  {taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>₹{taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="flex items-center">
                      <IndianRupee className="h-4 w-4" />
                      {orderTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Shipping Info */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck className="h-4 w-4" />
                  <span>Free shipping on all orders</span>
                </div>

                {/* Place Order Button or Razorpay Payment */}
                {!showRazorpayPayment ? (
                  <Button 
                    onClick={handlePlaceOrder}
                    disabled={orderLoading}
                    className="w-full"
                    size="lg"
                  >
                    {orderLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Package className="mr-2 h-4 w-4" />
                        {paymentMethod === 'cod' ? 'Place Order' : 'Proceed to Payment'}
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    {razorpayError && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">{razorpayError}</span>
                      </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Secure Payment</span>
                      </div>
                      <p className="text-xs text-blue-700">
                        Your payment is secured by Razorpay with 256-bit SSL encryption.
                        No order confirmation will be sent until payment is successfully completed.
                      </p>
                    </div>

                    <Button
                      onClick={handleRazorpayPayment}
                      disabled={razorpayloading}
                      className="w-full"
                      size="lg"
                    >
                      {razorpayloading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Pay ₹{orderTotal.toFixed(2)} Securely
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      Order confirmation email will be sent only after successful payment verification
                    </p>

                    <Button
                      variant="outline"
                      onClick={() => setShowRazorpayPayment(false)}
                      className="w-full"
                    >
                      Back to Order Details
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard className="h-4 w-4" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}