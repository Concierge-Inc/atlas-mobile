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

export interface BookingNotification {
  bookingId: string;
  type: 'Created' | 'Confirmed' | 'Cancelled' | 'Modified' | 'Completed';
  message: string;
  timestamp: string;
}

export interface TravelStatusNotification {
  travelId: string;
  flightNumber: string;
  status: string;
  estimatedDeparture?: string;
  estimatedArrival?: string;
  delay?: number;
  timestamp: string;
}

export interface PaymentNotification {
  paymentId: string;
  amount: number;
  currency: string;
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  timestamp: string;
}

export interface SystemAlert {
  alertType: 'Maintenance' | 'Emergency' | 'ServiceUpdate';
  title: string;
  message: string;
  severity: 'Info' | 'Warning' | 'Critical';
  timestamp: string;
}

export interface DriverLocation {
  driverId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface DriverAssignedEvent {
  bookingId: string;
  driverId: string;
  bookingNumber: string;
  timestamp: string;
}

export interface DriverUnassignedEvent {
  bookingId: string;
  bookingNumber: string;
  timestamp: string;
}

export interface ConciergeMessage {
  sessionId: string;
  messageId: string;
  response: string;
  userId: string;
  timestamp: string;
}

export interface ConciergeSessionStarted {
  sessionId: string;
  welcomeMessage: string;
  timestamp: string;
}

export interface UserTyping {
  sessionId: string;
  userId: string;
  isTyping: boolean;
  timestamp: string;
}

type NotificationHandler = (notification: NotificationMessage) => void;
type BookingStatusHandler = (update: BookingStatusUpdate) => void;
type BookingUpdateHandler = (update: BookingUpdate) => void;
type BookingNotificationHandler = (notification: BookingNotification) => void;
type TravelStatusHandler = (notification: TravelStatusNotification) => void;
type PaymentNotificationHandler = (notification: PaymentNotification) => void;
type SystemAlertHandler = (alert: SystemAlert) => void;
type DriverLocationHandler = (location: DriverLocation) => void;
type DriverAssignedHandler = (event: DriverAssignedEvent) => void;
type DriverUnassignedHandler = (event: DriverUnassignedEvent) => void;
type ConciergeMessageHandler = (message: ConciergeMessage) => void;
type ConciergeSessionStartedHandler = (session: ConciergeSessionStarted) => void;
type UserTypingHandler = (typing: UserTyping) => void;

class SignalRService {
  private atlasConnection: signalR.HubConnection | null = null;
  private notificationConnection: signalR.HubConnection | null = null;
  private driverLocationConnection: signalR.HubConnection | null = null;
  private conciergeConnection: signalR.HubConnection | null = null;

  private notificationHandlers: NotificationHandler[] = [];
  private bookingStatusHandlers: BookingStatusHandler[] = [];
  private bookingUpdateHandlers: BookingUpdateHandler[] = [];
  private bookingNotificationHandlers: BookingNotificationHandler[] = [];
  private travelStatusHandlers: TravelStatusHandler[] = [];
  private paymentNotificationHandlers: PaymentNotificationHandler[] = [];
  private systemAlertHandlers: SystemAlertHandler[] = [];
  private driverLocationHandlers: DriverLocationHandler[] = [];
  private driverAssignedHandlers: DriverAssignedHandler[] = [];
  private driverUnassignedHandlers: DriverUnassignedHandler[] = [];
  private conciergeMessageHandlers: ConciergeMessageHandler[] = [];
  private conciergeSessionStartedHandlers: ConciergeSessionStartedHandler[] = [];
  private userTypingHandlers: UserTypingHandler[] = [];

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

      // Start all hubs (don't fail if one fails)
      const results = await Promise.allSettled([
        this.startAtlasHub(token),
        this.startNotificationHub(token),
        this.startDriverLocationHub(token),
        this.startConciergeHub(token),
      ]);

      const atlasResult = results[0];
      const notificationResult = results[1];
      const driverLocationResult = results[2];
      const conciergeResult = results[3];

