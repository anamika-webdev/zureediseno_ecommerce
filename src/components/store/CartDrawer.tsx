// src/components/store/CartDrawer.tsx - Fixed version
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext'

export function CartDrawer() {
  const { 
    items, 
    total,
    itemCount,
    updateQuantity, 
    removeFromCart
  } = useCart();
  
  const [open, setOpen] = useState(false);

  // Updated to match the new CartContext function signatures
  const handleUpdateQuantity = (itemId: string, size: string, color: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId, size, color);
    } else {
      updateQuantity(itemId, size, color, newQuantity);
    }
  };

  const handleRemoveItem = (itemId: string, size: string, color: string) => {
    removeFromCart(itemId, size, color);
  };

  if (itemCount === 0) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button 
            aria-label="Cart" 
            className="relative p-1 hover:bg-gray-100 rounded"
          >
            <ShoppingBag className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Shopping Cart
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center h-full text-center -mt-16">
            <div className="bg-gray-50 rounded-full p-6 mb-4">
              <ShoppingBag className="h-12 w-12 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Add some items to get started</p>
            <Button onClick={() => setOpen(false)} asChild className="bg-black hover:bg-gray-800">
              <Link href="/products">
                Continue Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button 
          aria-label="Cart" 
          className="relative p-1 hover:bg-gray-100 rounded"
        >
          <ShoppingBag className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-full h-4 w-4 p-0 flex items-center justify-center">
              {itemCount > 9 ? '9+' : itemCount}
            </Badge>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Shopping Cart
            </div>
            <span className="text-sm font-normal text-gray-500">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 py-4">
            {items.map((item) => {
              return (
                <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="relative w-16 h-16 bg-white rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-sm leading-tight truncate pr-2">{item.name}</h4>
                      <span className="text-sm font-semibold flex-shrink-0">₹{Number(item.price).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                      <span>{item.size}</span>
                      <span>•</span>
                      <span>{item.color}</span>
                      {item.sleeveType && (
                        <>
                          <span>•</span>
                          <span>{item.sleeveType}</span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6"
                          onClick={() => handleUpdateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6"
                          onClick={() => handleUpdateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                        onClick={() => handleRemoveItem(item.id, item.size, item.color)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-1">
                      Total: ₹{(Number(item.price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Cart Summary */}
        <div className="border-t pt-4 space-y-4 bg-white">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal ({itemCount} items)</span>
              <span>₹{Number(total).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (Est.)</span>
              <span>₹{(Number(total) * 0.18).toFixed(2)}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-xl font-bold">₹{(Number(total) * 1.18).toFixed(2)}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button 
              className="w-full bg-black hover:bg-gray-800 text-white" 
              size="lg" 
              asChild
            >
              <Link href="/checkout" onClick={() => setOpen(false)}>
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-gray-300 hover:bg-gray-50" 
              asChild
            >
              <Link href="/cart" onClick={() => setOpen(false)}>
                View Full Cart
              </Link>
            </Button>
          </div>
          
          <div className="text-center text-xs text-gray-500">
            <p>Free shipping on orders over ₹999</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}