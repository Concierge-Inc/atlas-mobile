import * as signalR from '@microsoft/signalr';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

const BASE_URL = Config.API_URL?.replace('/api', '') || 'http://localhost:5001';

export interface NotificationMessage {
  type: 'BookingCreated' | 'BookingConfirmed' | 'BookingCancelled' | 'FlightDelayed' | 'PaymentReceived' | 'SecurityAlert' | 'General';
  title: string;
  message: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  data?: Record<string, any>;
  timestamp: string;
}

export interface BookingStatusUpdate {
  bookingId: string;
  status: 'Pending' | 'Confirmed' | 'Active' | 'Completed' | 'Cancelled';
  message?: string;
  timestamp: string;
}

export interface BookingUpdate {
  bookingId: string;
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: string;
}

type NotificationHandler = (notification: NotificationMessage) => void;
type BookingStatusHandler = (update: BookingStatusUpdate) => void;
type BookingUpdateHandler = (update: BookingUpdate) => void;

class SignalRService {
  private atlasConnection: signalR.HubConnection | null = null;
  private notificationConnection: signalR.HubConnection | null = null;
  
  private notificationHandlers: NotificationHandler[] = [];
  private bookingStatusHandlers: BookingStatusHandler[] = [];
  private bookingUpdateHandlers: BookingUpdateHandler[] = [];

