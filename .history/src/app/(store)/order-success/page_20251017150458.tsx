// src/app/(store)/order-success/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircle, 
  Package, 
  ArrowRight, 
  Home, 
  Banknote,
  CreditCard,
  Phone,
  Mail
} from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNumber = searchParams.get('orderNumber');
  const paymentMethod = searchParams.get('payment');
  const transactionId = searchParams.get('transactionId');

  const handleContinueShopping = () => {
    router.push('/products');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Success Message */}
        <Card className="mb-6">
          <CardContent className="p-8 text-center">
            <CheckCircle className="mx-auto h-20 w-20 text-green-500 mb-6" />
            <h1 className="text-3xl font-bold text-green-600 mb-3">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              Thank you for your order. We've received your order and will process it shortly.
            </p>
            {orderNumber && (
              <div className="bg-gray-50 rounded-lg p-6 inline-block">
                <p className="text-sm text-gray-600 mb-1">Order Number</p>
                <p className="font-mono font-bold text-2xl">{orderNumber}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Method Info */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              {paymentMethod === 'cod' ? (
                <>
                  <Banknote className="h-8 w-8 text-green-500" />
                  <div>
                    <h3 className="font-semibold">Cash on Delivery</h3>
                    <p className="text-gray-600">Please keep the exact amount ready when your order arrives.</p>
                  </div>
                </>
              ) : paymentMethod === 'razorpay' ? (
                <>
                  <CreditCard className="h-8 w-8 text-blue-500" />
                  <div>
                    <h3 className="font-semibold">Razorpay Payment</h3>
                    <p className="text-gray-600">
                      Your payment has been processed successfully through Razorpay.
                    </p>
                    {transactionId && (
                      <p className="text-sm text-gray-500 mt-1">
                        Transaction ID: <span className="font-mono">{transactionId}</span>
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <CreditCard className="h-8 w-8 text-blue-500" />
                  <div>
                    <h3 className="font-semibold">Online Payment</h3>
                    <p className="text-gray-600">Your payment has been processed successfully.</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Status for Razorpay */}
        {paymentMethod === 'razorpay' && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Payment Status: Confirmed</span>
                </div>
                <div className="text-sm text-gray-600">
                  Processed via Razorpay
                </div>
              </div>
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ Your payment has been verified and confirmed. You will receive a payment receipt via email shortly.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* What's Next */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              What happens next?
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Order Confirmation</p>
                  <p className="text-sm text-gray-600">You'll receive an email confirmation shortly with order details.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Processing</p>
                  <p className="text-sm text-gray-600">We'll prepare your order for shipment within 1-2 business days.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Shipping Updates</p>
                  <p className="text-sm text-gray-600">Track your order status and delivery updates via email.</p>
                </div>
              </div>
              {paymentMethod === 'cod' && (
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Payment on Delivery</p>
                    <p className="text-sm text-gray-600">Keep the exact amount ready when your order arrives.</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Information */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Delivery Information</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Estimated Delivery:</span>
                <span className="font-medium">3-5 Business Days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Delivery Method:</span>
                <span className="font-medium">Standard Shipping</span>
              </div>
              {paymentMethod === 'cod' && (
                <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">Cash on Delivery Reminder</span>
                  </div>
                  <p className="text-sm text-orange-700 mt-1">
                    Please have the exact amount (₹{searchParams.get('amount') || 'order total'}) ready for the delivery person.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button onClick={handleContinueShopping} className="flex-1">
            <ArrowRight className="h-4 w-4 mr-2" />
            Continue Shopping
          </Button>
          <Button variant="outline" onClick={handleGoHome} className="flex-1">
            <Home className="h-4 w-4 mr-2" />
            Go to Home
          </Button>
        </div>

        {/* Customer Support */}
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Need Help?</h3>
            <p className="text-gray-600 text-sm mb-4">
              If you have any questions about your order, please don't hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Support
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Call Support
              </Button>
              <Button variant="outline" size="sm">
                Track Order
              </Button>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <p>Email: support@zureediseno.com</p>
              <p>Phone: +91 97114 11526</p>
              <p>Hours: Monday - Friday, 9 AM - 6 PM IST</p>
            </div>
          </CardContent>
        </Card>
        
<Card>
  <CardContent className="p-6">
    <h3 className="font-semibold mb-4 flex items-center gap-2">
      <Package className="h-5 w-5" />
      Track Your Order
    </h3>
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm text-gray-600 mb-2">
        You can track your order status using:
      </p>
      <div className="space-y-1 text-sm">
        <p><strong>Order Number:</strong> {orderNumber}</p>
        <p><strong>Email:</strong> {searchParams.get('email') || 'Your email address'}</p>
      </div>
      <Link 
        href="/track-order" 
        className="inline-block mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        Track Order Status →
      </Link>
    </div>
  </CardContent>
</Card>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
