// src/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

type User = {
  id: string;
  name: string;
  email: string | null;
  isGuest: boolean;
  isAdmin: boolean;
};

type AuthContextType = {
  user: User | null;
  loginAsGuest: () => void;
  loginAsAdmin: () => void;
  logout: () => void;
  isAuthenticated: boolean;
  isGuest: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  // Handle hydration and load saved user
  useEffect(() => {
    setMounted(true);
    
    // Load user from localStorage on mount
    try {
      const savedUser = localStorage.getItem('zuree_user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error loading saved user:', error);
      localStorage.removeItem('zuree_user');
    }
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      if (user) {
        localStorage.setItem('zuree_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('zuree_user');
      }
    }
  }, [user, mounted]);

  const loginAsGuest = () => {
    const guestUser: User = {
      id: `guest-${Math.random().toString(36).substring(2, 9)}`,
      name: 'Guest User',
      email: null,
      isGuest: true,
      isAdmin: false,
    };
    
    setUser(guestUser);
    toast({
      title: "Logged in as guest",
      description: "You can now browse the store without creating an account.",
    });
  };

  const loginAsAdmin = () => {
    const adminUser: User = {
      id: `admin-${Math.random().toString(36).substring(2, 9)}`,
      name: 'Admin User',
      email: 'admin@zuree.com',
      isGuest: false,
      isAdmin: true,
    };
    
    setUser(adminUser);
    toast({
      title: "Logged in as admin",
      description: "You now have access to admin features.",
    });
  };

  const logout = () => {
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return <div>{children}</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loginAsGuest,
        loginAsAdmin,
        logout,
        isAuthenticated: !!user,
        isGuest: user?.isGuest || false,
        isAdmin: user?.isAdmin || false
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return a safe fallback instead of throwing an error
    console.warn('useAuth must be used within an AuthProvider');
    return {
      user: null,
      loginAsGuest: () => {},
      loginAsAdmin: () => {},
      logout: () => {},
      isAuthenticated: false,
      isGuest: false,
      isAdmin: false,
    };
  }
  return context;
};