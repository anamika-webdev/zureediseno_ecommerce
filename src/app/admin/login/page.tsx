// src/app/admin/login/page.tsx - FIXED Admin Login with Proper Redirect (Blue box removed)
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Check if already authenticated
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Already authenticated as admin:', userData);
        // Force redirect if already logged in
        window.location.href = '/dashboard/admin/categories';
        return;
      }
    } catch (error) {
      console.log('🔐 Not authenticated, showing login form');
    }
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!formData.email || !formData.password) {
    toast.error('Please enter email and password');
    return;
  }

  setLoading(true);

  try {
    console.log('🔐 Attempting admin login with:', formData.email);
    
    const response = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: formData.email.trim(),
        password: formData.password
      }),
    });

    console.log('📡 Login response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login successful:', data);
      
      toast.success('Login successful! Redirecting...');

      // Multiple redirect strategies to ensure it works
      setTimeout(() => {
        console.log('🔄 Attempting router.push redirect');
        router.push('/dashboard/admin/categories');
      }, 500);

      setTimeout(() => {
        console.log('🔄 Attempting window.location redirect');
        window.location.href = '/dashboard/admin/categories';
      }, 1000);

      setTimeout(() => {
        console.log('🔄 Force page reload if still here');
        if (window.location.pathname === '/admin/login') {
          window.location.reload();
        }
      }, 2000);

    } else {
      // ENHANCED: Better error handling for failed login
      let errorMessage = 'Login failed';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        console.error('❌ Login failed:', errorData);
        
        // Map specific error messages for better UX
        if (errorMessage === 'Invalid credentials') {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (errorMessage === 'Admin access required') {
          errorMessage = 'This account does not have admin privileges.';
        } else if (errorMessage === 'Email and password are required') {
          errorMessage = 'Please fill in both email and password fields.';
        }
        
      } catch (parseError) {
        console.error('❌ Failed to parse error response:', parseError);
        errorMessage = `Login failed (Status: ${response.status})`;
      }
      
      // MULTIPLE notification methods to ensure visibility
      toast.error(errorMessage);
      
      // Also log to console for debugging
      console.error('LOGIN ERROR:', {
        status: response.status,
        message: errorMessage,
        timestamp: new Date().toISOString()
      });
      
      // Clear password field on failed attempt
      setFormData(prev => ({ ...prev, password: '' }));
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    const errorMessage = error instanceof Error 
      ? `Network error: ${error.message}` 
      : 'Network error. Please check your connection and try again.';
    
    // Multiple notification methods
    toast.error(errorMessage);
    console.error('NETWORK ERROR:', error);
    
  } finally {
    setLoading(false);
  }
};

  // Quick test admin credentials
  

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="mt-4 text-2xl font-bold">Admin Login</CardTitle>
            <p className="text-gray-600">Sign in to your admin account</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="admin@example.com"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              {/* Test Button for Development */}
              
            </form>

            {/* REMOVED: Blue info box with SQL commands was here */}
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
}