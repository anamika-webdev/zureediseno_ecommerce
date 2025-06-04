// src/app/dashboard/layout.tsx - Updated to support admin-specific styling
'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import Sidebar from '@/components/dashboard/sidebar/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.includes('/dashboard/admin') || pathname?.includes('/admin');

  return (
    <div 
      className={`min-h-screen bg-gray-100 ${isAdminRoute ? 'admin-portal' : ''}`}
      data-route={pathname}
    >
      <div className="flex">
        {/* Fixed Sidebar */}
        <div className="fixed inset-y-0 left-0 w-64 bg-gray-900">
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
        richColors={!isAdminRoute} // Disable rich colors only for admin
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