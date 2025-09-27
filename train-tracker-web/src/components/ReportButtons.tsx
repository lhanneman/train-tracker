import React, { useState } from 'react';
import { TrainReportsApi } from '../services/api';

interface ReportButtonsProps {
  onReportSubmitted: () => void;
  disabled?: boolean;
}

const ReportButtons: React.FC<ReportButtonsProps> = ({ onReportSubmitted, disabled = false }) => {
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState<number | null>(null);

  const handleReport = async (isTrainCrossing: boolean) => {
    if (submitting || disabled) return;

    // Prevent spam submissions (min 5 seconds between reports)
    const now = Date.now();
    if (lastSubmissionTime && now - lastSubmissionTime < 5000) {
      return;
    }

    setSubmitting(true);

    try {
      const result = await TrainReportsApi.createReport({ isTrainCrossing });

      if (result.error) {
        console.error('Failed to submit report:', result.error);
        // You could show a toast notification here
      } else {
        console.log('Report submitted successfully:', result.data);
        setLastSubmissionTime(now);
        onReportSubmitted();
      }
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const isRecentlySubmitted = lastSubmissionTime && Date.now() - lastSubmissionTime < 5000;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 text-center mb-6">
        Report Current Status
      </h3>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Train Crossing Button */}
        <button
          onClick={() => handleReport(true)}
          disabled={submitting || disabled || isRecentlySubmitted}
          className={`flex-1 py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
            submitting || disabled || isRecentlySubmitted
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95'
          } shadow-lg`}
        >
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl">🚂</span>
            <span>Train Crossing</span>
          </div>
          {submitting && (
            <div className="mt-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
            </div>
          )}
        </button>

        {/* All Clear Button */}
        <button
          onClick={() => handleReport(false)}
          disabled={submitting || disabled || isRecentlySubmitted}
          className={`flex-1 py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
            submitting || disabled || isRecentlySubmitted
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 hover:scale-105 active:scale-95'
          } shadow-lg`}
        >
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl">✅</span>
            <span>All Clear</span>
          </div>
          {submitting && (
            <div className="mt-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
            </div>
          )}
        </button>
      </div>

      {isRecentlySubmitted && (
        <div className="text-center text-sm text-gray-600 bg-gray-100 rounded-lg p-3">
          <span className="text-green-600">✓</span> Report submitted!
          Please wait before submitting another report.
        </div>
      )}

      <div className="text-center text-xs text-gray-500 mt-4">
        <p>Reports help other community members know the current status.</p>
        <p>Please report accurately and avoid spam.</p>
      </div>
    </div>
  );
};

export default ReportButtons;