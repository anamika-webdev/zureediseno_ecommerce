// src/app/layout.tsx - Updated Root Layout with Client Wrapper
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientAuthProviders } from '@/components/ClientAuthProviders';
import { Toaster } from 'react-hot-toast';

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
      <body className={inter.className} suppressHydrationWarning>
        <ClientAuthProviders>
          {children}
          <Toaster position="top-right" />
        </ClientAuthProviders>
      </body>
    </html>
  );
}
