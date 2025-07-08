// src/lib/auth.ts
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const secretKey = process.env.AUTH_SECRET || 'fallback-secret-key-please-change-in-production'
const encodedKey = new TextEncoder().encode(secretKey)

export interface SessionPayload extends Record<string, any> {
  userId: string
  email: string
  role: string
  expiresAt: Date
}

export async function createSession(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) throw new Error('User not found')

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  const session: SessionPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    expiresAt,
  }

  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(encodedKey)

  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })

  return token
}

export async function verifySession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ['HS256'],
    })

    return payload as unknown as SessionPayload
  } catch (error) {
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Helper function to get current user
export async function getCurrentUser() {
  const session = await verifySession()
  if (!session) return null

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
      clerkId: true, // Keep for migration reference
    }
  })

  if (!user) return null

  // Compute name field
  const name = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.firstName || user.lastName || ''

  return {
    ...user,
    name: name.trim(),
    banned: false, // Default values since these fields don't exist yet
    locked: false,
    lastActiveAt: null,
  }
}

// Middleware helper
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export async function requireRole(role: string) {
  const user = await requireAuth()
  if (user.role !== role) {
    throw new Error('Insufficient permissions')
  }
  return user
}

// Helper for admin check
export async function requireAdmin() {
  return requireRole('ADMIN')
}

// Helper for seller check
export async function requireSeller() {
  const user = await requireAuth()
  if (user.role !== 'ADMIN') {
    throw new Error('Seller permissions required')
  }
  return user
}