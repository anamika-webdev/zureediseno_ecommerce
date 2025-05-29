// src/app/api/debug/schema/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get a sample category to see what fields exist
    const sampleCategory = await prisma.category.findFirst()
    
    // Get the raw table structure using raw query
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'Category'
      ORDER BY ordinal_position;
    `
    
    return NextResponse.json({
      sampleCategory,
      tableStructure: tableInfo,
      message: "This will show you exactly what fields your Category table has"
    })
  } catch (error) {
    console.error('Error checking schema:', error)
    return NextResponse.json({ 
      error: error.message,
      note: "Create this route temporarily to debug your schema"
    })
  }
}