// Use Prisma types directly for server-side operations
type PrismaTrainReport = {
  id: number
  isTrainCrossing: boolean
  reportedAt: Date
  expiresAt: Date | null
  userIpAddress: string
  userAgent: string
  sessionId: string
}

// Time window for considering reports in consensus (configurable via env)
const CONSENSUS_TIME_WINDOW_MINUTES = parseInt(process.env.CONSENSUS_TIME_WINDOW_MINUTES || '5')

export interface ConsensusResult {
  status: boolean | null
  confidence: 'high' | 'medium' | 'low'
  recentReports: {
    crossing: number
    clear: number
    total: number
  }
}

/**
 * Safety-first majority consensus algorithm
 * - Any recent "crossing" reports keep status as "crossing" (safety-first)
 * - Only if ALL recent reports say "clear" do we return "clear"
 * - Returns null if no recent reports
 */
export function calculateConsensusStatus(reports: PrismaTrainReport[]): ConsensusResult {
  const now = new Date()
  const timeWindowMs = CONSENSUS_TIME_WINDOW_MINUTES * 60 * 1000
  const cutoffTime = new Date(now.getTime() - timeWindowMs)

  // Filter to recent, non-expired reports
  const recentReports = reports.filter(report => {
    const reportTime = report.reportedAt
    const isRecent = reportTime >= cutoffTime
    const isNotExpired = !report.expiresAt || report.expiresAt > now
    return isRecent && isNotExpired
  })

  const crossingReports = recentReports.filter(r => r.isTrainCrossing)
  const clearReports = recentReports.filter(r => !r.isTrainCrossing)

  const result = {
    recentReports: {
      crossing: crossingReports.length,
      clear: clearReports.length,
      total: recentReports.length
    }
  }

  // No recent reports
  if (recentReports.length === 0) {
    return {
      ...result,
      status: null,
      confidence: 'low'
    }
  }

  // Safety-first: ANY crossing reports = crossing status
  if (crossingReports.length > 0) {
    const confidence = crossingReports.length >= 2 ? 'high' :
                     crossingReports.length === 1 && clearReports.length === 0 ? 'medium' : 'low'

    return {
      ...result,
      status: true,
      confidence
    }
  }

  // Only clear reports exist
  if (clearReports.length > 0) {
    const confidence = clearReports.length >= 3 ? 'high' :
                      clearReports.length >= 2 ? 'medium' : 'low'

    return {
      ...result,
      status: false,
      confidence
    }
  }

  // Shouldn't reach here, but safety fallback
  return {
    ...result,
    status: null,
    confidence: 'low'
  }
}

/**
 * Get human-readable explanation of current consensus
 */
export function getConsensusExplanation(consensus: ConsensusResult): string {
  const { status, confidence, recentReports } = consensus

  if (status === null) {
    return "No recent reports available"
  }

  if (status === true) {
    return `Train crossing detected (${recentReports.crossing} crossing vs ${recentReports.clear} clear reports, ${confidence} confidence)`
  }

  return `Tracks clear (${recentReports.clear} clear reports, ${confidence} confidence)`
}