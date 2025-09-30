import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { pusherServer, PUSHER_CONFIG } from '@/lib/pusher-server'
import { prisma } from '@/lib/prisma'

// Default expiration time in minutes (configurable via env)
const TRAIN_CROSSING_EXPIRATION_MINUTES = parseInt(process.env.TRAIN_CROSSING_EXPIRATION_MINUTES || '10');

export async function GET() {
  try {
    // Get current time for filtering expired reports
    const now = new Date();

    const reports = await prisma.trainReport.findMany({
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
      orderBy: { reportedAt: 'desc' },
      take: 20 // Limit to most recent 20 reports
    })

    return NextResponse.json({
      data: reports.map(report => ({
        id: report.id,
        isTrainCrossing: report.isTrainCrossing,
        reportedAt: report.reportedAt.toISOString(),
        expiresAt: report.expiresAt?.toISOString() || null,
        userIpAddress: report.userIpAddress,
        userAgent: report.userAgent,
        sessionId: report.sessionId
      }))
    })
  } catch (error) {
    console.error('Failed to fetch train reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch train reports' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || 'Unknown'
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const userIpAddress = forwardedFor?.split(',')[0] || realIp || 'Unknown'

    const body = await request.json()
    const { isTrainCrossing } = body

    if (typeof isTrainCrossing !== 'boolean') {
      return NextResponse.json(
        { error: 'isTrainCrossing must be a boolean' },
        { status: 400 }
      )
    }

    // Generate a simple session ID (in production, you might want to use a proper session management)
    const sessionId = Math.random().toString(36).substring(2, 15)

    // Calculate expiration time for train crossing reports
    const expiresAt = isTrainCrossing
      ? new Date(Date.now() + TRAIN_CROSSING_EXPIRATION_MINUTES * 60 * 1000)
      : null;

    const newReport = await prisma.trainReport.create({
      data: {
        isTrainCrossing,
        expiresAt,
        userIpAddress,
        userAgent,
        sessionId
      }
    })

    const reportData = {
      id: newReport.id,
      isTrainCrossing: newReport.isTrainCrossing,
      reportedAt: newReport.reportedAt.toISOString(),
      expiresAt: newReport.expiresAt?.toISOString() || null,
      userIpAddress: newReport.userIpAddress,
      userAgent: newReport.userAgent,
      sessionId: newReport.sessionId
    }

    // Broadcast the new report to all connected clients
    try {
      await pusherServer.trigger(
        PUSHER_CONFIG.channel,
        PUSHER_CONFIG.events.newReport,
        reportData
      )
    } catch (pusherError) {
      console.error('Failed to broadcast via Pusher:', pusherError)
      // Continue even if Pusher fails - don't break the API
    }

    return NextResponse.json({
      data: reportData
    })
  } catch (error) {
    console.error('Failed to create train report:', error)
    return NextResponse.json(
      { error: 'Failed to create train report' },
      { status: 500 }
    )
  }
}