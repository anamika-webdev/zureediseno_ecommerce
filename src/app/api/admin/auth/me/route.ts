// src/app/api/admin/auth/me/route.ts - Debug Version
import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/adminAuth';

export async function GET() {
  console.log('API /admin/auth/me - Request received');
  
  try {
    const user = await getCurrentAdmin();
    
    console.log('API /admin/auth/me - getCurrentAdmin result:', user ? {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    } : null);
    
    if (!user) {
      console.log('API /admin/auth/me - No user found, returning 401');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('API /admin/auth/me - Returning user data');
    return NextResponse.json(user);
  } catch (error) {
    console.error('API /admin/auth/me - Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}