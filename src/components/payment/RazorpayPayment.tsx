'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface RazorpayPaymentProps {
  amount: number;
  onSuccess: (paymentDetails: any) => void;
  onError: (error: any) => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function RazorpayPayment({ amount, onSuccess, onError, disabled }: RazorpayPaymentProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please sign in to make a payment');
      return;
    }

    setLoading(true);

    try {
      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = async () => {
        try {
          // Create order on backend
          const orderResponse = await fetch('/api/payment/create-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount }),
          });

          if (!orderResponse.ok) {
            throw new Error('Failed to create payment order');
          }

          const orderData = await orderResponse.json();

          // Configure Razorpay options
          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'Zuree Diseno',
            description: 'Purchase from Zuree Diseno',
            order_id: orderData.orderId,
            handler: async (response: any) => {
              try {
                // Verify payment on backend
                const verifyResponse = await fetch('/api/payment/verify', {
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
                  onSuccess(response);
                } else {
                  throw new Error('Payment verification failed');
                }
              } catch (error) {
                console.error('Payment verification error:', error);
                onError(error);
              }
            },
            prefill: {
              name: `${user.firstName} ${user.lastName}`,
              email: user.emailAddresses[0]?.emailAddress,
            },
            theme: {
              color: '#000000',
            },
            modal: {
              ondismiss: () => {
                setLoading(false);
              },
            },
          };

          const razorpay = new window.Razorpay(options);
          razorpay.on('payment.failed', (response: any) => {
            onError(response.error);
          });

          razorpay.open();
        } catch (error) {
          console.error('Payment initialization error:', error);
          onError(error);
        } finally {
          setLoading(false);
        }
      };

      script.onerror = () => {
        setLoading(false);
        onError(new Error('Failed to load payment gateway'));
      };
    } catch (error) {
      setLoading(false);
      onError(error);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || loading}
      className="w-full"
      size="lg"
    >
      {loading ? 'Processing...' : `Pay ₹${amount.toFixed(2)}`}
    </Button>
  );
}