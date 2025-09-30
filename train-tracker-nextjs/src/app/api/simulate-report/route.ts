import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { pusherServer, PUSHER_CONFIG } from '@/lib/pusher-server'

// Default expiration time in minutes (configurable via env)
const TRAIN_CROSSING_EXPIRATION_MINUTES = parseInt(process.env.TRAIN_CROSSING_EXPIRATION_MINUTES || '10')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { isTrainCrossing, simulatedUser } = body

    if (typeof isTrainCrossing !== 'boolean') {
      return NextResponse.json(
        { error: 'isTrainCrossing must be a boolean' },
        { status: 400 }
      )
    }

    if (!simulatedUser || typeof simulatedUser !== 'string') {
      return NextResponse.json(
        { error: 'simulatedUser must be a string' },
        { status: 400 }
      )
    }

    // Generate a session ID that includes the simulated user
    const sessionId = `sim-${simulatedUser}-${Math.random().toString(36).substring(2, 15)}`

    // Calculate expiration time for train crossing reports
    const expiresAt = isTrainCrossing
      ? new Date(Date.now() + TRAIN_CROSSING_EXPIRATION_MINUTES * 60 * 1000)
      : null

    const newReport = await prisma.trainReport.create({
      data: {
        isTrainCrossing,
        expiresAt,
        userIpAddress: `127.0.0.1-${simulatedUser}`, // Simulated IP
        userAgent: `SimulatedUser/${simulatedUser}`,
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
      sessionId: newReport.sessionId,
      isSimulated: true
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
    console.error('Failed to create simulated train report:', error)
    return NextResponse.json(
      { error: 'Failed to create simulated train report' },
      { status: 500 }
    )
  }
}