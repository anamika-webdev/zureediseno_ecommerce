// src/hooks/use-toast.ts
import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ title, description, variant = 'default', duration = 5000 }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { id, title, description, variant, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove toast after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
    
    // Show browser notification for better UX
    if (title) {
      // Simple alert for now - you can replace with a proper toast component
      if (variant === 'destructive') {
        console.error(`Error: ${title}${description ? ` - ${description}` : ''}`);
        alert(`Error: ${title}${description ? ` - ${description}` : ''}`);
      } else {
        console.log(`Success: ${title}${description ? ` - ${description}` : ''}`);
        alert(`Success: ${title}${description ? ` - ${description}` : ''}`);
      }
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return {
    toast,
    toasts,
    removeToast,
  };
};