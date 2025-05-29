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