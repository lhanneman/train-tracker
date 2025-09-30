export interface TrainReport {
  id: number;
  isTrainCrossing: boolean;
  reportedAt: string; // ISO 8601 datetime string
  expiresAt: string | null; // ISO 8601 datetime string, null for "clear" reports
  userIpAddress: string;
  userAgent: string;
  sessionId: string;
}

export interface CreateTrainReportRequest {
  isTrainCrossing: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}