// src/components/dashboard/sidebar/sidebar.tsx - Fixed Settings Route
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { cn } from '@/lib/utils';
import {
  Home,
  LayoutDashboard, 
  Package, 
  Tag, 
  Layers, 
  ShoppingCart, 
  Users, 
  CreditCard, 
  Settings,
  LogOut,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Products',
    href: '/dashboard/admin/products',
    icon: Package,
  },
  {
    name: 'Categories',
    href: '/dashboard/admin/categories',
    icon: Tag,
  },
  {
    name: 'Subcategories',
    href: '/dashboard/admin/subcategories',
    icon: Layers,
  },
  {
    name: 'Orders',
    href: '/dashboard/admin/orders',
    icon: ShoppingCart,
  },
  {
    name: 'Customers',
    href: '/dashboard/admin/customers',
    icon: Users,
  },
  {
    name: 'Payments',
    href: '/dashboard/admin/payments',
    icon: CreditCard,
  },
  {
    name: 'Settings',
    href: '/dashboard/admin/settings', // FIXED: Changed from /dashboard/settings to /dashboard/admin/settings
    icon: Settings,
  },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout, loading } = useAdminAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className={cn('flex h-full w-64 flex-col bg-gray-900', className)}>
        <div className="flex h-16 items-center justify-center border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex h-full w-64 flex-col bg-gray-900', className)}>
      {/* Header */}
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      {/* User Profile & Logout */}
      {user ? (
        <div className="border-t border-gray-800 p-4">
          <div className="flex items-center mb-3">
            <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
              {user.imageUrl ? (
                <img 
                  src={user.imageUrl} 
                  alt={user.name || user.email} 
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-gray-300" />
              )}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
              </p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
              {user.role && (
                <p className="text-xs text-gray-500 uppercase">{user.role}</p>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      ) : (
        <div className="border-t border-gray-800 p-4">
          <div className="text-sm text-gray-400">
            Not authenticated
          </div>
        </div>
      )}
    </div>
  );
}