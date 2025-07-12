// src/app/api/admin/auth/logout/route.ts - Admin Logout API
import { NextResponse } from 'next/server';
import { deleteAdminSession } from '@/lib/adminAuth';

export async function POST() {
  try {
    await deleteAdminSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
