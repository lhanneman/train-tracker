import axios from 'axios';
import { TrainReport, CreateTrainReportRequest, ApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:5073/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for session tracking
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export class TrainReportsApi {
  // Submit a new train report
  static async createReport(request: CreateTrainReportRequest): Promise<ApiResponse<TrainReport>> {
    try {
      const response = await apiClient.post<TrainReport>('/trainreports', request);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Failed to create report' };
    }
  }

  // Get recent train reports (last 24 hours)
  static async getRecentReports(): Promise<ApiResponse<TrainReport[]>> {
    try {
      const response = await apiClient.get<TrainReport[]>('/trainreports/recent');
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Failed to fetch recent reports' };
    }
  }

  // Get the latest train report
  static async getLatestReport(): Promise<ApiResponse<TrainReport>> {
    try {
      const response = await apiClient.get<TrainReport>('/trainreports/latest');
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Failed to fetch latest report' };
    }
  }

  // Get a specific train report by ID
  static async getReport(id: number): Promise<ApiResponse<TrainReport>> {
    try {
      const response = await apiClient.get<TrainReport>(`/trainreports/${id}`);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Failed to fetch report' };
    }
  }
}

export default TrainReportsApi;