import { NextResponse } from 'next/server'
import { consensusTimeWindowMinutes, reportCooldownSeconds, trainCrossingExpirationMinutes } from '@/lib/report-config'

export function GET() {
  return NextResponse.json({ data: { consensusTimeWindowMinutes, reportCooldownSeconds, trainCrossingExpirationMinutes } })
}
