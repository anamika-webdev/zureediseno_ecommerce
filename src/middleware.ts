// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if user is authenticated
  const session = await verifySession()
  const isAuthenticated = !!session
  const userRole = session?.role

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
    
    // Only allow ADMIN and SELLER roles to access dashboard
    if (userRole === 'USER') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
    if (userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protect forum routes
  if (pathname.startsWith('/forum')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }

  // Protect profile and order pages
  if (pathname.startsWith('/profile') || pathname.startsWith('/orders')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/admin/:path*', 
    '/forum/:path*',
    '/profile/:path*',
    '/orders/:path*'
  ]
}