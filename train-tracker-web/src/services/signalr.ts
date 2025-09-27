import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { TrainReport, ConnectionState } from '../types';

export class SignalRService {
  private connection: HubConnection | null = null;
  private listeners: Map<string, ((...args: any[]) => void)[]> = new Map();
  private connectionStateListeners: ((state: ConnectionState) => void)[] = [];

  constructor(private hubUrl: string = 'http://localhost:5073/trainhub') {}

  // Start the SignalR connection
  async start(): Promise<void> {
    if (this.connection?.state === 'Connected') {
      return;
    }

    this.connection = new HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        withCredentials: true, // Include cookies for session tracking
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000]) // Retry delays in ms
      .configureLogging(LogLevel.Information)
      .build();

    // Set up connection state handlers
    this.connection.onclose(() => {
      this.notifyConnectionState(ConnectionState.Disconnected);
    });

    this.connection.onreconnecting(() => {
      this.notifyConnectionState(ConnectionState.Reconnecting);
    });

    this.connection.onreconnected(() => {
      this.notifyConnectionState(ConnectionState.Connected);
    });

    // Set up event listeners
    this.setupEventListeners();

    try {
      this.notifyConnectionState(ConnectionState.Connecting);
      await this.connection.start();
      this.notifyConnectionState(ConnectionState.Connected);
      console.log('SignalR Connected');
    } catch (error) {
      console.error('SignalR Connection Error:', error);
      this.notifyConnectionState(ConnectionState.Disconnected);
      throw error;
    }
  }

  // Stop the SignalR connection
  async stop(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      this.notifyConnectionState(ConnectionState.Disconnected);
    }
  }

  // Get current connection state
  getConnectionState(): ConnectionState {
    if (!this.connection) {
      return ConnectionState.Disconnected;
    }

    switch (this.connection.state) {
      case 'Connected':
        return ConnectionState.Connected;
      case 'Connecting':
        return ConnectionState.Connecting;
      case 'Reconnecting':
        return ConnectionState.Reconnecting;
      default:
        return ConnectionState.Disconnected;
    }
  }

  // Subscribe to new train reports
  onNewTrainReport(callback: (report: TrainReport) => void): () => void {
    return this.on('NewTrainReport', callback);
  }

  // Subscribe to connection state changes
  onConnectionStateChange(callback: (state: ConnectionState) => void): () => void {
    this.connectionStateListeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.connectionStateListeners.indexOf(callback);
      if (index > -1) {
        this.connectionStateListeners.splice(index, 1);
      }
    };
  }

  // Generic event subscription
  private on(eventName: string, callback: (...args: any[]) => void): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }

    this.listeners.get(eventName)!.push(callback);

    // Set up the actual SignalR listener if this is the first subscription
    if (this.listeners.get(eventName)!.length === 1 && this.connection) {
      this.connection.on(eventName, (...args: any[]) => {
        this.listeners.get(eventName)?.forEach(listener => listener(...args));
      });
    }

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(eventName);
      if (eventListeners) {
        const index = eventListeners.indexOf(callback);
        if (index > -1) {
          eventListeners.splice(index, 1);
        }
      }
    };
  }

  // Set up all event listeners
  private setupEventListeners(): void {
    if (!this.connection) return;

    // Clear existing listeners first
    this.listeners.forEach((_, eventName) => {
      this.connection?.off(eventName);
    });

    // Re-setup listeners for events that have subscriptions
    this.listeners.forEach((listeners, eventName) => {
      if (listeners.length > 0) {
        this.connection?.on(eventName, (...args: any[]) => {
          listeners.forEach(listener => listener(...args));
        });
      }
    });
  }

  // Notify connection state listeners
  private notifyConnectionState(state: ConnectionState): void {
    this.connectionStateListeners.forEach(listener => listener(state));
  }
}

// Create and export a singleton instance
export const signalRService = new SignalRService();
export default signalRService;