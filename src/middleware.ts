// src/middleware.ts - Fixed for Next.js 15
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)', 
  '/forum(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  // Protect routes that need authentication
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
  
  // Allow all other routes to pass through
  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}