import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { CROSSING_GEOFENCE_CONFIG } from '@/config/geofence-crossings'
import { isWithinReportingArea } from '@/lib/geofence-crossings-utils'
import { pusherServer } from '@/lib/pusher-server'
import { PUSHER_CONFIG } from '@/lib/pusher-config'
import { prisma } from '@/lib/prisma'
import { reportCooldownSeconds } from '@/lib/report-config'
import { getRecentReports, newestFirst, publicReport, publicReportFields, realReport, reportExpiry } from '@/lib/train-reports'

export async function GET() {
  try {
    return NextResponse.json({ data: (await getRecentReports(new Date())).map(publicReport) })
  } catch (error) {
    console.error('Failed to fetch train reports:', error)
    return NextResponse.json({ error: 'Failed to fetch train reports' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const isTrainCrossing = body?.isTrainCrossing
  if (typeof isTrainCrossing !== 'boolean') {
    return NextResponse.json({ error: 'Choose a report type.' }, { status: 400 })
  }

  const location = body?.location
  if (CROSSING_GEOFENCE_CONFIG.enforceGeofence && !isWithinReportingArea(location)) {
    return NextResponse.json({ error: 'Share an accurate location near either Waverly crossing.' }, { status: 400 })
  }

  try {
    const userIpAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip') || 'Unknown'

    const result = await prisma.$transaction(async db => {
      // Serialize the cooldown check and insert for each reporter across app instances.
      await db.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(624740, hashtext(${userIpAddress}))`
      const now = new Date()
      const lastReport = await db.trainReport.findFirst({
        where: { ...realReport, userIpAddress, reportedAt: { gt: new Date(now.getTime() - reportCooldownSeconds * 1000) } },
        orderBy: newestFirst,
        select: { reportedAt: true },
      })
      if (lastReport) {
        return { retryAfter: Math.ceil((lastReport.reportedAt.getTime() + reportCooldownSeconds * 1000 - now.getTime()) / 1000) }
      }

      const report = await db.trainReport.create({
        data: {
          isTrainCrossing,
          reportedAt: now,
          expiresAt: reportExpiry(isTrainCrossing, now),
          userIpAddress,
          userAgent: request.headers.get('user-agent') || 'Unknown',
          sessionId: randomUUID(),
        },
        select: publicReportFields,
      })
      return { report }
    }, { isolationLevel: 'ReadCommitted' })

    if (!result.report) {
      return NextResponse.json(
        { error: 'Please wait before submitting another report.' },
        { status: 429, headers: { 'Retry-After': String(result.retryAfter) } },
      )
    }

    try {
      await pusherServer?.trigger(PUSHER_CONFIG.channel, PUSHER_CONFIG.events.newReport, {})
    } catch (error) {
      console.error('Failed to notify subscribers:', error)
    }
    return NextResponse.json({ data: publicReport(result.report) })
  } catch (error) {
    console.error('Failed to create train report:', error)
    return NextResponse.json({ error: 'Failed to save your report. Please try again.' }, { status: 500 })
  }
}
