import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Config.API_URL || 'http://localhost:5001/api';

export interface UserSettings {
  id: string;
  userId: string;
  // Security Settings
  twoFactorEnabled: boolean;
  biometricAuthEnabled: boolean;
  sessionTimeout: number;
  // App Settings
  language: string;
  theme: 'Light' | 'Dark' | 'System';
  currency: string;
  timezone: string;
  // Notification Preferences
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  bookingNotifications: boolean;
  promotionalNotifications: boolean;
  securityAlerts: boolean;
  // Privacy Settings
  shareDataForAnalytics: boolean;
  shareDataForMarketing: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSecuritySettingsRequest {
  twoFactorEnabled?: boolean;
  biometricAuthEnabled?: boolean;
  sessionTimeout?: number;
}

export interface UpdateAppSettingsRequest {
  language?: string;
  theme?: 'Light' | 'Dark' | 'System';
  currency?: string;
  timezone?: string;
}

export interface UpdatePreferencesRequest {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  smsNotifications?: boolean;
  bookingNotifications?: boolean;
  promotionalNotifications?: boolean;
  securityAlerts?: boolean;
  shareDataForAnalytics?: boolean;
  shareDataForMarketing?: boolean;
}

class UserSettingsService {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getSettings(): Promise<UserSettings> {
    try {
      const url = `${API_URL}/usersettings`;
      console.log('🔵 USER SETTINGS REQUEST:', url);

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log('🔵 USER SETTINGS RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 USER SETTINGS ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to fetch user settings');
      }

      const data = await response.json() as UserSettings;
      console.log('✅ USER SETTINGS SUCCESS');
      return data;
    } catch (error) {
      console.error('🔴 USER SETTINGS SERVICE ERROR:', error);
      throw error;
    }
  }

  async updateSecuritySettings(settingsData: UpdateSecuritySettingsRequest): Promise<UserSettings> {
    try {
      const url = `${API_URL}/usersettings/security`;
      console.log('🔵 UPDATE SECURITY SETTINGS REQUEST:', url, settingsData);

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(settingsData),
      });

      console.log('🔵 UPDATE SECURITY SETTINGS RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 UPDATE SECURITY SETTINGS ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to update security settings');
      }

      const data = await response.json() as UserSettings;
      console.log('✅ UPDATE SECURITY SETTINGS SUCCESS');
      return data;
    } catch (error) {
      console.error('🔴 UPDATE SECURITY SETTINGS SERVICE ERROR:', error);
      throw error;
    }
  }

  async updateAppSettings(settingsData: UpdateAppSettingsRequest): Promise<UserSettings> {
    try {
      const url = `${API_URL}/usersettings/app`;
      console.log('🔵 UPDATE APP SETTINGS REQUEST:', url, settingsData);

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(settingsData),
      });

      console.log('🔵 UPDATE APP SETTINGS RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 UPDATE APP SETTINGS ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to update app settings');
      }

      const data = await response.json() as UserSettings;
      console.log('✅ UPDATE APP SETTINGS SUCCESS');
      return data;
    } catch (error) {
      console.error('🔴 UPDATE APP SETTINGS SERVICE ERROR:', error);
      throw error;
    }
  }

  async updatePreferences(settingsData: UpdatePreferencesRequest): Promise<UserSettings> {
    try {
      const url = `${API_URL}/usersettings/preferences`;
      console.log('🔵 UPDATE PREFERENCES REQUEST:', url, settingsData);

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(settingsData),
      });

      console.log('🔵 UPDATE PREFERENCES RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 UPDATE PREFERENCES ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to update preferences');
      }

      const data = await response.json() as UserSettings;
      console.log('✅ UPDATE PREFERENCES SUCCESS');
      return data;
    } catch (error) {
      console.error('🔴 UPDATE PREFERENCES SERVICE ERROR:', error);
      throw error;
    }
  }
}

export default new UserSettingsService();
