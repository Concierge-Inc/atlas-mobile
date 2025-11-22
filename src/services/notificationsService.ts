import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Config.API_URL || 'http://localhost:5001/api';

export interface Notification {
  id: string;
  userId: string;
  type: 'BookingCreated' | 'BookingConfirmed' | 'BookingCancelled' | 'FlightDelayed' | 'PaymentReceived' | 'SecurityAlert' | 'General';
  title: string;
  message: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: string;
  readAt?: string;
}

export interface NotificationListResponse {
  data: Notification[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface UnreadCountResponse {
  count: number;
}

class NotificationsService {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getNotifications(params?: {
    page?: number;
    pageSize?: number;
    isRead?: boolean;
    type?: string;
  }): Promise<NotificationListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params?.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());
      if (params?.type) queryParams.append('type', params.type);

      const url = `${API_URL}/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('🔵 NOTIFICATIONS REQUEST:', url);

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log('🔵 NOTIFICATIONS RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 NOTIFICATIONS ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to fetch notifications');
      }

      const data = await response.json() as NotificationListResponse;
      console.log('✅ NOTIFICATIONS SUCCESS:', data.data?.length, 'notifications loaded');
      return data;
    } catch (error) {
      console.error('🔴 NOTIFICATIONS SERVICE ERROR:', error);
      throw error;
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const url = `${API_URL}/notifications/unread-count`;
      console.log('🔵 UNREAD COUNT REQUEST:', url);

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log('🔵 UNREAD COUNT RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 UNREAD COUNT ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to fetch unread count');
      }

      const data = await response.json() as UnreadCountResponse;
      console.log('✅ UNREAD COUNT SUCCESS:', data.count);
      return data.count;
    } catch (error) {
      console.error('🔴 UNREAD COUNT SERVICE ERROR:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const url = `${API_URL}/notifications/${notificationId}/read`;
      console.log('🔵 MARK AS READ REQUEST:', url);

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'POST',
        headers,
      });

      console.log('🔵 MARK AS READ RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 MARK AS READ ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to mark notification as read');
      }

      console.log('✅ MARK AS READ SUCCESS');
    } catch (error) {
      console.error('🔴 MARK AS READ SERVICE ERROR:', error);
      throw error;
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      const url = `${API_URL}/notifications/read-all`;
      console.log('🔵 MARK ALL AS READ REQUEST:', url);

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'POST',
        headers,
      });

      console.log('🔵 MARK ALL AS READ RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 MARK ALL AS READ ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to mark all notifications as read');
      }

      console.log('✅ MARK ALL AS READ SUCCESS');
    } catch (error) {
      console.error('🔴 MARK ALL AS READ SERVICE ERROR:', error);
      throw error;
    }
  }
}

export default new NotificationsService();
