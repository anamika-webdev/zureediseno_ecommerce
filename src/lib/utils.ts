import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// src/lib/utils/price.ts
export const formatPrice = (price: any): string => {
  if (price === null || price === undefined) {
    return '0.00';
  }
  
  // Convert to number if it's a string
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // Check if it's a valid number
  if (isNaN(numPrice)) {
    return '0.00';
  }
  
  return numPrice.toFixed(2);
};

export const formatCurrency = (price: any, currency: string = '$'): string => {
  return `${currency}${formatPrice(price)}`;
};

// Calculate savings
export const calculateSavings = (originalPrice: any, comparePrice: any): number => {
  const original = typeof originalPrice === 'string' ? parseFloat(originalPrice) : originalPrice;
  const compare = typeof comparePrice === 'string' ? parseFloat(comparePrice) : comparePrice;
  
  if (isNaN(original) || isNaN(compare) || compare <= original) {
    return 0;
  }
  
  return compare - original;
};

// Check if item is on sale
export const isOnSale = (price: any, comparePrice: any): boolean => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  const numComparePrice = typeof comparePrice === 'string' ? parseFloat(comparePrice) : comparePrice;
  
  return !isNaN(numPrice) && !isNaN(numComparePrice) && numComparePrice > numPrice;
};

// Additional utilities to add to your existing src/lib/utils.ts file
// Add these after your existing code

// Safe number conversion
export const safeNumber = (value: any, defaultValue: number = 0): number => {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? defaultValue : num;
};

// Calculate discount percentage
export const calculateDiscountPercentage = (originalPrice: any, salePrice: any): number => {
  const original = safeNumber(originalPrice);
  const sale = safeNumber(salePrice);
  
  if (original <= sale || original === 0) {
    return 0;
  }
  
  return Math.round(((original - sale) / original) * 100);
};

// Format price range
export const formatPriceRange = (minPrice: any, maxPrice: any): string => {
  const min = safeNumber(minPrice);
  const max = safeNumber(maxPrice);
  
  if (min === max) {
    return formatCurrency(min, '₹');
  }
  
  return `₹${formatPrice(min)} - ₹${formatPrice(max)}`;
};

// Calculate cart total with error handling
export const calculateCartTotal = (items: Array<{ price: any; quantity: number }>): number => {
  return items.reduce((total, item) => {
    const itemPrice = safeNumber(item.price);
    const itemQuantity = safeNumber(item.quantity, 1);
    return total + (itemPrice * itemQuantity);
  }, 0);
};

// Add the missing slugify function
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}
// Calculate tax (GST in India is typically 18%)
export const calculateTax = (amount: any, taxRate: number = 0.18): number => {
  const baseAmount = safeNumber(amount);
  return baseAmount * taxRate;
};

// Calculate shipping (free shipping above threshold)
export const calculateShipping = (cartTotal: any, freeShippingThreshold: number = 999): number => {
  const total = safeNumber(cartTotal);
  return total >= freeShippingThreshold ? 0 : 99;
};

// Validate if price is reasonable
export const isValidPrice = (price: any): boolean => {
  const num = safeNumber(price);
  return num > 0 && num < 1000000; // Between 0 and 10 lakhs
};