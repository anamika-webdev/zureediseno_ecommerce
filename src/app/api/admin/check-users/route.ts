// src/app/api/admin/check-users/route.ts - Quick Admin User Checker
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    // Check for admin users
    const adminUsers = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN']
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        password: true // Include to check if password exists
      }
    });

    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        password: true
      }
    });

    return NextResponse.json({
      success: true,
      adminUsers: adminUsers.map(user => ({
        ...user,
        hasPassword: !!user.password,
        password: undefined // Don't return actual password
      })),
      totalUsers: allUsers.length,
      usersWithPasswords: allUsers.filter(u => u.password).length,
      allUserRoles: allUsers.map(u => ({ email: u.email, role: u.role, hasPassword: !!u.password }))
    });

  } catch (error) {
    console.error('Error checking users:', error);
    return NextResponse.json(
      { error: 'Failed to check users' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Create a test admin user
    const testEmail = 'admin@test.com';
    const testPassword = 'admin123';

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail }
    });

    if (existingUser) {
      // Update existing user to admin
      const hashedPassword = await hashPassword(testPassword);
      const updatedUser = await prisma.user.update({
        where: { email: testEmail },
        data: {
          role: 'ADMIN',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User'
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Updated existing user to admin',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role
        }
      });
    } else {
      // Create new admin user
      const hashedPassword = await hashPassword(testPassword);
      const newUser = await prisma.user.create({
        data: {
          email: testEmail,
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN'
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Created new admin user',
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role
        },
        credentials: {
          email: testEmail,
          password: testPassword
        }
      });
    }

  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    );
  }
}