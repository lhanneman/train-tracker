import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date();

    // Get the latest valid report (not expired)
    const latestReport = await prisma.trainReport.findFirst({
      where: {
        OR: [
          { isTrainCrossing: false }, // All clear reports are always valid
          {
            AND: [
              { isTrainCrossing: true },
              {
                OR: [
                  { expiresAt: null }, // Old reports without expiration
                  { expiresAt: { gt: now } } // Not expired yet
                ]
              }
            ]
          }
        ]
      },
      orderBy: { reportedAt: 'desc' }
    })

    if (!latestReport) {
      return NextResponse.json({
        data: { status: null }
      })
    }

    return NextResponse.json({
      data: {
        status: latestReport.isTrainCrossing,
        lastReport: {
          id: latestReport.id,
          isTrainCrossing: latestReport.isTrainCrossing,
          reportedAt: latestReport.reportedAt.toISOString(),
          expiresAt: latestReport.expiresAt?.toISOString() || null,
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