  /**
   * Initialize and start both SignalR connections
   */
  async start(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      
      if (!token) {
        console.log('⚠️ SIGNALR: No access token found, skipping SignalR connection');
        return;
      }

      console.log('🔵 SIGNALR: Starting connections to', BASE_URL);

      // Start both hubs (don't fail if one fails)
      const results = await Promise.allSettled([
        this.startAtlasHub(token),
        this.startNotificationHub(token),
      ]);

      const atlasResult = results[0];
      const notificationResult = results[1];

      if (atlasResult.status === 'fulfilled' && notificationResult.status === 'fulfilled') {
        console.log('✅ SIGNALR: All hubs connected successfully');
      } else {
        if (atlasResult.status === 'rejected') {
          console.log('⚠️ SIGNALR: Atlas Hub failed to connect:', atlasResult.reason?.message);
        }
        if (notificationResult.status === 'rejected') {
          console.log('⚠️ SIGNALR: Notification Hub failed to connect:', notificationResult.reason?.message);
        }
        console.log('⚠️ SIGNALR: Some hubs failed to connect, but app will continue to work');
      }
    } catch (error) {
      console.error('🔴 SIGNALR START ERROR:', error);
      // Don't throw - allow app to continue without SignalR
      console.log('⚠️ SIGNALR: App will continue without real-time notifications');
    }
  }

  /**
   * Start Atlas Hub connection (/hubs/atlas)
   */
  private async startAtlasHub(token: string): Promise<void> {
    try {
      if (this.atlasConnection?.state === signalR.HubConnectionState.Connected) {
        console.log('⚠️ SIGNALR: Atlas Hub already connected');
        return;
      }

      console.log('🔵 SIGNALR: Connecting to Atlas Hub at', `${BASE_URL}/hubs/atlas`);

      this.atlasConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${BASE_URL}/hubs/atlas`, {
          accessTokenFactory: () => token,
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Exponential backoff: 0ms, 2s, 10s, 30s, then 30s
            if (retryContext.previousRetryCount === 0) return 0;
            if (retryContext.previousRetryCount === 1) return 2000;
            if (retryContext.previousRetryCount === 2) return 10000;
            return 30000;
          },
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Register event handlers
      this.atlasConnection.on('BookingStatusChanged', (update: BookingStatusUpdate) => {
        console.log('📡 SIGNALR: BookingStatusChanged received', update);
        this.bookingStatusHandlers.forEach(handler => handler(update));
      });

      this.atlasConnection.on('BookingUpdate', (update: BookingUpdate) => {
        console.log('📡 SIGNALR: BookingUpdate received', update);
        this.bookingUpdateHandlers.forEach(handler => handler(update));
      });

      // Connection lifecycle events
      this.atlasConnection.onreconnecting((error) => {
        console.log('🔄 SIGNALR: Atlas Hub reconnecting...', error?.message);
      });

      this.atlasConnection.onreconnected((connectionId) => {
        console.log('✅ SIGNALR: Atlas Hub reconnected', connectionId);
      });

      this.atlasConnection.onclose((error) => {
        console.log('❌ SIGNALR: Atlas Hub connection closed', error?.message);
      });

      await this.atlasConnection.start();
      console.log('✅ SIGNALR: Atlas Hub connected');
    } catch (error: any) {
      console.log('⚠️ SIGNALR: Atlas Hub connection failed (this is expected if backend is not running)');
      // Don't throw - this prevents the error from showing in React Native error overlay
    }
  }

  /**
   * Start Notification Hub connection (/hubs/notifications)
   */
  private async startNotificationHub(token: string): Promise<void> {
    try {
      if (this.notificationConnection?.state === signalR.HubConnectionState.Connected) {
        console.log('⚠️ SIGNALR: Notification Hub already connected');
        return;
      }

      console.log('🔵 SIGNALR: Connecting to Notification Hub at', `${BASE_URL}/hubs/notifications`);

      this.notificationConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${BASE_URL}/hubs/notifications`, {
          accessTokenFactory: () => token,
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount === 0) return 0;
            if (retryContext.previousRetryCount === 1) return 2000;
            if (retryContext.previousRetryCount === 2) return 10000;
            return 30000;
          },
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Register event handlers
      this.notificationConnection.on('ReceiveNotification', (notification: NotificationMessage) => {
        console.log('📡 SIGNALR: ReceiveNotification received', notification);
        this.notificationHandlers.forEach(handler => handler(notification));
      });

      // Connection lifecycle events
      this.notificationConnection.onreconnecting((error) => {
        console.log('🔄 SIGNALR: Notification Hub reconnecting...', error?.message);
      });

      this.notificationConnection.onreconnected((connectionId) => {
        console.log('✅ SIGNALR: Notification Hub reconnected', connectionId);
      });

      this.notificationConnection.onclose((error) => {
        console.log('❌ SIGNALR: Notification Hub connection closed', error?.message);
      });

      await this.notificationConnection.start();
      console.log('✅ SIGNALR: Notification Hub connected');
    } catch (error: any) {
      console.log('⚠️ SIGNALR: Notification Hub connection failed (this is expected if backend is not running)');
      // Don't throw - this prevents the error from showing in React Native error overlay
    }
  }

  /**
   * Stop all SignalR connections
   */
  async stop(): Promise<void> {
    try {
      if (this.atlasConnection) {
        await this.atlasConnection.stop();
        console.log('✅ SIGNALR: Atlas Hub disconnected');
      }
      
      if (this.notificationConnection) {
        await this.notificationConnection.stop();
        console.log('✅ SIGNALR: Notification Hub disconnected');
      }
    } catch (error) {
      console.error('🔴 SIGNALR STOP ERROR:', error);
    }
  }

  /**
   * Subscribe to a specific booking for real-time updates
   */
  async subscribeToBooking(bookingId: string): Promise<void> {
    try {
      if (!this.atlasConnection || this.atlasConnection.state !== signalR.HubConnectionState.Connected) {
        console.log('⚠️ SIGNALR: Cannot subscribe to booking - not connected');
        return;
      }

      await this.atlasConnection.invoke('SubscribeToBooking', bookingId);
      console.log('✅ SIGNALR: Subscribed to booking', bookingId);
    } catch (error) {
      console.error('🔴 SIGNALR SUBSCRIBE ERROR:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from a specific booking
   */
  async unsubscribeFromBooking(bookingId: string): Promise<void> {
    try {
      if (!this.atlasConnection || this.atlasConnection.state !== signalR.HubConnectionState.Connected) {
        console.log('⚠️ SIGNALR: Cannot unsubscribe from booking - not connected');
        return;
      }

      await this.atlasConnection.invoke('UnsubscribeFromBooking', bookingId);
      console.log('✅ SIGNALR: Unsubscribed from booking', bookingId);
    } catch (error) {
      console.error('🔴 SIGNALR UNSUBSCRIBE ERROR:', error);
      throw error;
    }
  }

  /**
   * Register a handler for notification messages
   */
  onNotification(handler: NotificationHandler): () => void {
    this.notificationHandlers.push(handler);
    // Return unsubscribe function
    return () => {
      const index = this.notificationHandlers.indexOf(handler);
      if (index > -1) {
        this.notificationHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Register a handler for booking status changes
   */
  onBookingStatusChanged(handler: BookingStatusHandler): () => void {
    this.bookingStatusHandlers.push(handler);
    // Return unsubscribe function
    return () => {
      const index = this.bookingStatusHandlers.indexOf(handler);
      if (index > -1) {
        this.bookingStatusHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Register a handler for booking updates
   */
  onBookingUpdate(handler: BookingUpdateHandler): () => void {
    this.bookingUpdateHandlers.push(handler);
    // Return unsubscribe function
    return () => {
      const index = this.bookingUpdateHandlers.indexOf(handler);
      if (index > -1) {
        this.bookingUpdateHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Get connection state
   */
  getConnectionState(): {
    atlas: signalR.HubConnectionState | 'NotInitialized';
    notifications: signalR.HubConnectionState | 'NotInitialized';
  } {
    return {
      atlas: this.atlasConnection?.state || 'NotInitialized',
      notifications: this.notificationConnection?.state || 'NotInitialized',
    };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return (
      this.atlasConnection?.state === signalR.HubConnectionState.Connected &&
      this.notificationConnection?.state === signalR.HubConnectionState.Connected
    );
  }
}

export default new SignalRService();
