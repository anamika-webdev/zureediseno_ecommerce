// src/app/(store)/track-order/page.tsx
import { Metadata } from 'next';
import { OrderTracking } from '@/components/order/OrderTracking';

export const metadata: Metadata = {
  title: 'Track Your Order - Zuree Diseno',
  description: 'Track the status of your order from Zuree Diseno',
};

export default function TrackOrderPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
          <p className="text-gray-600">
            Enter your order details below to track your order status
          </p>
        </div>
        
        <OrderTracking />
      </div>
    </div>
  );
}