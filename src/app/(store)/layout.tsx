// src/app/(store)/layout.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import Header from "@/components/store/layout/header/header";
import Footer from "@/components/store/layout/footer/footer";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import GlobalLoader from '@/components/GlobalLoader';
//import "./globals.css";

export default function StoreLayout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col">
          <GlobalLoader /> {/* Add this line */}
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <Toaster />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
