import { prisma } from '@/lib/prisma'
import { trainCrossingExpirationMinutes } from '@/lib/report-config'
import type { Prisma } from '@prisma/client'
import type { TrainReport } from '@/types'

export const publicReportFields = {
  id: true,
  crossingId: true,
  isTrainCrossing: true,
  reportedAt: true,
  expiresAt: true,
} satisfies Prisma.TrainReportSelect

export const simulatedReport = { sessionId: { startsWith: 'sim-' } } satisfies Prisma.TrainReportWhereInput
export const realReport = { NOT: simulatedReport } satisfies Prisma.TrainReportWhereInput
export const newestFirst = [{ reportedAt: 'desc' }, { id: 'desc' }] satisfies Prisma.TrainReportOrderByWithRelationInput[]

export function publicReport(report: Prisma.TrainReportGetPayload<{ select: typeof publicReportFields }>): TrainReport {
  return {
    ...report,
    reportedAt: report.reportedAt.toISOString(),
    expiresAt: report.expiresAt?.toISOString() ?? null,
  }
}

export function getRecentReports(now: Date) {
  return prisma.trainReport.findMany({
    where: { ...realReport, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
    select: publicReportFields,
    orderBy: newestFirst,
    take: 20,
  })
}

export function reportExpiry(isTrainCrossing: boolean, now: Date) {
  return isTrainCrossing ? new Date(now.getTime() + trainCrossingExpirationMinutes * 60_000) : null
}
