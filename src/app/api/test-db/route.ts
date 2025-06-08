// src/app/api/test-db/route.ts - Clean database test for TiDB
import { NextResponse } from 'next/server'
import { prisma, checkDatabaseHealth, executeWithRetry } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔍 Testing TiDB connection...')
    
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    
    console.log('✅ DATABASE_URL is configured')
    
    // Test basic connection
    const healthCheck = await checkDatabaseHealth()
    console.log('📊 Health check result:', healthCheck)
    
    if (healthCheck.status === 'unhealthy') {
      throw new Error(`Database health check failed: ${healthCheck.error}`)
    }
    
    // Test with retry mechanism
    const testQuery = await executeWithRetry(async () => {
      return await prisma.$queryRaw`SELECT 
        CONNECTION_ID() as connection_id,
        DATABASE() as current_database,
        USER() as current_user,
        @@version as mysql_version,
        NOW() as current_time`
    })
    
    console.log('🎯 Test query result:', testQuery)
    
    // Test table counts
    const tableCounts = await executeWithRetry(async () => {
      const [categoryCount, productCount, userCount] = await Promise.all([
        prisma.category.count().catch(() => 0),
        prisma.product.count().catch(() => 0),
        prisma.user.count().catch(() => 0)
      ])
      
      return {
        categories: categoryCount,
        products: productCount,
        users: userCount
      }
    })
    
    console.log('📊 Table counts:', tableCounts)
    
    const response = {
      success: true,
      message: 'TiDB connection successful',
      environment: {
        nodeEnv: process.env.NODE_ENV,
        platform: 'TiDB Cloud',
        databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing'
      },
      healthCheck,
      connectionTest: testQuery,
      tableCounts,
      timestamp: new Date().toISOString()
    }
    
    console.log('✅ TiDB test completed successfully')
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('❌ TiDB test failed:', error)
    
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error',
      environment: {
        nodeEnv: process.env.NODE_ENV,
        platform: 'TiDB Cloud',
        databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing'
      },
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}