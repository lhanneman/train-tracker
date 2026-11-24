import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateConsensusStatus } from '@/lib/consensus-utils'
import { consensusTimeWindowMinutes, reportCooldownSeconds } from '@/lib/report-config'
import { getRecentReports, publicReport, publicReportFields, realReport } from '@/lib/train-reports'
import type { TrackerSnapshot } from '@/types'

export async function GET() {
  try {
    const now = new Date()
    const windowMs = consensusTimeWindowMinutes * 60_000
    const [activeReports, recentReports] = await prisma.$transaction([
      prisma.trainReport.findMany({
        where: {
          ...realReport,
          reportedAt: { gt: new Date(now.getTime() - windowMs) },
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
        select: publicReportFields,
      }),
      getRecentReports(now),
    ], { isolationLevel: 'RepeatableRead' })

    const result = calculateConsensusStatus(activeReports, now, windowMs)
    const data: TrackerSnapshot = {
      area: {
        status: result.status,
        crossingReports: result.recentReports.crossing,
        nextUpdateAt: result.nextUpdateAt,
      },
      recentReports: recentReports.map(publicReport),
      reportCooldownSeconds,
    }

    return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Failed to fetch train status:', error)
    return NextResponse.json({ error: 'Failed to fetch train status' }, { status: 500 })
  }
}
