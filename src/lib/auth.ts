// src/lib/auth.ts - Fixed version with proper type handling
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

  // Only update lastLoginAt if the field exists in the schema
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { 
        updatedAt: new Date() // Use updatedAt instead of lastLoginAt for now
      }
    })
  } catch (error) {
    // Silent fail if field doesn't exist yet
    console.warn('Could not update lastLoginAt:', error)
  }

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

// Fixed getCurrentUser with only existing fields
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
      updatedAt: true,
      password: true, // Include if needed for auth checks
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
    // Legacy fields for backward compatibility - use safe defaults
    banned: false, // Default to false since isActive doesn't exist yet
    locked: false, // Default to false since isActive doesn't exist yet
    lastActiveAt: user.updatedAt, // Use updatedAt as substitute
    isActive: true, // Default to true since field doesn't exist yet
    lastLoginAt: user.updatedAt, // Use updatedAt as substitute
    phone: null, // Default since field doesn't exist yet
  }
}

// Enhanced middleware helper with activity tracking
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
  if (user.role !== 'ADMIN' && user.role !== 'SELLER') {
    throw new Error('Seller permissions required')
  }
  return user
}

// Simplified admin action logging - will work after schema update
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
    // Temporarily log to console until AdminLog model is available
    console.log('Admin Action:', {
      adminId,
      action,
      entityType,
      entityId,
      timestamp: new Date().toISOString()
    })
    
    // Uncomment when AdminLog model is added to schema:
    /*
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
    */
  } catch (error) {
    console.error('Failed to log admin action:', error)
  }
}

// Helper to get client IP
function getClientIP(req: Request): string | null {
  const forwarded = req.headers.get('x-forwarded-for')
  const realIP = req.headers.get('x-real-ip')
  const cfConnectingIP = req.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  return realIP || cfConnectingIP || null
}

// Simplified notification creation - will work after schema update
export async function createNotification(
  type: string,
  title: string,
  message: string,
  userId?: string,
  data?: any
) {
  try {
    // Temporarily log to console until SystemNotification model is available
    console.log('System Notification:', {
      type,
      title,
      message,
      userId,
      timestamp: new Date().toISOString()
    })
    
    // Uncomment when SystemNotification model is added to schema:
    /*
    await prisma.systemNotification.create({
      data: {
        type,
        title,
        message,
        userId,
        data: data ? JSON.stringify(data) : null,
      }
    })
    */
  } catch (error) {
    console.error('Failed to create notification:', error)
  }
}