import React from 'react';
import { TrainReport } from '../types';
import { format, formatDistanceToNow } from 'date-fns';

interface RecentReportsProps {
  reports: TrainReport[];
  loading: boolean;
}

const RecentReports: React.FC<RecentReportsProps> = ({ reports, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Reports</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-center space-x-3 p-3 border rounded">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Recent Reports ({reports.length})
      </h3>

      {reports.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-3">📝</div>
          <p>No reports yet</p>
          <p className="text-sm">Be the first to report!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {reports.map((report, index) => {
            const isNew = index === 0; // Highlight the most recent report
            const timeAgo = formatDistanceToNow(new Date(report.reportedAt), { addSuffix: true });
            const exactTime = format(new Date(report.reportedAt), 'MMM d, h:mm a');

            return (
              <div
                key={report.id}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                  report.isTrainCrossing
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-green-50 border border-green-200'
                } ${isNew ? 'ring-2 ring-blue-200 animate-pulse' : ''}`}
              >
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      report.isTrainCrossing ? 'bg-red-100' : 'bg-green-100'
                    }`}
                  >
                    <span className="text-lg">
                      {report.isTrainCrossing ? '🚂' : '✅'}
                    </span>
                  </div>
                </div>

                {/* Report Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p
                      className={`font-medium ${
                        report.isTrainCrossing ? 'text-red-700' : 'text-green-700'
                      }`}
                    >
                      {report.isTrainCrossing ? 'Train Crossing' : 'All Clear'}
                    </p>
                    {isNew && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        New
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-600" title={exactTime}>
                      {timeAgo}
                    </p>
                    <p className="text-xs text-gray-400">
                      #{report.id}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reports.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Showing reports from the last 24 hours
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentReports;