// src/lib/adminAuth.ts - Separate Admin Auth Utilities
import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const adminSecretKey = process.env.ADMIN_AUTH_SECRET || 'admin-secret-key-change-in-production';
const adminEncodedKey = new TextEncoder().encode(adminSecretKey);

export interface AdminSessionPayload extends JWTPayload {
  userId: string;
  email: string;
  role: string;
  expiresAt: Date;
  isAdmin: boolean;
}

export async function createAdminSession(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    throw new Error('Unauthorized: Admin access required');
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session: AdminSessionPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    expiresAt,
    isAdmin: true,
  };

  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(adminEncodedKey);

  const cookieStore = await cookies();
  cookieStore.set('admin-session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });

  return token;
}

export async function verifyAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-session')?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, adminEncodedKey, {
      algorithms: ['HS256'],
    });

    return payload as unknown as AdminSessionPayload;
  } catch (error) {
    return null;
  }
}

export async function deleteAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete('admin-session');
}

export async function getCurrentAdmin() {
  const session = await verifyAdminSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      imageUrl: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return null;
  }

  const name = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.firstName || user.lastName || '';

  return {
    ...user,
    name: name.trim(),
    isAdmin: true,
  };
}