// src/context/MainAuthContext.tsx - Main Site Authentication with Hydration Fix
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface MainUser {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  imageUrl?: string;
}

interface MainAuthContextType {
  user: MainUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const MainAuthContext = createContext<MainAuthContextType | undefined>(undefined);

interface MainAuthProviderProps {
  children: ReactNode;
}

export function MainAuthProvider({ children }: MainAuthProviderProps) {
  const [user, setUser] = useState<MainUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check if current path is NOT admin route
  const isMainSiteRoute = !pathname?.startsWith('/dashboard/admin') && !pathname?.startsWith('/admin');

  // Handle mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only initialize main auth on main site routes and after mounting
    if (mounted && isMainSiteRoute) {
      checkMainAuth();
    } else if (mounted) {
      setLoading(false);
    }
  }, [isMainSiteRoute, mounted]);

  const checkMainAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Main auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
    } catch (error) {
      console.error('Main login error:', error);
      return false;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const newUser = await response.json();
        setUser(newUser);
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Main logout error:', error);
    } finally {
      setUser(null);
      router.push('/');
    }
  };

  const refreshUser = async (): Promise<void> => {
    if (mounted && isMainSiteRoute) {
      await checkMainAuth();
    }
  };

  const value: MainAuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <MainAuthContext.Provider value={value}>
      {children}
    </MainAuthContext.Provider>
  );
}

export function useMainAuth() {
  const context = useContext(MainAuthContext);
  if (context === undefined) {
    throw new Error('useMainAuth must be used within a MainAuthProvider');
  }
  return context;
}
