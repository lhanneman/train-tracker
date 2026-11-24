export interface TrainReport {
  id: number
  crossingId: string | null
  isTrainCrossing: boolean
  reportedAt: string
  expiresAt: string | null
}

export interface AreaStatus {
  status: boolean | null
  crossingReports: number
  nextUpdateAt: string | null
}

export interface TrackerSnapshot {
  area: AreaStatus
  recentReports: TrainReport[]
  reportCooldownSeconds: number
}
