// src/app/dashboard/layout.tsx - Fixed dashboard layout
'use client';

import { useAdminAuth } from '@/context/AdminAuthContext';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import Sidebar from '@/components/dashboard/sidebar/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading, isAuthenticated, isAdmin } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isAdminRoute = pathname?.includes('/dashboard/admin') || pathname?.includes('/admin');

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        // Redirect to appropriate login page based on route
        if (isAdminRoute) {
          router.push('/admin/login?redirect=' + encodeURIComponent(pathname || '/dashboard/admin'));
        } else {
          router.push('/auth/signin?redirect=' + encodeURIComponent(pathname || '/dashboard'));
        }
        return;
      }
      
      // Check if user has access to admin routes
      if (isAdminRoute && !isAdmin) {
        // Instead of redirecting to main site, redirect to admin login
        router.push('/admin/login?redirect=' + encodeURIComponent(pathname || '/dashboard/admin'));
        return;
      }
    }
  }, [authLoading, isAuthenticated, isAdmin, isAdminRoute, router, pathname]);

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Don't render if not authenticated or not authorized
  if (!isAuthenticated || (isAdminRoute && !isAdmin)) {
    return null;
  }

  return (
    <div 
      className={`min-h-screen bg-gray-100 ${isAdminRoute ? 'admin-portal' : ''}`}
      data-route={pathname}
    >
      <div className="flex">
        {/* Fixed Sidebar */}
        <div className="fixed inset-y-0 left-0 w-64 z-50">
          <Sidebar />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 ml-64">
          {/* Page Content */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
      
      {/* Notifications - Black for admin, default for others */}
      <Toaster />
      <SonnerToaster 
        position="bottom-left" 
        expand={true}
        richColors={!isAdminRoute}
        closeButton
        theme={isAdminRoute ? "dark" : "light"}
        toastOptions={{
          style: isAdminRoute ? {
            background: '#000000',
            color: '#ffffff',
            border: '1px solid #333333',
          } : {},
          className: isAdminRoute ? 'admin-toast' : '',
        }}
      />
    </div>
  );
}