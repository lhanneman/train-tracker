export interface TrainReport {
  id: number;
  isTrainCrossing: boolean;
  reportedAt: string; // ISO 8601 datetime string
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