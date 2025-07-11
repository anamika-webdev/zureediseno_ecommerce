// src/components/payment/RazorpayPayment.tsx - Updated for guest checkout
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
        handler: async (response: any) => {
          try {
            console.log('Payment response received:', response);

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
              toast.success('Payment successful!');
              
              // Store payment details in sessionStorage for the parent component
              if (typeof window !== 'undefined') {
                window.sessionStorage.setItem('razorpay_payment_details', JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                }));
              }
              
              handleSuccess();
            } else {
              const errorData = await verifyResponse.json();
              throw new Error(errorData.error || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
            handleError();
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: guestInfo?.name || '',
          email: guestInfo?.email || '',
          contact: guestInfo?.phone || '',
        },
        notes: {
          guest_checkout: 'true',
          order_source: 'website',
        },
        theme: {
          color: '#000000',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.info('Payment cancelled');
          },
        },
        retry: {
          enabled: true,
          max_count: 3,
        },
        timeout: 300,
        remember_customer: false,
      };

      console.log('Opening Razorpay with options:', {
        ...options,
        key: options.key ? `${options.key.substring(0, 8)}...` : 'Not set'
      });

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response.error);
        const errorMsg = response.error?.description || response.error?.reason || 'Payment failed';
        toast.error(`Payment failed: ${errorMsg}`);
        setError(errorMsg);
        setLoading(false);
        handleError();
      });

      razorpay.open();
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      const errorMessage = error.message || 'Payment initialization failed';
      setError(errorMessage);
      setLoading(false);
      toast.error(errorMessage);
      handleError();
    }
  };

  return (
    <div className="w-full">
      <Button
        onClick={handlePayment}
        disabled={disabled || loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Pay ₹{amount.toFixed(2)} with Razorpay
          </>
        )}
      </Button>
      
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}
      
      <div className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-500">
        <Shield className="h-3 w-3" />
        Secured by Razorpay
      </div>
    </div>
  );
}