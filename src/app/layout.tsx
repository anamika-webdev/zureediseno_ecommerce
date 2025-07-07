// src/app/layout.tsx - Clean layout without hydration issues
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { NextThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Zuree Diseno - Premium Design Store',
  description: 'Discover premium designs and custom solutions at Zuree Diseno',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Prevent FOUC with CSS-only approach */}
          <style dangerouslySetInnerHTML={{
            __html: `
              @media (prefers-color-scheme: dark) {
                :root {
                  --background: 222.2 84% 4.9%;
                  --foreground: 210 40% 98%;
                  --card: 222.2 84% 4.9%;
                  --card-foreground: 210 40% 98%;
                  --popover: 222.2 84% 4.9%;
                  --popover-foreground: 210 40% 98%;
                  --primary: 210 40% 98%;
                  --primary-foreground: 222.2 47.4% 11.2%;
                  --secondary: 217.2 32.6% 17.5%;
                  --secondary-foreground: 210 40% 98%;
                  --muted: 217.2 32.6% 17.5%;
                  --muted-foreground: 215 20.2% 65.1%;
                  --accent: 217.2 32.6% 17.5%;
                  --accent-foreground: 210 40% 98%;
                  --destructive: 0 62.8% 30.6%;
                  --destructive-foreground: 210 40% 98%;
                  --border: 217.2 32.6% 17.5%;
                  --input: 217.2 32.6% 17.5%;
                  --ring: 212.7 26.8% 83.9%;
                }
              }
            `
          }} />
        </head>
        <body 
          className={inter.className}
          suppressHydrationWarning
        >
          <NextThemeProvider>
            {children}
          </NextThemeProvider>
          <Toaster 
            position="top-right"
            richColors
            closeButton
          />
        </body>
      </html>
    </ClerkProvider>
  )
}