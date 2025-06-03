// src/app/api/health/route.ts
import { NextResponse } from 'next/server'
import { checkDatabaseHealth } from '@/lib/prisma'

export async function GET() {
  try {
    const dbHealth = await checkDatabaseHealth()
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbHealth,
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0'
    }
    
    if (dbHealth.status === 'unhealthy') {
      return NextResponse.json(health, { status: 503 })
    }
    
    return NextResponse.json(health)
    
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    )
  }
}