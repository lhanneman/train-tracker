import { useEffect, useState } from 'react';
import { TrainStatusButtons } from './components/train-status-buttons';
import { RecentReports } from './components/recent-reports';
import { StatusIndicator } from './components/status-indicator';
import { TrainIcon, ActivityIcon } from 'lucide-react';
import type { TrainReport } from './types';
import { ConnectionState } from './types';
import { TrainReportsApi } from './services/api';
import signalRService from './services/signalr';

function App() {
  const [latestReport, setLatestReport] = useState<TrainReport | null>(null);
  const [recentReports, setRecentReports] = useState<TrainReport[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);

  // Load initial data
  const loadData = async () => {
    try {
      // Load latest report and recent reports in parallel
      const [latestResult, recentResult] = await Promise.all([
        TrainReportsApi.getLatestReport(),
        TrainReportsApi.getRecentReports()
      ]);

      if (latestResult.data) {
        setLatestReport(latestResult.data);
      }

      if (recentResult.data) {
        setRecentReports(recentResult.data);
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  // Handle new report submission
  const handleReportSubmitted = async (isTrainCrossing: boolean) => {
    try {
      const result = await TrainReportsApi.createReport({ isTrainCrossing });
      if (result.data) {
        // Reload data after a successful report submission
        await loadData();
      }
    } catch (error) {
      console.error('Failed to submit report:', error);
      throw error; // Re-throw so the component can handle it
    }
  };

  // Handle real-time updates
  const handleNewTrainReport = (newReport: TrainReport) => {
    console.log('Received new train report:', newReport);

    // Update latest report
    setLatestReport(newReport);

    // Add to recent reports (prepend and limit to 50)
    setRecentReports(prev => [newReport, ...prev].slice(0, 50));
  };

  // Initialize SignalR and load data
  useEffect(() => {
    let isCleanedUp = false;

    const initializeApp = async () => {
      try {
        // Load initial data
        await loadData();

        // Set up SignalR connection
        const unsubscribeConnectionState = signalRService.onConnectionStateChange(setConnectionState);
        const unsubscribeNewReport = signalRService.onNewTrainReport(handleNewTrainReport);

        // Start SignalR connection only if not cleaned up
        if (!isCleanedUp) {
          await signalRService.start();
        }

        // Return cleanup function
        return () => {
          unsubscribeConnectionState();
          unsubscribeNewReport();
          signalRService.stop();
        };
      } catch (error) {
        console.error('Failed to initialize app:', error);
        return null;
      }
    };

    const cleanupPromise = initializeApp();

    return () => {
      isCleanedUp = true;
      cleanupPromise.then(cleanupFn => cleanupFn?.());
    };
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
              <ActivityIcon className={`h-4 w-4 ${connectionState === ConnectionState.Connected ? "text-success" : "text-muted-foreground"}`} />
              <span className="text-sm text-muted-foreground">
                {connectionState === ConnectionState.Connected ? "Connected" :
                 connectionState === ConnectionState.Connecting ? "Connecting..." :
                 connectionState === ConnectionState.Reconnecting ? "Reconnecting..." : "Disconnected"}
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

export default App;