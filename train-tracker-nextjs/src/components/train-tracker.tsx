"use client"

import { useEffect, useState } from 'react';
import { TrainStatusButtons } from './train-status-buttons';
import { RecentReports } from './recent-reports';
import { StatusIndicator } from './status-indicator';
import { TrainIcon, ActivityIcon, MapPinIcon } from 'lucide-react';
import type { TrainReport } from '@/types';
import type { LocationData } from '@/hooks/useLocationPermission';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { pusherClient, PUSHER_CONFIG } from '@/lib/pusher-client';
import { validateGeofence } from '@/lib/geofence-utils';

export function TrainTracker() {
  const [latestReport, setLatestReport] = useState<TrainReport | null>(null);
  const [recentReports, setRecentReports] = useState<TrainReport[]>([]);
  const [connectionState, setConnectionState] = useState<'Connected' | 'Disconnected'>('Disconnected');

  // Location permission and geo-fence status
  const { permissionState, geofenceStatus, getCurrentLocation, locationData } = useLocationPermission();

  // Expose test functions to browser console for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as unknown as { testGeofence: (lat: number, lng: number, accuracy?: number) => unknown }).testGeofence = (lat: number, lng: number, accuracy = 50) => {
        const result = validateGeofence(lat, lng, accuracy);
        console.log(`Testing coordinates: ${lat}, ${lng}`);
        console.log('Result:', result);
        return result;
      };

      (window as unknown as { debugGeofence: () => void }).debugGeofence = () => {
        console.log('=== Geo-fence Debug Info ===');
        console.log('Permission state:', permissionState);
        console.log('Location data:', locationData);
        console.log('Geofence status:', geofenceStatus);
        console.log('Test coordinates for your house center: testGeofence(40.9241, -96.5267)');
        console.log('Test coordinates for train tracks center: testGeofence(40.9181, -96.5314)');
      };

      (window as unknown as { getMyLocation: () => Promise<unknown> }).getMyLocation = async () => {
        console.log('🌍 Getting your current location...');
        const location = await getCurrentLocation();
        console.log('Your location:', location);
        return location;
      };

      (window as unknown as { forceLocation: () => void }).forceLocation = () => {
        console.log('🔧 Forcing location with high accuracy...');
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('✅ Success! Your coordinates:');
              console.log(`Latitude: ${position.coords.latitude}`);
              console.log(`Longitude: ${position.coords.longitude}`);
              console.log(`Accuracy: ${position.coords.accuracy}m`);

              // Also test geo-fence with these coordinates
              const result = validateGeofence(position.coords.latitude, position.coords.longitude, position.coords.accuracy);
              console.log('🎯 Geo-fence test result:', result);
            },
            (error) => {
              console.error('❌ Location error:', error.message);
              console.log('Try enabling location services or going outside for better GPS signal');
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 0
            }
          );
        }
      };

      console.log('🔧 Geo-fence test functions loaded:');
      console.log('- testGeofence(lat, lng) - Test specific coordinates');
      console.log('- debugGeofence() - Show current status');
      console.log('- getMyLocation() - Manually get your GPS location');
      console.log('- forceLocation() - Force GPS with high accuracy');
    }
  }, [permissionState, geofenceStatus, getCurrentLocation, locationData]);

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

    // Set up Pusher real-time subscription
    const channel = pusherClient.subscribe(PUSHER_CONFIG.channel);

    channel.bind(PUSHER_CONFIG.events.newReport, (newReport: TrainReport) => {
      console.log('Received new train report via Pusher:', newReport);

      // Update latest report
      setLatestReport(newReport);

      // Add to recent reports (prepend and limit to 20)
      setRecentReports(prev => [newReport, ...prev].slice(0, 20));

      // Update connection state to show we're receiving real-time data
      setConnectionState('Connected');
    });

    // Set up polling as fallback every 60 seconds (less frequent since we have real-time)
    const interval = setInterval(loadData, 60000);

    return () => {
      clearInterval(interval);
      channel.unbind_all();
      pusherClient.unsubscribe(PUSHER_CONFIG.channel);
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
              {/* Connection Status */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <ActivityIcon className={`h-3.5 sm:h-4 w-3.5 sm:w-4 ${connectionState === 'Connected' ? "text-green-600" : "text-muted-foreground"}`} />
                <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                  {connectionState}
                </span>
              </div>

              {/* Geo-fence Status */}
              {permissionState === 'granted' && (
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <div className={`h-2 w-2 rounded-full ${
                    geofenceStatus?.isValid ? 'bg-green-500' : 'bg-orange-500'
                  }`} />
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
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
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