// src/lib/razorpay.ts - Simplified version without actual Razorpay
export const razorpay = {
  orders: {
    create: async (options: any) => {
      // Mock implementation for development
      return {
        id: `order_${Date.now()}`,
        amount: options.amount,
        currency: options.currency,
      };
    },
  },
};