// src/lib/auth.ts - Enhanced version with real-time admin features
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

  // Update last login time for real-time tracking
  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() }
  })

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

// Enhanced getCurrentUser for real-time admin features
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
      phone: true,          // NEW: For admin features
      imageUrl: true,
      role: true,
      isActive: true,       // NEW: Account status
      lastLoginAt: true,    // NEW: Activity tracking
      createdAt: true,
      updatedAt: true,      // NEW: For audit trail
    }
  })

  if (!user) return null

  // Check if user account is active
  if (!user.isActive) return null

  // Compute name field
  const name = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.firstName || user.lastName || ''

  return {
    ...user,
    name: name.trim(),
    // Legacy fields for backward compatibility
    banned: !user.isActive,
    locked: !user.isActive,
    lastActiveAt: user.lastLoginAt,
  }
}

// Enhanced middleware helper with activity tracking
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  
  // Optional: Update last activity for real-time tracking
  // Uncomment if you want to track every API call
  /*
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  }).catch(() => {}) // Silent fail to not break requests
  */
  
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
  if (user.role !== 'ADMIN' && user.role !== 'SELLER') {
    throw new Error('Seller permissions required')
  }
  return user
}

// NEW: Admin action logging for audit trail
export async function logAdminAction(
  adminId: string,
  action: string,
  entityType: string,
  entityId: string,
  oldValues?: any,
  newValues?: any,
  req?: Request
) {
  try {
    await prisma.adminLog.create({
      data: {
        adminId,
        action,
        entityType,
        entityId,
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
        ipAddress: req ? getClientIP(req) : null,
        userAgent: req ? req.headers.get('user-agent') : null,
      }
    })
  } catch (error) {
    console.error('Failed to log admin action:', error)
    // Don't throw error to avoid breaking the main operation
  }
}

// NEW: Helper to get client IP
function getClientIP(req: Request): string | null {
  // Check various headers for IP address
  const forwarded = req.headers.get('x-forwarded-for')
  const realIP = req.headers.get('x-real-ip')
  const cfConnectingIP = req.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  return realIP || cfConnectingIP || null
}

// NEW: Create system notification
export async function createNotification(
  type: string,
  title: string,
  message: string,
  userId?: string,
  data?: any
) {
  try {
    await prisma.systemNotification.create({
      data: {
        type,
        title,
        message,
        userId,
        data: data ? JSON.stringify(data) : null,
      }
    })
  } catch (error) {
    console.error('Failed to create notification:', error)
  }
}

// NEW: Get user notifications
export async function getUserNotifications(userId: string, limit = 10) {
  try {
    return await prisma.systemNotification.findMany({
      where: {
        OR: [
          { userId },
          { userId: null } // System-wide notifications
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  } catch (error) {
    console.error('Failed to get notifications:', error)
    return []
  }
}

// NEW: Mark notification as read
export async function markNotificationRead(notificationId: string, userId: string) {
  try {
    await prisma.systemNotification.updateMany({
      where: {
        id: notificationId,
        OR: [
          { userId },
          { userId: null }
        ]
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
  }
}

// NEW: Check if user is admin (helper for components)
export function isAdmin(user: any): boolean {
  return user?.role === 'ADMIN'
}

// NEW: Check if user is seller (helper for components)
export function isSeller(user: any): boolean {
  return user?.role === 'SELLER' || user?.role === 'ADMIN'
}