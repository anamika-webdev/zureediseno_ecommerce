// src/app/(store)/track-order/page.tsx - Order Tracking Page
import { Metadata } from 'next';
import { OrderTracking } from '@/components/order/OrderTracking';

export const metadata: Metadata = {
  title: 'Track Your Order - Zuree Diseno',
  description: 'Track the status and delivery progress of your order from Zuree Diseno. Enter your order number and email to get real-time updates.',
  keywords: ['order tracking', 'delivery status', 'order status', 'zuree diseno', 'track package'],
};

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Track Your Order</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Enter your order details below to get real-time updates on your order status and delivery progress
            </p>
          </div>
          
          {/* Order Tracking Component */}
          <OrderTracking />
          
          {/* Help Section */}
          <div className="mt-12 text-center">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
              <p className="text-gray-600 mb-4">
                Can't find your order or having trouble tracking? We're here to help!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Email:</span>
                  <a href="mailto:support@zureediseno.com" className="text-blue-600 hover:underline">
                    support@zureediseno.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Phone:</span>
                  <a href="tel:+919876543210" className="text-blue-600 hover:underline">
                    +91 98765 43210
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="mt-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Where can I find my order number?</h4>
                  <p className="text-gray-600">
                    Your order number can be found in the confirmation email sent to you after placing the order. 
                    It starts with "ORD-" followed by the year and order number.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">How long does delivery take?</h4>
                  <p className="text-gray-600">
                    Standard delivery typically takes 3-5 business days within India. 
                    You'll receive tracking information once your order is shipped.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">What if my order status hasn't updated?</h4>
                  <p className="text-gray-600">
                    Order statuses are updated in real-time. If you notice delays, please contact our support team 
                    for assistance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}