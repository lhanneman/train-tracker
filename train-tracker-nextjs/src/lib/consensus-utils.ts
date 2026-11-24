type Observation = {
  isTrainCrossing: boolean
  reportedAt: Date
  expiresAt: Date | null
}

export function calculateConsensusStatus(reports: Observation[], now: Date, windowMs: number) {
  let crossing = 0
  let clear = 0
  let nextUpdateAt = Infinity

  for (const report of reports) {
    const reportedAt = report.reportedAt.getTime()
    const validUntil = Math.min(reportedAt + windowMs, report.expiresAt?.getTime() ?? Infinity)
    if (reportedAt > now.getTime() || validUntil <= now.getTime()) continue

    if (report.isTrainCrossing) crossing++
    else clear++
    nextUpdateAt = Math.min(nextUpdateAt, validUntil)
  }

  return {
    status: crossing > 0 ? true : clear > 0 ? false : null,
    confidence: crossing >= 2 || (crossing === 0 && clear >= 3) ? 'high'
      : (crossing === 1 && clear === 0) || (crossing === 0 && clear === 2) ? 'medium' : 'low',
    recentReports: { crossing, clear, total: crossing + clear },
    nextUpdateAt: Number.isFinite(nextUpdateAt) ? new Date(nextUpdateAt).toISOString() : null,
  }
}
