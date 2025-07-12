// src/app/admin/login/page.tsx - Simplified Admin Login (Fixed)
"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, EyeOff, RefreshCw } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@test.com');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Simple auth check without using the context (to avoid redirect loops)
  useEffect(() => {
    if (mounted) {
      checkExistingAuth();
    }
  }, [mounted]);

  const checkExistingAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('Already authenticated:', userData);
        // Redirect to dashboard if already logged in
        router.push('/dashboard/admin');
      }
    } catch (error) {
      console.log('Not authenticated, showing login form');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting login...');
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('Login successful:', userData);
        toast.success('Login successful! Redirecting...');
        
        // Multiple redirect strategies
        setTimeout(() => {
          router.push('/dashboard/admin');
        }, 100);
        
        setTimeout(() => {
          if (window.location.pathname === '/admin/login') {
            window.location.href = '/dashboard/admin';
          }
        }, 1000);
        
      } else {
        const error = await response.json();
        console.error('Login failed:', error);
        toast.error(error.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Admin Portal</CardTitle>
          <p className="text-gray-600">Sign in to access admin dashboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@test.com"
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="password"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          
          <div className="mt-4 space-y-2">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                <strong>Test Credentials:</strong>
              </p>
              <p className="text-sm font-mono">
                admin@test.com / password
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                className="flex-1"
                onClick={() => window.open('/admin/test', '_blank')}
              >
                Test APIs
              </Button>
              
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                className="flex-1"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/admin/create-test-admin', {
                      method: 'POST',
                      credentials: 'include'
                    });
                    const result = await response.json();
                    if (result.success) {
                      toast.success('Test admin created/verified');
                    } else {
                      toast.error('Failed to create test admin');
                    }
                  } catch (error) {
                    toast.error('Error creating test admin');
                  }
                }}
              >
                Create Test Admin
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}