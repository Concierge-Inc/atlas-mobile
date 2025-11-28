import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Config.API_URL || 'http://localhost:5001/api';

export enum NotificationType {
  BookingCreated = 0,
  BookingConfirmed = 1,
  BookingCancelled = 2,
  FlightDelayed = 3,
  PaymentReceived = 4,
  SecurityAlert = 5,
  General = 6
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  text: string;
  isUrgent: boolean;
  isRead: boolean;
  readAt?: string;
  bookingId?: string;
  createdAt: string;
}

class NotificationsService {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem('accessToken');
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getNotifications(params?: {
    onlyUnread?: boolean;
  }): Promise<Notification[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.onlyUnread) queryParams.append('onlyUnread', 'true');

      const url = `${API_URL}/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json() as Notification[];
      return data;
    } catch (error) {
      console.error('🔴 NOTIFICATIONS SERVICE ERROR:', error);
      throw error;
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const url = `${API_URL}/notifications/unread-count`;

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }

      const count = await response.json() as number;
      return count;
    } catch (error) {
      console.error('🔴 UNREAD COUNT SERVICE ERROR:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const url = `${API_URL}/notifications/${notificationId}/read`;

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('🔴 MARK AS READ SERVICE ERROR:', error);
      throw error;
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      const url = `${API_URL}/notifications/read-all`;

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
    } catch (error) {
      console.error('🔴 MARK ALL AS READ SERVICE ERROR:', error);
      throw error;
    }
  }
}

export default new NotificationsService();
