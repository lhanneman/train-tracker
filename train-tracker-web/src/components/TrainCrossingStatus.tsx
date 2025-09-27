import React from 'react';
import { TrainReport } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface TrainCrossingStatusProps {
  latestReport: TrainReport | null;
  loading: boolean;
}

const TrainCrossingStatus: React.FC<TrainCrossingStatusProps> = ({ latestReport, loading }) => {
  if (loading) {
    return (
      <div className="bg-gray-100 rounded-lg p-6 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!latestReport) {
    return (
      <div className="bg-gray-100 rounded-lg p-6 text-center">
        <div className="text-6xl mb-4">❓</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">No Reports Yet</h2>
        <p className="text-gray-600">Be the first to report the train crossing status!</p>
      </div>
    );
  }

  const isTrainCrossing = latestReport.isTrainCrossing;
  const timeAgo = formatDistanceToNow(new Date(latestReport.reportedAt), { addSuffix: true });

  return (
    <div
      className={`rounded-lg p-6 text-center transition-all duration-500 ${
        isTrainCrossing
          ? 'bg-red-100 border-2 border-red-300'
          : 'bg-green-100 border-2 border-green-300'
      }`}
    >
      <div className="text-6xl mb-4">
        {isTrainCrossing ? '🚂' : '✅'}
      </div>

      <h2
        className={`text-3xl font-bold mb-2 ${
          isTrainCrossing ? 'text-red-700' : 'text-green-700'
        }`}
      >
        {isTrainCrossing ? 'Train Crossing!' : 'All Clear'}
      </h2>

      <p
        className={`text-lg mb-4 ${
          isTrainCrossing ? 'text-red-600' : 'text-green-600'
        }`}
      >
        {isTrainCrossing
          ? 'A train is currently crossing the tracks'
          : 'No train is currently crossing'
        }
      </p>

      <div className="text-sm text-gray-500">
        <p>Last reported {timeAgo}</p>
        <p className="mt-1">Report ID: #{latestReport.id}</p>
      </div>
    </div>
  );
};

export default TrainCrossingStatus;