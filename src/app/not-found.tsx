// src/app/not-found.tsx - Fixed for Next.js 15 build
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        {/* 404 Text */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
        </div>
        
        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-gray-600 leading-relaxed">
            The page you're looking for doesn't exist or has been moved. 
            Don't worry, it happens to the best of us.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/products">
              <Search className="mr-2 h-4 w-4" />
              Browse Products
            </Link>
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Or try these popular pages:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link 
              href="/about" 
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              About Us
            </Link>
            <span className="text-gray-300">•</span>
            <Link 
              href="/contact" 
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Contact
            </Link>
            <span className="text-gray-300">•</span>
            <Link 
              href="/shop" 
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}