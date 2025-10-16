// src/app/api/debug/custom-designs/route.ts
// Create this file to test and diagnose the issue
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    tests: {},
    summary: '',
  };

  try {
    // Test 1: Check authentication
    console.log('🔍 Test 1: Checking authentication...');
    let currentUser;
    try {
      currentUser = await getCurrentUser();
      diagnostics.tests.authentication = {
        status: currentUser ? 'PASS' : 'FAIL',
        user: currentUser ? {
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.role,
        } : null,
        message: currentUser ? 'User authenticated successfully' : 'No user found - not logged in',
      };
    } catch (error) {
      diagnostics.tests.authentication = {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Error during authentication check',
      };
    }

    // Test 2: Check database connection
    console.log('🔍 Test 2: Checking database connection...');
    try {
      await prisma.$queryRaw`SELECT 1`;
      diagnostics.tests.database = {
        status: 'PASS',
        message: 'Database connection successful',
      };
    } catch (error) {
      diagnostics.tests.database = {
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Database connection failed',
      };
    }

    // Test 3: Check if CustomDesignRequest table exists
    console.log('🔍 Test 3: Checking CustomDesignRequest table...');
    try {
      const count = await prisma.customDesignRequest.count();
      diagnostics.tests.tableExists = {
        status: 'PASS',
        count: count,
        message: `CustomDesignRequest table exists with ${count} records`,
      };
    } catch (error) {
      diagnostics.tests.tableExists = {
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'CustomDesignRequest table may not exist or is inaccessible',
      };
    }

    // Test 4: Fetch sample requests (without filters)
    console.log('🔍 Test 4: Fetching sample requests...');
    try {
      const sampleRequests = await prisma.customDesignRequest.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      diagnostics.tests.fetchRequests = {
        status: 'PASS',
        count: sampleRequests.length,
        samples: sampleRequests.map(req => ({
          id: req.id,
          customerName: req.customerName,
          phoneNumber: req.phoneNumber,
          status: req.status,
          userType: req.userId ? 'logged' : 'guest',
          createdAt: req.createdAt,
        })),
        message: `Successfully fetched ${sampleRequests.length} sample requests`,
      };
    } catch (error) {
      diagnostics.tests.fetchRequests = {
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to fetch requests',
      };
    }

    // Test 5: Check user authorization
    console.log('🔍 Test 5: Checking user authorization...');
    if (currentUser) {
      const isAuthorized = currentUser.role === 'ADMIN' || currentUser.role === 'SELLER';
      diagnostics.tests.authorization = {
        status: isAuthorized ? 'PASS' : 'FAIL',
        userRole: currentUser.role,
        requiredRoles: ['ADMIN', 'SELLER'],
        message: isAuthorized 
          ? `User has ${currentUser.role} role - authorized to view custom designs`
          : `User has ${currentUser.role} role - NOT authorized (requires ADMIN or SELLER)`,
      };
    } else {
      diagnostics.tests.authorization = {
        status: 'FAIL',
        message: 'Cannot check authorization - user not authenticated',
      };
    }

    // Test 6: Check environment variables
    console.log('🔍 Test 6: Checking environment variables...');
    diagnostics.tests.environment = {
      status: 'INFO',
      variables: {
        DATABASE_URL: process.env.DATABASE_URL ? '✅ Set' : '❌ Not set',
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ? '✅ Set' : '❌ Not set',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Not set',
      },
    };

    // Generate summary
    const passCount = Object.values(diagnostics.tests).filter((t: any) => t.status === 'PASS').length;
    const failCount = Object.values(diagnostics.tests).filter((t: any) => t.status === 'FAIL').length;
    const errorCount = Object.values(diagnostics.tests).filter((t: any) => t.status === 'ERROR').length;

    diagnostics.summary = `
Diagnostic Results:
✅ Passed: ${passCount}
❌ Failed: ${failCount}
⚠️ Errors: ${errorCount}

${failCount === 0 && errorCount === 0 
  ? '🎉 All tests passed! Custom designs should be visible in the admin portal.'
  : '⚠️ Some issues detected. Review the test results above.'}

Common Issues:
1. If authentication fails: Make sure you're logged in as ADMIN or SELLER
2. If table doesn't exist: Run 'npx prisma db push' to sync your database
3. If no records found: Create a test custom design request from the frontend
4. If authorization fails: Check your user role in the database
`;

    return NextResponse.json(diagnostics, { status: 200 });

  } catch (error) {
    console.error('❌ Diagnostic error:', error);
    diagnostics.tests.overall = {
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    return NextResponse.json(diagnostics, { status: 500 });
  }
}

// Helper endpoint to create a test request
export async function POST(req: NextRequest) {
  try {
    const testRequest = await prisma.customDesignRequest.create({
      data: {
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        phoneNumber: '+91-9999999999',
        designDescription: 'This is a test custom design request created by the diagnostic API',
        colorDescription: 'Blue and White',
        fabricPreference: 'Cotton',
        status: 'pending',
        priority: 'normal',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Test custom design request created successfully',
      request: testRequest,
    });
  } catch (error) {
    console.error('❌ Error creating test request:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create test request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}