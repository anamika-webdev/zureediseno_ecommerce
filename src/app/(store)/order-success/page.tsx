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
  CreditCard
} from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNumber = searchParams.get('orderNumber');
  const paymentMethod = searchParams.get('payment');

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
              ) : (
                <>
                  <CreditCard className="h-8 w-8 text-blue-500" />
                  <div>
                    <h3 className="font-semibold">Online Payment</h3>
                    <p className="text-gray-600">You will be redirected to complete your payment.</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* What's Next */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              What happens next?
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <div>
                  <p className="font-medium">Order Confirmation</p>
                  <p className="text-sm text-gray-600">
                    You'll receive an email confirmation with your order details.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-gray-100 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
                <div>
                  <p className="font-medium">Processing</p>
                  <p className="text-sm text-gray-600">
                    We'll prepare your order for shipment (1-2 business days).
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-gray-100 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
                <div>
                  <p className="font-medium">Shipping</p>
                  <p className="text-sm text-gray-600">
                    Your order will be shipped and you'll receive tracking information.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={handleContinueShopping} className="flex-1">
            Continue Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleGoHome} className="flex-1">
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </div>

        {/* Support Info */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 text-center">
              Need help with your order? Contact us at{' '}
              <a href="mailto:support@yourstore.com" className="text-blue-600 hover:underline">
                support@yourstore.com
              </a>{' '}
              or call us at{' '}
              <a href="tel:+911234567890" className="text-blue-600 hover:underline">
                +91 12345 67890
              </a>
            </p>
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
          <div className="animate-pulse">
            <div className="h-20 w-20 bg-gray-200 rounded-full mx-auto mb-6"></div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}