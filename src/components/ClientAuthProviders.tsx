// src/components/ClientAuthProviders.tsx - Client-only Auth Providers
"use client";

import { ReactNode } from 'react';
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import { MainAuthProvider } from '@/context/MainAuthContext';

interface ClientAuthProvidersProps {
  children: ReactNode;
}

export function ClientAuthProviders({ children }: ClientAuthProvidersProps) {
  return (
    <AdminAuthProvider>
      <MainAuthProvider>
        {children}
      </MainAuthProvider>
    </AdminAuthProvider>
  );
}