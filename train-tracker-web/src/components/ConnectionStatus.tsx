import React from 'react';
import { ConnectionState } from '../types';

interface ConnectionStatusProps {
  connectionState: ConnectionState;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ connectionState }) => {
  const getStatusInfo = () => {
    switch (connectionState) {
      case ConnectionState.Connected:
        return {
          icon: '🟢',
          text: 'Connected',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case ConnectionState.Connecting:
        return {
          icon: '🟡',
          text: 'Connecting...',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case ConnectionState.Reconnecting:
        return {
          icon: '🔄',
          text: 'Reconnecting...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case ConnectionState.Disconnected:
        return {
          icon: '🔴',
          text: 'Disconnected',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: '⚫',
          text: 'Unknown',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const statusInfo = getStatusInfo();

  // Don't show the component if connected (to reduce clutter)
  if (connectionState === ConnectionState.Connected) {
    return null;
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 ${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-lg px-3 py-2 shadow-lg transition-all duration-300`}
    >
      <div className="flex items-center space-x-2">
        <span className={connectionState === ConnectionState.Reconnecting ? 'animate-spin' : ''}>
          {statusInfo.icon}
        </span>
        <span className={`text-sm font-medium ${statusInfo.color}`}>
          {statusInfo.text}
        </span>
      </div>

      {connectionState === ConnectionState.Disconnected && (
        <div className="mt-2 text-xs text-gray-600">
          Real-time updates unavailable
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;