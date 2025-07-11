// src/context/CartContext.tsx - Fixed version with sleeveType support
'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  quantity: number;
  size: string;
  color: string;
  sleeveType?: string; // Added this field
  variantId?: string;
  sku?: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { id: string; size: string; color: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; size: string; color: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

interface CartContextType extends CartState {
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (id: string, size: string, color: string) => void;
  updateQuantity: (id: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.payload.id && 
                item.size === action.payload.size && 
                item.color === action.payload.color &&
                item.sleeveType === action.payload.sleeveType
      );

      let newItems;
      if (existingItemIndex >= 0) {
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        newItems = [...state.items, action.payload];
      }

      const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return { items: newItems, total, itemCount };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => 
        !(item.id === action.payload.id && 
          item.size === action.payload.size && 
          item.color === action.payload.color)
      );
      const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return { items: newItems, total, itemCount };
    }

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return cartReducer(state, { 
          type: 'REMOVE_ITEM', 
          payload: { 
            id: action.payload.id, 
            size: action.payload.size, 
            color: action.payload.color 
          } 
        });
      }

      const newItems = state.items.map(item => {
        return (item.id === action.payload.id && 
                item.size === action.payload.size && 
                item.color === action.payload.color)
          ? { ...item, quantity: action.payload.quantity }
          : item;
      });

      const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return { items: newItems, total, itemCount };
    }

    case 'CLEAR_CART':
      return { items: [], total: 0, itemCount: 0 };

    case 'LOAD_CART': {
      const total = action.payload.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const itemCount = action.payload.reduce((sum, item) => sum + item.quantity, 0);
      return { items: action.payload, total, itemCount };
    }

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
  });

  // Load cart from localStorage on mount (if running in browser)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('zuree_cart');
      if (savedCart) {
        try {
          const cartItems = JSON.parse(savedCart);
          dispatch({ type: 'LOAD_CART', payload: cartItems });
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
          localStorage.removeItem('zuree_cart');
        }
      }
    }
  }, []);

  // Save cart to localStorage when state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('zuree_cart', JSON.stringify(state.items));
    }
  }, [state.items]);

  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    // Ensure price is always a number
    const cartItem = {
      ...item,
      price: Number(item.price),
      quantity: item.quantity || 1
    };
    
    dispatch({
      type: 'ADD_ITEM',
      payload: cartItem,
    });
    
    console.log(`${item.name} added to cart!`);
  };

  const removeFromCart = (id: string, size: string, color: string) => {
    const item = state.items.find(item => 
      item.id === id && item.size === size && item.color === color
    );
    if (item) {
      dispatch({ 
        type: 'REMOVE_ITEM', 
        payload: { id, size, color } 
      });
      console.log(`${item.name} removed from cart`);
    }
  };

  const updateQuantity = (id: string, size: string, color: string, quantity: number) => {
    dispatch({ 
      type: 'UPDATE_QUANTITY', 
      payload: { id, size, color, quantity } 
    });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    console.log('Cart cleared');
  };

  // Legacy compatibility methods
  const getTotalItems = () => state.itemCount;
  const getCartTotal = () => state.total;

  const value: CartContextType = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getCartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartProvider;