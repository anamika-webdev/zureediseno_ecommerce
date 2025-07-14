// src/components/admin/AdminAuthChecker.tsx - Quick Auth Debug Component
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, User, Key } from 'lucide-react';

export function AdminAuthChecker() {
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    setLoading(true);
    try {
      // Check admin session
      const adminResponse = await fetch('/api/admin/auth/me', {
        credentials: 'include'
      });
      
      // Check regular session  
      const userResponse = await fetch('/api/auth/me', {
        credentials: 'include'
      });

      const adminData = adminResponse.ok ? await adminResponse.json() : null;
      const userData = userResponse.ok ? await userResponse.json() : null;

      setAuthStatus({
        admin: {
          authenticated: adminResponse.ok,
          status: adminResponse.status,
          data: adminData
        },
        user: {
          authenticated: userResponse.ok,
          status: userResponse.status,
          data: userData
        }
      });
    } catch (error) {
      console.error('Auth check error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setAuthStatus({ error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogin = () => {
    window.location.href = '/admin/login';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Checking authentication...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          Authentication Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Admin Auth Status */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            {authStatus?.admin?.authenticated ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <h3 className="font-semibold">
              Admin Session: {authStatus?.admin?.authenticated ? 'Authenticated' : 'Not Authenticated'}
            </h3>
          </div>
          <div className="text-sm text-gray-600">
            <p>Status Code: {authStatus?.admin?.status}</p>
            {authStatus?.admin?.data && (
              <div className="mt-2">
                <p>User: {authStatus.admin.data.email}</p>
                <p>Role: {authStatus.admin.data.role}</p>
                <p>Name: {authStatus.admin.data.name || 'N/A'}</p>
              </div>
            )}
          </div>
        </div>

        {/* User Auth Status */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            {authStatus?.user?.authenticated ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <h3 className="font-semibold">
              User Session: {authStatus?.user?.authenticated ? 'Authenticated' : 'Not Authenticated'}
            </h3>
          </div>
          <div className="text-sm text-gray-600">
            <p>Status Code: {authStatus?.user?.status}</p>
            {authStatus?.user?.data && (
              <div className="mt-2">
                <p>User: {authStatus.user.data.email}</p>
                <p>Role: {authStatus.user.data.role}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={checkAuth} variant="outline">
            Refresh Status
          </Button>
          {!authStatus?.admin?.authenticated && (
            <Button onClick={handleLogin}>
              <User className="w-4 h-4 mr-2" />
              Admin Login
            </Button>
          )}
        </div>

        {/* Raw Data for Debugging */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium">Raw Auth Data</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(authStatus, null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
}