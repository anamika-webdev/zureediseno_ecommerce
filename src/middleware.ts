// src/middleware.ts - Fixed Version
import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'
import { verifyAdminSession } from '@/lib/adminAuth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to admin login page without authentication
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Allow guest access to these routes (NO AUTHENTICATION REQUIRED)
  const guestAllowedRoutes = [
    '/checkout',
    '/track-order', 
    '/order-success',
    '/shop',
    '/products',
    '/categories',
    '/search',
    '/', // home page
    '/about',
    '/contact',
    '/privacy',
    '/terms'
  ];

  // Check if current path is guest-allowed
  const isGuestAllowed = guestAllowedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  if (isGuestAllowed) {
    return NextResponse.next()
  }

  // FIXED: Handle dashboard routes with admin session authentication
  if (pathname.startsWith('/dashboard')) {
    const adminSession = await verifyAdminSession()
    
    if (!adminSession) {
      return NextResponse.redirect(new URL('/admin/login?redirect=' + encodeURIComponent(pathname), request.url))
    }
    
    // Check if user is admin
    if (adminSession.role !== 'ADMIN' && adminSession.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    return NextResponse.next()
  }

  // Protect admin routes (except login) with admin session
  if (pathname.startsWith('/admin')) {
    const adminSession = await verifyAdminSession()
    
    if (!adminSession) {
      return NextResponse.redirect(new URL('/admin/login?redirect=' + encodeURIComponent(pathname), request.url))
    }
    
    if (adminSession.role !== 'ADMIN' && adminSession.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    return NextResponse.next()
  }

  // For all other routes, use regular session authentication
  const session = await verifySession()
  const isAuthenticated = !!session
  const userRole = session?.role

  // Protect forum routes
  if (pathname.startsWith('/forum')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/auth/signin?redirect=' + encodeURIComponent(pathname), request.url))
    }
  }

  // Protect profile and user-specific order pages
  if (pathname.startsWith('/profile') || pathname.startsWith('/orders')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/auth/signin?redirect=' + encodeURIComponent(pathname), request.url))
    }
  }

  // Protect auth pages for already authenticated users
  if (pathname.startsWith('/auth/') && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}