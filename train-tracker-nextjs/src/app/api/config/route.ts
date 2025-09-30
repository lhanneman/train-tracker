import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      data: {
        consensusTimeWindowMinutes: parseInt(process.env.CONSENSUS_TIME_WINDOW_MINUTES || '5'),
        trainCrossingExpirationMinutes: parseInt(process.env.TRAIN_CROSSING_EXPIRATION_MINUTES || '10'),
        reportCooldownSeconds: parseInt(process.env.REPORT_COOLDOWN_SECONDS || '15')
      }
    })
  } catch (error) {
    console.error('Failed to fetch config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch config' },
      { status: 500 }
    )
  }
}