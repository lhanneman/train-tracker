import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json({ success: false, error: 'Database connection failed' }, { status: 500 })
  }
}
