// src/app/dashboard/admin/layout.tsx - Admin Dashboard Layout
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { RefreshCw } from 'lucide-react';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAuthenticated, isAdmin } = useAdminAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading) {
      console.log('Dashboard auth check:', { 
        isAuthenticated, 
        isAdmin, 
        userEmail: user?.email,
        userRole: user?.role 
      });
      
      if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to admin login...');
        router.push('/admin/login');
        return;
      }
      
      if (!isAdmin) {
        console.log('Not admin role, redirecting to admin login...');
        // Don't redirect to main site, redirect to admin login instead
        router.push('/admin/login');
        return;
      }

      console.log('Admin access granted for:', user?.email);
    }
  }, [mounted, loading, isAuthenticated, isAdmin, router, user]);

  // Don't render anything until mounted
  if (!mounted) {
    return null;
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting unauthenticated users
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-red-600" />
          <p>Checking admin access...</p>
        </div>
      </div>
    );
  }

  // Render dashboard for authenticated admin users
  return (
    <div className="admin-dashboard">
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded text-xs z-50">
          Admin: {user?.email} ({user?.role})
        </div>
      )}
      {children}
    </div>
  );
}