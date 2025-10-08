"use client"

import { useEffect, useState } from 'react';
import { TrainStatusButtons } from './train-status-buttons';
import { RecentReports } from './recent-reports';
import { StatusIndicator } from './status-indicator';
import { TrainIcon, MapPinIcon } from 'lucide-react';
import type { TrainReport } from '@/types';
import type { LocationData } from '@/hooks/useLocationPermission';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { pusherClient, PUSHER_CONFIG } from '@/lib/pusher-client';
import { validateGeofence } from '@/lib/geofence-utils';

// Helper function to format time ago
function getTimeAgo(date: Date | null): string {
  if (!date) return 'Never';

  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 120) return '1m ago';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 7200) return '1h ago';
  return `${Math.floor(seconds / 3600)}h ago`;
}

export function TrainTracker() {
  const [latestReport, setLatestReport] = useState<TrainReport | null>(null);
  const [recentReports, setRecentReports] = useState<TrainReport[]>([]);
  const [connectionState, setConnectionState] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [timeAgo, setTimeAgo] = useState<string>('Never');
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null);
  const [crossingReportCount, setCrossingReportCount] = useState<number>(0);

  // Location permission and geo-fence status
  const { permissionState, geofenceStatus, getCurrentLocation, locationData } = useLocationPermission();

  // Calculate crossing report count for current instance
  useEffect(() => {
    if (!latestReport?.isTrainCrossing) {
      setCrossingReportCount(0);
      return;
    }

    // Find all consecutive "crossing" reports since the last "clear" report
    let count = 0;
    for (const report of recentReports) {
      if (report.isTrainCrossing) {
        count++;
      } else {
        // Hit a "clear" report, stop counting
        break;
      }
    }

    setCrossingReportCount(count);
  }, [latestReport, recentReports]);

  // Update time ago display every 10 seconds
  useEffect(() => {
    const updateTimeAgo = () => {
      setTimeAgo(getTimeAgo(lastUpdated));
    };

    updateTimeAgo(); // Initial update
    const interval = setInterval(updateTimeAgo, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [lastUpdated]);


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

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  // Handle new report submission with location data
  const handleReportSubmitted = async (isTrainCrossing: boolean, location?: LocationData) => {
    try {
      const response = await fetch('/api/train-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isTrainCrossing,
          location: location ? {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy
          } : undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      // Don't update state here - let Pusher handle it to avoid duplicates
      // The server will broadcast via Pusher and we'll receive it in the channel.bind handler
    } catch (error) {
      console.error('Failed to submit report:', error);
      throw error; // Re-throw so the component can handle it
    }
  };

  // Auto-expiration timer for train crossing reports
  useEffect(() => {
    if (latestReport?.isTrainCrossing && latestReport.expiresAt) {
      const updateTimer = () => {
        const expiresAt = new Date(latestReport.expiresAt!);
        const now = new Date();
        const msUntilExpiry = expiresAt.getTime() - now.getTime();

        if (msUntilExpiry > 0) {
          setTimeUntilExpiry(Math.floor(msUntilExpiry / 1000)); // Convert to seconds

          // Set timer to clear the status when it expires
          const expirationTimer = setTimeout(() => {
            console.log('Train crossing status expired');
            setLatestReport(null);
            setTimeUntilExpiry(null);
          }, msUntilExpiry);

          return () => clearTimeout(expirationTimer);
        } else {
          // Already expired
          setLatestReport(null);
          setTimeUntilExpiry(null);
        }
      };

      updateTimer();

      // Update countdown every second
      const countdownInterval = setInterval(() => {
        if (latestReport?.expiresAt) {
          const expiresAt = new Date(latestReport.expiresAt);
          const now = new Date();
          const msUntilExpiry = expiresAt.getTime() - now.getTime();

          if (msUntilExpiry > 0) {
            setTimeUntilExpiry(Math.floor(msUntilExpiry / 1000));
          } else {
            setTimeUntilExpiry(null);
          }
        }
      }, 1000);

      return () => clearInterval(countdownInterval);
    } else {
      setTimeUntilExpiry(null);
    }
  }, [latestReport]);

  // Initialize and load data
  useEffect(() => {
    loadData();

    // Set up Pusher real-time subscription (this initializes Pusher)
    const channel = pusherClient.subscribe(PUSHER_CONFIG.channel);

    // Now get the instance and set up connection state monitoring
    const pusher = pusherClient.getInstance();

    if (pusher) {
      // Set initial state based on current connection
      const currentState = pusher.connection.state;

      if (currentState === 'connected') {
        setConnectionState('connected');
      } else if (currentState === 'disconnected' || currentState === 'failed' || currentState === 'unavailable') {
        setConnectionState('disconnected');
      } else {
        setConnectionState('connecting');
      }

      // Bind to state change events
      pusher.connection.bind('connected', () => {
        setConnectionState('connected');
      });

      pusher.connection.bind('disconnected', () => {
        setConnectionState('disconnected');
      });

      pusher.connection.bind('connecting', () => {
        setConnectionState('connecting');
      });

      pusher.connection.bind('unavailable', () => {
        setConnectionState('disconnected');
      });

      pusher.connection.bind('failed', () => {
        setConnectionState('disconnected');
      });
    }

    channel.bind(PUSHER_CONFIG.events.newReport, (newReport: TrainReport) => {
      console.log('Received new train report via Pusher:', newReport);

      // Update latest report
      setLatestReport(newReport);

      // Add to recent reports (prepend and limit to 20)
      setRecentReports(prev => [newReport, ...prev].slice(0, 20));

      // Update last updated timestamp
      setLastUpdated(new Date());
    });

    // Set up polling as fallback every 60 seconds (less frequent since we have real-time)
    const interval = setInterval(loadData, 60000);

    return () => {
      clearInterval(interval);
      channel.unbind_all();
      pusherClient.unsubscribe(PUSHER_CONFIG.channel);

      // Cleanup Pusher connection state listeners
      if (pusher) {
        pusher.connection.unbind('connected');
        pusher.connection.unbind('disconnected');
        pusher.connection.unbind('connecting');
        pusher.connection.unbind('unavailable');
        pusher.connection.unbind('failed');
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          {/* Mobile: Stack elements vertically, Desktop: Side by side */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <TrainIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-foreground">Train Tracker</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Real-time crossing status</p>
              </div>
            </div>

            {/* Status Indicators - Mobile: Horizontal scroll if needed, Desktop: Normal flex */}
            <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto">
              {/* Connection Status & Last Updated */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <div className={`h-2 w-2 rounded-full ${
                  connectionState === 'connected' ? 'bg-green-500' :
                  connectionState === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                  'bg-red-500'
                }`} />
                <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                  {timeAgo}
                </span>
              </div>

              {/* Geo-fence Status */}
              {permissionState === 'granted' && (
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <MapPinIcon className={`h-3.5 sm:h-4 w-3.5 sm:w-4 ${
                    geofenceStatus?.isValid ? 'text-green-600' : 'text-orange-500'
                  }`} />
                  <span className={`text-xs sm:text-sm font-medium whitespace-nowrap ${
                    geofenceStatus?.isValid ? 'text-green-700 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                  }`}>
                    {geofenceStatus?.isValid ? 'In Range' : 'Out of Range'}
                  </span>
                </div>
              )}

              {/* Location Permission Status */}
              {permissionState !== 'granted' && permissionState !== 'unsupported' && (
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <MapPinIcon className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-yellow-600" />
                  <span className="text-xs sm:text-sm font-medium text-yellow-600 dark:text-yellow-400 whitespace-nowrap">
                    Location Needed
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Status and Controls */}
          <div className="lg:col-span-2 space-y-6">
            <StatusIndicator
              status={latestReport?.isTrainCrossing ?? null}
              timeUntilExpiry={timeUntilExpiry}
              reportCount={crossingReportCount}
            />
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