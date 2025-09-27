import React, { useEffect, useState } from 'react';
import TrainCrossingStatus from './components/TrainCrossingStatus';
import ReportButtons from './components/ReportButtons';
import RecentReports from './components/RecentReports';
import ConnectionStatus from './components/ConnectionStatus';
import { TrainReport, ConnectionState } from './types';
import { TrainReportsApi } from './services/api';
import signalRService from './services/signalr';

function App() {
  const [latestReport, setLatestReport] = useState<TrainReport | null>(null);
  const [recentReports, setRecentReports] = useState<TrainReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);

  // Load initial data
  const loadData = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // Handle new report submission
  const handleReportSubmitted = () => {
    // Reload data after a successful report submission
    loadData();
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
    const initializeApp = async () => {
      try {
        // Load initial data
        await loadData();

        // Set up SignalR connection
        const unsubscribeConnectionState = signalRService.onConnectionStateChange(setConnectionState);
        const unsubscribeNewReport = signalRService.onNewTrainReport(handleNewTrainReport);

        // Start SignalR connection
        await signalRService.start();

        // Cleanup on unmount
        return () => {
          unsubscribeConnectionState();
          unsubscribeNewReport();
          signalRService.stop();
        };
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    const cleanup = initializeApp();

    return () => {
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Connection Status */}
      <ConnectionStatus connectionState={connectionState} />

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              🚂 Train Tracker
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real-time community-driven train crossing status.
              Help others know when it's safe to cross!
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Current Status */}
          <section>
            <TrainCrossingStatus
              latestReport={latestReport}
              loading={loading}
            />
          </section>

          {/* Report Buttons */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <ReportButtons
              onReportSubmitted={handleReportSubmitted}
              disabled={connectionState === ConnectionState.Disconnected}
            />
          </section>

          {/* Recent Reports */}
          <section>
            <RecentReports
              reports={recentReports}
              loading={loading}
            />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p className="mb-2">
              Community-driven train crossing status tracker
            </p>
            <p>
              Reports are submitted anonymously and updated in real-time.
              Please report accurately to help your community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;