// src/components/payment/RazorpayPayment.tsx - Updated with better error handling

'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CreditCard, Shield, Loader2, AlertCircle } from 'lucide-react';

interface RazorpayPaymentProps {
  amount: number;
  onSuccess: () => void;
  onError: () => void;
  disabled?: boolean;
  guestInfo?: {
    name: string;
    email: string;
    phone?: string;
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function RazorpayPayment({ 
  amount, 
  onSuccess, 
  onError, 
  disabled, 
  guestInfo 
}: RazorpayPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSuccess = useCallback(() => {
    onSuccess();
  }, [onSuccess]);

  const handleError = useCallback(() => {
    onError();
  }, [onError]);

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        script.onload = async () => {
          await initiatePayment();
        };

        script.onerror = () => {
          setLoading(false);
          setError('Failed to load payment gateway. Please check your internet connection.');
          toast.error('Failed to load payment gateway');
          handleError();
        };
      } else {
        await initiatePayment();
      }
    } catch (error) {
      setLoading(false);
      console.error('Payment initialization error:', error);
      setError('Payment initialization failed. Please try again.');
      toast.error('Payment initialization failed');
      handleError();
    }
  };

  const initiatePayment = async () => {
    try {
      console.log('Creating payment order for amount:', amount);

      // Create order on backend - no authentication required for guest checkout
      const orderResponse = await fetch('/api/payment/create-order-guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      const responseText = await orderResponse.text();
      console.log('Order API response status:', orderResponse.status);
      console.log('Order API response:', responseText);

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
        prefill: guestInfo ? {
          name: guestInfo.name,
          email: guestInfo.email,
          contact: guestInfo.phone || '',
        } : {},
        handler: async (response: any) => {
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
              setLoading(false);
              
              // Call success handler - this will trigger order email
              handleSuccess();
            } else {
              const errorData = await verifyResponse.json();
              console.error('Payment verification failed:', errorData);
              throw new Error(errorData.error || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setLoading(false);
            const errorMessage = error instanceof Error ? error.message : 'Payment verification failed';
            setError(`Payment verification failed: ${errorMessage}`);
            toast.error('Payment verification failed');
            handleError();
          }
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed by user');
            setLoading(false);
            toast.info('Payment cancelled');
            // Don't call handleError() here as user intentionally cancelled
          },
        },
        theme: {
          color: '#3B82F6',
        },
      };

      console.log('Opening Razorpay checkout with options:', options);
      const razorpay = new window.Razorpay(options);
      
      // Handle payment failures
      razorpay.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response.error);
        setLoading(false);
        setError(`Payment failed: ${response.error.description || 'Unknown error'}`);
        toast.error('Payment failed');
        handleError();
      });

      razorpay.open();

    } catch (error) {
      setLoading(false);
      console.error('Payment creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to create payment order: ${errorMessage}`);
      toast.error('Failed to create payment order');
      handleError();
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
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
        onClick={handlePayment}
        disabled={disabled || loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay ₹{amount.toFixed(2)} Securely
          </>
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Order confirmation email will be sent only after successful payment verification
      </p>
    </div>
  );
}