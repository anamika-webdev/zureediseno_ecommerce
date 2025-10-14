// ============================================
// FILE 5: src/components/dashboard/sidebar/sidebar.tsx (Updated)
// ============================================
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
  Palette,
  User,
  PackageOpen
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
    name: 'Bulk Orders',
    href: '/dashboard/admin/bulk-orders',
    icon: PackageOpen,
    badge: true,
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
    name: 'Custom Designs',
    href: '/dashboard/admin/custom-designs',
    icon: Palette,
    badge: true,
  },
  {
    name: 'Settings',
    href: '/dashboard/admin/settings',
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
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
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
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
              {item.badge && (
                <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  New
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-gray-800 p-4">
        {user && (
          <div className="mb-4 text-sm text-gray-300">
            <div className="flex items-center mb-2">
              <User className="mr-2 h-4 w-4" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="text-xs text-gray-500">
              Role: {user.role}
            </div>
          </div>
        )}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start text-gray-300 border-gray-700 hover:bg-gray-800 hover:text-white"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}