      if (atlasResult.status === 'fulfilled' && notificationResult.status === 'fulfilled' && driverLocationResult.status === 'fulfilled' && conciergeResult.status === 'fulfilled') {
        console.log('✅ SIGNALR: All hubs connected successfully');
      } else {
        if (atlasResult.status === 'rejected') {
          console.log('⚠️ SIGNALR: Atlas Hub failed to connect:', atlasResult.reason?.message);
        }
        if (notificationResult.status === 'rejected') {
          console.log('⚠️ SIGNALR: Notification Hub failed to connect:', notificationResult.reason?.message);
        }
        if (driverLocationResult.status === 'rejected') {
          console.log('⚠️ SIGNALR: Driver Location Hub failed to connect:', driverLocationResult.reason?.message);
        }
        if (conciergeResult.status === 'rejected') {
          console.log('⚠️ SIGNALR: Concierge Hub failed to connect:', conciergeResult.reason?.message);
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

      this.notificationConnection.on('ReceiveBookingNotification', (notification: BookingNotification) => {
        console.log('📡 SIGNALR: ReceiveBookingNotification received', notification);
        this.bookingNotificationHandlers.forEach(handler => handler(notification));
      });

      this.notificationConnection.on('ReceiveTravelUpdate', (notification: TravelStatusNotification) => {
        console.log('📡 SIGNALR: ReceiveTravelUpdate received', notification);
        this.travelStatusHandlers.forEach(handler => handler(notification));
      });

      this.notificationConnection.on('ReceivePaymentNotification', (notification: PaymentNotification) => {
        console.log('📡 SIGNALR: ReceivePaymentNotification received', notification);
        this.paymentNotificationHandlers.forEach(handler => handler(notification));
      });

      this.notificationConnection.on('ReceiveSystemAlert', (alert: SystemAlert) => {
        console.log('📡 SIGNALR: ReceiveSystemAlert received', alert);
        this.systemAlertHandlers.forEach(handler => handler(alert));
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
   * Start Driver Location Hub connection (/hubs/driver-location)
   */
  private async startDriverLocationHub(token: string): Promise<void> {
    try {
      if (this.driverLocationConnection?.state === signalR.HubConnectionState.Connected) {
        console.log('⚠️ SIGNALR: Driver Location Hub already connected');
        return;
      }

      console.log('🔵 SIGNALR: Connecting to Driver Location Hub at', `${BASE_URL}/hubs/driver-location`);

      this.driverLocationConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${BASE_URL}/hubs/driver-location`, {
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
      this.driverLocationConnection.on('DriverLocationUpdated', (location: DriverLocation) => {
        console.log('📡 SIGNALR: DriverLocationUpdated received', location);
        this.driverLocationHandlers.forEach(handler => handler(location));
      });

      this.driverLocationConnection.on('DriverAssigned', (event: DriverAssignedEvent) => {
        console.log('📡 SIGNALR: DriverAssigned received', event);
        this.driverAssignedHandlers.forEach(handler => handler(event));
      });

      this.driverLocationConnection.on('DriverUnassigned', (event: DriverUnassignedEvent) => {
        console.log('📡 SIGNALR: DriverUnassigned received', event);
        this.driverUnassignedHandlers.forEach(handler => handler(event));
      });

      // Connection lifecycle events
      this.driverLocationConnection.onreconnecting((error) => {
        console.log('🔄 SIGNALR: Driver Location Hub reconnecting...', error?.message);
      });

      this.driverLocationConnection.onreconnected((connectionId) => {
        console.log('✅ SIGNALR: Driver Location Hub reconnected', connectionId);
      });

      this.driverLocationConnection.onclose((error) => {
        console.log('❌ SIGNALR: Driver Location Hub connection closed', error?.message);
      });

      await this.driverLocationConnection.start();
      console.log('✅ SIGNALR: Driver Location Hub connected');
    } catch (error: any) {
      console.log('⚠️ SIGNALR: Driver Location Hub connection failed (this is expected if backend is not running)');
      // Don't throw - this prevents the error from showing in React Native error overlay
    }
  }

  /**
   * Start Concierge Hub connection (/hubs/concierge)
   */
  private async startConciergeHub(token: string): Promise<void> {
    try {
      if (this.conciergeConnection?.state === signalR.HubConnectionState.Connected) {
        console.log('⚠️ SIGNALR: Concierge Hub already connected');
        return;
      }

      console.log('🔵 SIGNALR: Connecting to Concierge Hub at', `${BASE_URL}/hubs/concierge`);

      this.conciergeConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${BASE_URL}/hubs/concierge`, {
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
      this.conciergeConnection.on('NewMessage', (message: ConciergeMessage) => {
        console.log('📡 SIGNALR: NewMessage received', message);
        this.conciergeMessageHandlers.forEach(handler => handler(message));
      });

      this.conciergeConnection.on('AiResponse', (data: ConciergeMessage) => {
        console.log('📡 SIGNALR: AiResponse received', data);
        this.conciergeMessageHandlers.forEach(handler => handler(data));
      });

      this.conciergeConnection.on('SessionStarted', (session: ConciergeSessionStarted) => {
        console.log('📡 SIGNALR: SessionStarted received', session);
        this.conciergeSessionStartedHandlers.forEach(handler => handler(session));
      });

      this.conciergeConnection.on('UserTyping', (typing: UserTyping) => {
        console.log('📡 SIGNALR: UserTyping received', typing);
        this.userTypingHandlers.forEach(handler => handler(typing));
      });

      // Connection lifecycle events
      this.conciergeConnection.onreconnecting((error) => {
        console.log('🔄 SIGNALR: Concierge Hub reconnecting...', error?.message);
      });

      this.conciergeConnection.onreconnected((connectionId) => {
        console.log('✅ SIGNALR: Concierge Hub reconnected', connectionId);
      });

      this.conciergeConnection.onclose((error) => {
        console.log('❌ SIGNALR: Concierge Hub connection closed', error?.message);
      });

      await this.conciergeConnection.start();
      console.log('✅ SIGNALR: Concierge Hub connected');
    } catch (error: any) {
      console.log('⚠️ SIGNALR: Concierge Hub connection failed (this is expected if backend is not running)');
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

      if (this.driverLocationConnection) {
        await this.driverLocationConnection.stop();
        console.log('✅ SIGNALR: Driver Location Hub disconnected');
      }

      if (this.conciergeConnection) {
        await this.conciergeConnection.stop();
        console.log('✅ SIGNALR: Concierge Hub disconnected');
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
   * Register a handler for booking notifications
   */
  onBookingNotification(handler: BookingNotificationHandler): () => void {
    this.bookingNotificationHandlers.push(handler);
    return () => {
      const index = this.bookingNotificationHandlers.indexOf(handler);
      if (index > -1) {
        this.bookingNotificationHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Register a handler for travel status updates
   */
  onTravelStatusUpdate(handler: TravelStatusHandler): () => void {
    this.travelStatusHandlers.push(handler);
    return () => {
      const index = this.travelStatusHandlers.indexOf(handler);
      if (index > -1) {
        this.travelStatusHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Register a handler for payment notifications
   */
  onPaymentNotification(handler: PaymentNotificationHandler): () => void {
    this.paymentNotificationHandlers.push(handler);
    return () => {
      const index = this.paymentNotificationHandlers.indexOf(handler);
      if (index > -1) {
        this.paymentNotificationHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Register a handler for system alerts
   */
  onSystemAlert(handler: SystemAlertHandler): () => void {
    this.systemAlertHandlers.push(handler);
    return () => {
      const index = this.systemAlertHandlers.indexOf(handler);
      if (index > -1) {
        this.systemAlertHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Register a handler for driver location updates
   */
  onDriverLocation(handler: DriverLocationHandler): () => void {
    this.driverLocationHandlers.push(handler);
    return () => {
      const index = this.driverLocationHandlers.indexOf(handler);
      if (index > -1) {
        this.driverLocationHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Alias for onDriverLocation - register a handler for driver location updates
   */
  onDriverLocationUpdated(handler: DriverLocationHandler): () => void {
    return this.onDriverLocation(handler);
  }

  /**
   * Connect to driver location hub (public method for manual connection)
   */
  async connectToDriverLocationHub(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('accessToken');

      if (!token) {
        console.log('⚠️ SIGNALR: No access token found for driver location hub connection');
        return;
      }

      await this.startDriverLocationHub(token);
    } catch (error: any) {
      console.error('🔴 SIGNALR: Failed to connect to driver location hub:', error?.message);
      throw error;
    }
  }

  /**
   * Register a handler for driver assigned events
   */
  onDriverAssigned(handler: DriverAssignedHandler): () => void {
    this.driverLocationHandlers.push(handler);
    return () => {
      const index = this.driverLocationHandlers.indexOf(handler);
      if (index > -1) {
        this.driverLocationHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Register a handler for driver assigned events
   */
  onDriverAssigned(handler: DriverAssignedHandler): () => void {
    this.driverAssignedHandlers.push(handler);
    return () => {
      const index = this.driverAssignedHandlers.indexOf(handler);
      if (index > -1) {
        this.driverAssignedHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Register a handler for driver unassigned events
   */
  onDriverUnassigned(handler: DriverUnassignedHandler): () => void {
    this.driverUnassignedHandlers.push(handler);
    return () => {
      const index = this.driverUnassignedHandlers.indexOf(handler);
      if (index > -1) {
        this.driverUnassignedHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to driver location updates
   */
  async subscribeToDriver(driverId: string): Promise<void> {
    try {
      if (!this.driverLocationConnection || this.driverLocationConnection.state !== signalR.HubConnectionState.Connected) {
        console.log('⚠️ SIGNALR: Cannot subscribe to driver - not connected');
        return;
      }

      await this.driverLocationConnection.invoke('SubscribeToDriver', driverId);
      console.log('✅ SIGNALR: Subscribed to driver', driverId);
    } catch (error) {
      console.error('🔴 SIGNALR SUBSCRIBE DRIVER ERROR:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from driver location updates
   */
  async unsubscribeFromDriver(driverId: string): Promise<void> {
    try {
      if (!this.driverLocationConnection || this.driverLocationConnection.state !== signalR.HubConnectionState.Connected) {
        console.log('⚠️ SIGNALR: Cannot unsubscribe from driver - not connected');
        return;
      }

      await this.driverLocationConnection.invoke('UnsubscribeFromDriver', driverId);
      console.log('✅ SIGNALR: Unsubscribed from driver', driverId);
    } catch (error) {
      console.error('🔴 SIGNALR UNSUBSCRIBE DRIVER ERROR:', error);
      throw error;
    }
  }

  /**
   * Subscribe to booking location updates
   */
  async subscribeToBookingTracking(bookingId: string): Promise<void> {
    try {
      if (!this.driverLocationConnection || this.driverLocationConnection.state !== signalR.HubConnectionState.Connected) {
        console.log('⚠️ SIGNALR: Cannot subscribe to booking tracking - not connected');
        return;
      }

      await this.driverLocationConnection.invoke('SubscribeToBooking', bookingId);
      console.log('✅ SIGNALR: Subscribed to booking tracking', bookingId);
    } catch (error) {
      console.error('🔴 SIGNALR SUBSCRIBE BOOKING TRACKING ERROR:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from booking location updates
   */
  async unsubscribeFromBookingTracking(bookingId: string): Promise<void> {
    try {
      if (!this.driverLocationConnection || this.driverLocationConnection.state !== signalR.HubConnectionState.Connected) {
        console.log('⚠️ SIGNALR: Cannot unsubscribe from booking tracking - not connected');
        return;
      }

      await this.driverLocationConnection.invoke('UnsubscribeFromBooking', bookingId);
      console.log('✅ SIGNALR: Unsubscribed from booking tracking', bookingId);
    } catch (error) {
      console.error('🔴 SIGNALR UNSUBSCRIBE BOOKING TRACKING ERROR:', error);
      throw error;
    }
  }

  /**
   * Get connection state
   */
  getConnectionState(): {
    atlas: signalR.HubConnectionState | 'NotInitialized';
    notifications: signalR.HubConnectionState | 'NotInitialized';
    driverLocation: signalR.HubConnectionState | 'NotInitialized';
    concierge: signalR.HubConnectionState | 'NotInitialized';
  } {
    return {
      atlas: this.atlasConnection?.state || 'NotInitialized',
      notifications: this.notificationConnection?.state || 'NotInitialized',
      driverLocation: this.driverLocationConnection?.state || 'NotInitialized',
      concierge: this.conciergeConnection?.state || 'NotInitialized',
    };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return (
      this.atlasConnection?.state === signalR.HubConnectionState.Connected &&
      this.notificationConnection?.state === signalR.HubConnectionState.Connected &&
      this.driverLocationConnection?.state === signalR.HubConnectionState.Connected &&
      this.conciergeConnection?.state === signalR.HubConnectionState.Connected
    );
  }

  /**
   * Register a handler for concierge messages
   */
  onConciergeMessage(handler: ConciergeMessageHandler): () => void {
    this.conciergeMessageHandlers.push(handler);
    return () => {
      const index = this.conciergeMessageHandlers.indexOf(handler);
      if (index > -1) {
        this.conciergeMessageHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Register a handler for session started events
   */
  onConciergeSessionStarted(handler: ConciergeSessionStartedHandler): () => void {
    this.conciergeSessionStartedHandlers.push(handler);
    return () => {
      const index = this.conciergeSessionStartedHandlers.indexOf(handler);
      if (index > -1) {
        this.conciergeSessionStartedHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Register a handler for user typing events
   */
  onUserTyping(handler: UserTypingHandler): () => void {
    this.userTypingHandlers.push(handler);
    return () => {
      const index = this.userTypingHandlers.indexOf(handler);
      if (index > -1) {
        this.userTypingHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Join a concierge session
   */
  async joinConciergeSession(sessionId: string): Promise<void> {
    try {
      if (!this.conciergeConnection || this.conciergeConnection.state !== signalR.HubConnectionState.Connected) {
        console.log('⚠️ SIGNALR: Cannot join concierge session - not connected');
        return;
      }

      await this.conciergeConnection.invoke('JoinSession', sessionId);
      console.log('✅ SIGNALR: Joined concierge session', sessionId);
    } catch (error) {
      console.error('🔴 SIGNALR JOIN CONCIERGE SESSION ERROR:', error);
      throw error;
    }
  }

  /**
   * Leave a concierge session
   */
  async leaveConciergeSession(sessionId: string): Promise<void> {
    try {
      if (!this.conciergeConnection || this.conciergeConnection.state !== signalR.HubConnectionState.Connected) {
        console.log('⚠️ SIGNALR: Cannot leave concierge session - not connected');
        return;
      }

      await this.conciergeConnection.invoke('LeaveSession', sessionId);
      console.log('✅ SIGNALR: Left concierge session', sessionId);
    } catch (error) {
      console.error('🔴 SIGNALR LEAVE CONCIERGE SESSION ERROR:', error);
      throw error;
    }
  }

  /**
   * Send typing indicator in concierge session
   */
  async sendConciergeTyping(sessionId: string, isTyping: boolean): Promise<void> {
    try {
      if (!this.conciergeConnection || this.conciergeConnection.state !== signalR.HubConnectionState.Connected) {
        return;
      }

      await this.conciergeConnection.invoke('SendTypingIndicator', sessionId, isTyping);
    } catch (error) {
      console.error('🔴 SIGNALR CONCIERGE TYPING ERROR:', error);
    }
  }
}

export default new SignalRService();
