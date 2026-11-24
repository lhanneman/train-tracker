import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { calculateConsensusStatus } from '@/lib/consensus-utils'
import { localSimulatorEnabled } from '@/lib/local-simulator'
import { prisma } from '@/lib/prisma'
import { consensusTimeWindowMinutes } from '@/lib/report-config'
import { publicReportFields, reportExpiry, simulatedReport } from '@/lib/train-reports'

export async function GET() {
  if (!localSimulatorEnabled()) return new NextResponse(null, { status: 404 })
  const now = new Date()
  const windowMs = consensusTimeWindowMinutes * 60_000
  const reports = await prisma.trainReport.findMany({
    where: { ...simulatedReport, reportedAt: { gt: new Date(now.getTime() - windowMs) } },
    select: publicReportFields,
  })
  return NextResponse.json({ data: calculateConsensusStatus(reports, now, windowMs) })
}

export async function POST(request: NextRequest) {
  if (!localSimulatorEnabled()) return new NextResponse(null, { status: 404 })
  const body = await request.json().catch(() => null)
  if (typeof body?.isTrainCrossing !== 'boolean' || typeof body?.simulatedUser !== 'string'
    || !body.simulatedUser.trim()) {
    return NextResponse.json({ error: 'Choose a report type and simulated user.' }, { status: 400 })
  }

  const now = new Date()
  await prisma.trainReport.create({
    data: {
      isTrainCrossing: body.isTrainCrossing,
      reportedAt: now,
      expiresAt: reportExpiry(body.isTrainCrossing, now),
      userIpAddress: '127.0.0.1',
      userAgent: 'Local simulator',
      sessionId: `sim-${randomUUID()}`,
    },
  })
  return new NextResponse(null, { status: 204 })
}
