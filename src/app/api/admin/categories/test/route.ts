// src/app/api/admin/categories/test/route.ts - Quick Categories API Test
import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🧪 Testing categories API...');
    
    // Test admin auth
    const user = await getCurrentAdmin();
    console.log('👤 Admin user:', user ? `${user.email} (${user.role})` : 'Not authenticated');
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
        step: 'admin_auth_failed'
      });
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({
        success: false,
        error: 'Not admin role',
        userRole: user.role,
        step: 'admin_role_check_failed'
      });
    }

    // Test database connection
    const categoryCount = await prisma.category.count();
    console.log('📊 Total categories in database:', categoryCount);

    // Test category fetch
    const categories = await prisma.category.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });
    console.log('📋 Sample categories:', categories.length);

    return NextResponse.json({
      success: true,
      message: 'Categories API test successful',
      auth: {
        authenticated: true,
        user: {
          email: user.email,
          role: user.role,
          name: user.name
        }
      },
      database: {
        connected: true,
        totalCategories: categoryCount,
        sampleCategories: categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          image: cat.image ? 'Has image' : 'No image'
        }))
      },
      apiEndpoint: '/api/admin/categories',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('🔥 Categories API test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      step: 'database_or_general_error'
    }, { status: 500 });
  }
}