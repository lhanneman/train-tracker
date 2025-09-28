import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const latestReport = await prisma.trainReport.findFirst({
      orderBy: { reportedAt: 'desc' }
    })

    if (!latestReport) {
      return NextResponse.json({
        data: { status: null }
      })
    }

    // Consider reports older than 30 minutes as stale
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
    const isStale = latestReport.reportedAt < thirtyMinutesAgo

    return NextResponse.json({
      data: {
        status: isStale ? null : latestReport.isTrainCrossing,
        lastReport: {
          id: latestReport.id,
          isTrainCrossing: latestReport.isTrainCrossing,
          reportedAt: latestReport.reportedAt.toISOString(),
          sessionId: latestReport.sessionId
        }
      }
    })
  } catch (error) {
    console.error('Failed to fetch train status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch train status' },
      { status: 500 }
    )
  }
}