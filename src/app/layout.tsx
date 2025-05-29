// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/providers/theme-provider';
//Toast
import { Toaster } from '@/components/ui/toaster';
import { Toaster  as SonnerToaster } from  "@/components/ui/sonner";
import ModalProvider from "@/providers/modal-providers";
import { CartProvider } from '@/context/CartContext';
export const metadata: Metadata = {
  title: 'Zuree Global',
  description: 'Zuree Global eCommerce',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <CartProvider>
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem  disableTransitionOnChange>
           <ModalProvider>{children}</ModalProvider>
            <Toaster />
            <SonnerToaster position="bottom-left" />
          </ThemeProvider>
        </body>
      </html>
      </CartProvider>
    </ClerkProvider>
  );
}
