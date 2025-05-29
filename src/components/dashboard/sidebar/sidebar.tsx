// src/components/dashboard/Sidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

import {
  Home,
  Package,
  ShoppingCart,
  Users,
  Settings,
  BarChart3,
  Tag,
  Layers
} from 'lucide-react';

// Define proper User type for sidebar
interface SidebarUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  image?: string;
}

interface SidebarProps {
  user?: SidebarUser | null;
  className?: string;
}

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
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    name: 'Customers',
    href: '/dashboard/customers',
    icon: Users,
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export default function Sidebar({ user, className = '' }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn('flex h-full w-64 flex-col bg-gray-900', className)}>
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
      </div>
      
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
      
      {user && (
        <div className="border-t border-gray-800 p-4">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}