// src/app/api/admin/test-session/route.ts - Test Admin Session
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/adminAuth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing admin session...');
    
    // Check if admin session cookie exists
    const cookieStore = await cookies();
    const adminSessionCookie = cookieStore.get('admin-session');
    
    console.log('Admin session cookie:', adminSessionCookie ? 'EXISTS' : 'NOT FOUND');
    console.log('Cookie value:', adminSessionCookie?.value ? 'HAS_VALUE' : 'NO_VALUE');
    
    // Verify the session
    const session = await verifyAdminSession();
    console.log('Session verification result:', session ? 'VALID' : 'INVALID');
    
    if (session) {
      console.log('Session details:', {
        userId: session.userId,
        email: session.email,
        role: session.role,
        isAdmin: session.isAdmin
      });
    }
    
    return NextResponse.json({
      success: true,
      hasCookie: !!adminSessionCookie,
      hasValue: !!adminSessionCookie?.value,
      sessionValid: !!session,
      sessionData: session ? {
        userId: session.userId,
        email: session.email,
        role: session.role,
        isAdmin: session.isAdmin
      } : null
    });
    
  } catch (error) {
    console.error('Session test error:', error);
    return NextResponse.json(
      { 
        error: 'Session test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}