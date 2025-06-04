// src/app/dashboard/admin/layout.tsx - Admin layout with black notifications
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import Header from "@/components/dashboard/header/header";
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Block non admins from accessing the admin dashboard
  const user = await currentUser();
  if (!user || user.privateMetadata.role !== "ADMIN") redirect("/");
  
  return (
    <div className="admin-portal" data-route="/dashboard/admin">
      <div className="ml-[20px]">
        <Header />
        <div className="w-full mt-[75px] p-4">{children}</div>
      </div>
      
      {/* Black notifications for admin portal */}
      <Toaster />
      <SonnerToaster 
        position="bottom-left" 
        expand={true}
        richColors={false} // Disable rich colors for admin
        closeButton
        theme="dark"
        toastOptions={{
          style: {
            background: '#000000',
            color: '#ffffff',
            border: '1px solid #333333',
          },
          className: 'admin-toast',
        }}
      />
    </div>
  );
}