// src/app/layout.tsx - Updated Root Layout with Client Wrapper
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientAuthProviders } from '@/components/ClientAuthProviders';
import { ThemeProvider } from '@/components/theme-provider';
//import { Toaster } from 'react-hot-toast';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Zuree Diseno - E-commerce Platform',
  description: 'Your premier e-commerce destination',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange={false}
          storageKey="zuree-theme"
        >
        <ClientAuthProviders>
          {/* UPDATED: Use Sonner with proper admin portal detection */}
         <TermsAcceptanceModal /
          {children}
          <Toaster position="top-right"
           richColors
            closeButton
            expand={true}
            duration={4000}
            visibleToasts={5} />
        </ClientAuthProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
