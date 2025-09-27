import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const reports = await prisma.trainReport.findMany({
      orderBy: { reportedAt: 'desc' },
      take: 20 // Limit to most recent 20 reports
    })

    return NextResponse.json({
      data: reports.map(report => ({
        id: report.id,
        isTrainCrossing: report.isTrainCrossing,
        reportedAt: report.reportedAt.toISOString(),
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

    const newReport = await prisma.trainReport.create({
      data: {
        isTrainCrossing,
        userIpAddress,
        userAgent,
        sessionId
      }
    })

    return NextResponse.json({
      data: {
        id: newReport.id,
        isTrainCrossing: newReport.isTrainCrossing,
        reportedAt: newReport.reportedAt.toISOString(),
        userIpAddress: newReport.userIpAddress,
        userAgent: newReport.userAgent,
        sessionId: newReport.sessionId
      }
    })
  } catch (error) {
    console.error('Failed to create train report:', error)
    return NextResponse.json(
      { error: 'Failed to create train report' },
      { status: 500 }
    )
  }
}