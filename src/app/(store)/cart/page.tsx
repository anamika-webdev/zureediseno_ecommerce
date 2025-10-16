// src/app/(store)/cart/page.tsx
'use client';
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, X, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function CartPage() {
  const { items, total, itemCount, updateQuantity, removeFromCart } = useCart();
  const { isAuthenticated, isGuest, user } = useAuth();
  const [promoCode, setPromoCode] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
            <div className="max-w-md mx-auto">
              <div className="bg-gray-50 rounded-lg p-12">
                <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
                <p className="text-gray-600 mb-6">
                  Looks like you haven't added any items to your cart yet.
                </p>
                <Button asChild size="lg">
                  <Link href="/products">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = total;
const tax = 0; // No tax
const shipping = subtotal > 999 ? 0 : 99;
const finalTotal = subtotal + shipping;

  // Check if user can proceed to checkout
  const canProceedToCheckout = isAuthenticated || isGuest;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Shopping Cart ({itemCount} items)</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={`${item.id}-${item.size}-${item.color}`}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>Size: {item.size}</p>
                              <p>Color: {item.color}</p>
                              {item.sleeveType && <p>Sleeve: {item.sleeveType}</p>}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id, item.size, item.color)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">₹{(item.price * item.quantity).toFixed(2)}</p>
                            <p className="text-sm text-gray-600">₹{item.price.toFixed(2)} each</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                
                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal ({itemCount} items)</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-green-600" : ""}>
                      {shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  {/*<div className="flex justify-between">
                    <span>Tax (GST 18%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>*/}
                  
                  <hr />
                  
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Promo Code */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <Button variant="outline" onClick={() => toast.info('Promo code feature coming soon!')}>
                      Apply
                    </Button>
                  </div>
                </div>
                
                {/* Auth Status & Checkout Button */}
                <div className="space-y-3">
                  {/* User Status Display */}
                  {user && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <p>Signed in as: <span className="font-medium">{user.email}</span></p>
                    </div>
                  )}
                  
                  {/* Checkout Button */}
                  {canProceedToCheckout ? (
                    <Button className="w-full" size="lg" asChild>
                      <Link href="/checkout">
                        Proceed to Checkout
                      </Link>
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 text-center">
                        Please sign in to continue with checkout
                      </p>
                      <Button className="w-full" size="lg" asChild>
                        <Link href="/auth/signin?redirect=/cart">
                          Sign In to Checkout
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
                
                <Button variant="outline" className="w-full mt-3" asChild>
                  <Link href="/products">
                    Continue Shopping
                  </Link>
                </Button>
                
                {/* Free Shipping Notice */}
                {subtotal < 999 && (
                  <div className="text-center text-xs text-gray-500 mt-4 p-3 bg-blue-50 rounded-lg">
                    <p>Add ₹{(999 - subtotal).toFixed(2)} more for free shipping!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}