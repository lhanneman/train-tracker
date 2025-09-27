"use client"

import { useEffect, useState } from 'react';
import { TrainStatusButtons } from './train-status-buttons';
import { RecentReports } from './recent-reports';
import { StatusIndicator } from './status-indicator';
import { TrainIcon, ActivityIcon } from 'lucide-react';
import type { TrainReport } from '@/types';

export function TrainTracker() {
  const [latestReport, setLatestReport] = useState<TrainReport | null>(null);
  const [recentReports, setRecentReports] = useState<TrainReport[]>([]);
  const [connectionState, setConnectionState] = useState<'Connected' | 'Disconnected'>('Disconnected');

  // Load initial data
  const loadData = async () => {
    try {
      // Load train status and recent reports in parallel
      const [statusResult, reportsResult] = await Promise.all([
        fetch('/api/train-status'),
        fetch('/api/train-reports')
      ]);

      const statusData = await statusResult.json();
      const reportsData = await reportsResult.json();

      if (statusData.data?.lastReport) {
        setLatestReport(statusData.data.lastReport);
      }

      if (reportsData.data) {
        setRecentReports(reportsData.data);
      }

      setConnectionState('Connected');
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setConnectionState('Disconnected');
    }
  };

  // Handle new report submission
  const handleReportSubmitted = async (isTrainCrossing: boolean) => {
    try {
      const response = await fetch('/api/train-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isTrainCrossing }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      const result = await response.json();
      if (result.data) {
        // Update the latest report and add to recent reports
        setLatestReport(result.data);
        setRecentReports(prev => [result.data, ...prev].slice(0, 20));
      }
    } catch (error) {
      console.error('Failed to submit report:', error);
      throw error; // Re-throw so the component can handle it
    }
  };

  // Initialize and load data
  useEffect(() => {
    loadData();

    // Set up polling for updates every 30 seconds
    const interval = setInterval(loadData, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrainIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Train Tracker</h1>
                <p className="text-sm text-muted-foreground">Real-time crossing status</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ActivityIcon className={`h-4 w-4 ${connectionState === 'Connected' ? "text-green-600" : "text-muted-foreground"}`} />
              <span className="text-sm text-muted-foreground">
                {connectionState}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Status and Controls */}
          <div className="lg:col-span-2 space-y-6">
            <StatusIndicator status={latestReport?.isTrainCrossing ?? null} />
            <TrainStatusButtons
              onStatusReport={handleReportSubmitted}
            />
          </div>

          {/* Recent Reports */}
          <div className="lg:col-span-1">
            <RecentReports reports={recentReports} />
          </div>
        </div>
      </main>
    </div>
  );
}