// src/hooks/useAdminToast.ts - Custom hook for admin notifications
'use client';

import { usePathname } from 'next/navigation';
import { toast as sonnerToast } from 'sonner';
import { useToast } from '@/components/ui/use-toast';

export function useAdminToast() {
  const pathname = usePathname();
  const { toast: shadcnToast } = useToast();
  const isAdminRoute = pathname?.includes('/dashboard/admin') || pathname?.includes('/admin');

  const adminToastStyle = {
    background: '#000000',
    color: '#ffffff',
    border: '1px solid #333333',
  };

  const toast = {
    success: (message: string, options?: any) => {
      if (isAdminRoute) {
        return sonnerToast.success(message, {
          style: {
            ...adminToastStyle,
            borderLeft: '4px solid #22c55e',
          },
          ...options,
        });
      }
      return sonnerToast.success(message, options);
    },

    error: (message: string, options?: any) => {
      if (isAdminRoute) {
        return sonnerToast.error(message, {
          style: {
            ...adminToastStyle,
            borderLeft: '4px solid #ef4444',
          },
          ...options,
        });
      }
      return sonnerToast.error(message, options);
    },

    info: (message: string, options?: any) => {
      if (isAdminRoute) {
        return sonnerToast.info(message, {
          style: {
            ...adminToastStyle,
            borderLeft: '4px solid #3b82f6',
          },
          ...options,
        });
      }
      return sonnerToast.info(message, options);
    },

    warning: (message: string, options?: any) => {
      if (isAdminRoute) {
        return sonnerToast.warning(message, {
          style: {
            ...adminToastStyle,
            borderLeft: '4px solid #f59e0b',
          },
          ...options,
        });
      }
      return sonnerToast.warning(message, options);
    },

    loading: (message: string, options?: any) => {
      if (isAdminRoute) {
        return sonnerToast.loading(message, {
          style: {
            ...adminToastStyle,
            borderLeft: '4px solid #6b7280',
          },
          ...options,
        });
      }
      return sonnerToast.loading(message, options);
    },

    custom: (message: string, options?: any) => {
      if (isAdminRoute) {
        return sonnerToast(message, {
          style: adminToastStyle,
          ...options,
        });
      }
      return sonnerToast(message, options);
    },

    // Shadcn toast with admin styling
    shadcn: (options: any) => {
      if (isAdminRoute) {
        return shadcnToast({
          ...options,
          className: `admin-toast ${options.className || ''}`,
        });
      }
      return shadcnToast(options);
    },
  };

  return { toast, isAdminRoute };
}

// Usage example in admin components:
/*
import { useAdminToast } from '@/hooks/useAdminToast';

function AdminComponent() {
  const { toast } = useAdminToast();

  const handleSuccess = () => {
    toast.success('Product created successfully!');
  };

  const handleError = () => {
    toast.error('Failed to create product');
  };

  const handleShadcnToast = () => {
    toast.shadcn({
      title: "Success",
      description: "Your action was completed.",
    });
  };

  return (
    <div>
      <button onClick={handleSuccess}>Success</button>
      <button onClick={handleError}>Error</button>
      <button onClick={handleShadcnToast}>Shadcn Toast</button>
    </div>
  );
}
*/