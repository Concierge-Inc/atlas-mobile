import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Config.API_URL || 'http://localhost:5001/api';

export enum MessageRole {
  User = 'User',
  Model = 'Model',
  System = 'System',
}

export interface ConciergeMessage {
  id: string;
  sessionId?: string;
  role: MessageRole;
  text: string;
  timestamp: string;
}

export interface StartSessionResponse {
  sessionId: string;
}

export interface LatestSessionResponse {
  sessionId?: string;
}

export interface SendMessageResponse {
  messageId: string;
}

class ConciergeService {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getSessionMessages(sessionId: string): Promise<ConciergeMessage[]> {
    try {
      const url = `${API_URL}/concierge/sessions/${sessionId}/messages`;
      console.log('🔵 SESSION MESSAGES REQUEST:', url);

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log('🔵 SESSION MESSAGES RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 SESSION MESSAGES ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to fetch session messages');
      }

      const data = await response.json() as ConciergeMessage[];
      console.log('✅ SESSION MESSAGES SUCCESS:', data.length, 'messages loaded');
      return data;
    } catch (error) {
      console.error('🔴 SESSION MESSAGES SERVICE ERROR:', error);
      throw error;
    }
  }

  async getLatestSession(): Promise<string | null> {
    try {
      const url = `${API_URL}/concierge/sessions/latest`;
      console.log('🔵 GET LATEST SESSION REQUEST:', url);

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log('🔵 GET LATEST SESSION RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 GET LATEST SESSION ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to get latest session');
      }

      const data = await response.json() as LatestSessionResponse;
      console.log('✅ GET LATEST SESSION SUCCESS:', data.sessionId || 'no session');
      return data.sessionId || null;
    } catch (error) {
      console.error('🔴 GET LATEST SESSION SERVICE ERROR:', error);
      throw error;
    }
  }

  async startSession(initialMessage: string): Promise<string> {
    try {
      const url = `${API_URL}/concierge/sessions`;
      console.log('🔵 START SESSION REQUEST:', url);

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ initialMessage }),
      });

      console.log('🔵 START SESSION RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 START SESSION ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to start concierge session');
      }

      const data = await response.json() as StartSessionResponse;
      console.log('✅ START SESSION SUCCESS:', data.sessionId);
      return data.sessionId;
    } catch (error) {
      console.error('🔴 START SESSION SERVICE ERROR:', error);
      throw error;
    }
  }

  async sendMessage(sessionId: string, role: MessageRole, message: string): Promise<string> {
    try {
      const url = `${API_URL}/concierge/sessions/${sessionId}/messages`;
      console.log('🔵 SEND MESSAGE REQUEST:', url, { role, message });

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ role, message }),
      });

      console.log('🔵 SEND MESSAGE RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 SEND MESSAGE ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to send message');
      }

      const data = await response.json() as SendMessageResponse;
      console.log('✅ SEND MESSAGE SUCCESS:', data.messageId);
      return data.messageId;
    } catch (error) {
      console.error('🔴 SEND MESSAGE SERVICE ERROR:', error);
      throw error;
    }
  }
}

export default new ConciergeService();
