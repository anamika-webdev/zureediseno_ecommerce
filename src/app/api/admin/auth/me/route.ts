// src/app/api/admin/auth/me/route.ts - Admin User Info API
import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/adminAuth';

export async function GET() {
  try {
    const user = await getCurrentAdmin();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Get admin user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}