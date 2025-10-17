// src/app/layout.tsx - Updated Root Layout with Full SEO
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientAuthProviders } from '@/components/ClientAuthProviders';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://zureediseno.com'), // Change to your actual domain
  title: {
    default: 'Zuree Diseno - Premium Fashion & Custom Tailored Clothing',
    template: '%s | Zuree Diseno'
  },
  description: 'Discover premium fashion, custom tailored clothing, and exclusive designs at Zuree Diseno. Shop men, women, and kids collections with free shipping across India.',
  keywords: [
    'fashion',
    'clothing',
    'custom tailoring',
    'premium fashion',
    'online shopping',
    'mens wear',
    'womens wear',
    'kids clothing',
    'Indian fashion',
    'designer clothes',
    'custom design',
    'bulk orders',
    'Zuree Diseno'
  ],
  authors: [{ name: 'Zuree Diseno' }],
  creator: 'Zuree Diseno',
  publisher: 'Zuree Diseno',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://zureediseno.com',
    siteName: 'Zuree Diseno',
    title: 'Zuree Diseno - Premium Fashion & Custom Tailored Clothing',
    description: 'Discover premium fashion, custom tailored clothing, and exclusive designs. Shop men, women, and kids collections.',
    images: [
      {
        url: '/og-image.jpg', // You'll need to create this image (1200x630px)
        width: 1200,
        height: 630,
        alt: 'Zuree Diseno - Premium Fashion Store',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zuree Diseno - Premium Fashion & Custom Tailored Clothing',
    description: 'Discover premium fashion, custom tailored clothing, and exclusive designs.',
    images: ['/twitter-image.jpg'], // You'll need to create this image (1200x675px)
    creator: '@zureediseno', // Replace with your Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
      },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#DC143C" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange={false}
          storageKey="zuree-theme"
        >
          <ClientAuthProviders>
            {children}
            <Toaster 
              position="top-right"
              richColors
              closeButton
              expand={true}
              duration={4000}
              visibleToasts={5} 
            />
          </ClientAuthProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}