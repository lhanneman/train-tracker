import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateConsensusStatus, getConsensusExplanation } from '@/lib/consensus-utils'

export async function GET() {
  try {
    const now = new Date()

    // Get all reports from the last 10 minutes (wider than consensus window for context)
    const recentReports = await prisma.trainReport.findMany({
      where: {
        reportedAt: {
          gte: new Date(now.getTime() - 10 * 60 * 1000) // Last 10 minutes
        }
      },
      orderBy: { reportedAt: 'desc' }
    })

    // Calculate consensus status
    const consensus = calculateConsensusStatus(recentReports)

    // Get the most recent report for additional context
    const latestReport = recentReports[0] || null

    return NextResponse.json({
      data: {
        status: consensus.status,
        confidence: consensus.confidence,
        explanation: getConsensusExplanation(consensus),
        recentReports: consensus.recentReports,
        lastReport: latestReport ? {
          id: latestReport.id,
          isTrainCrossing: latestReport.isTrainCrossing,
          reportedAt: latestReport.reportedAt.toISOString(),
          expiresAt: latestReport.expiresAt?.toISOString() || null,
          sessionId: latestReport.sessionId
        } : null
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