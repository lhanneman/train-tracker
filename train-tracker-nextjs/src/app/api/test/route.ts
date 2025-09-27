import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Test database connection by counting records
    const count = await prisma.trainReport.count()

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      recordCount: count
    })
  } catch (error) {
    console.error('Database connection error:', error)

    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}