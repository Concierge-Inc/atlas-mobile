import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Config.API_URL || 'http://localhost:5001/api';

export interface ConciergeMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  senderType: 'User' | 'Concierge' | 'System';
  content: string;
  attachments?: MessageAttachment[];
  createdAt: string;
  isRead: boolean;
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

export interface ConciergeSession {
  id: string;
  userId: string;
  subject: string;
  status: 'Active' | 'Closed' | 'Pending';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignedConciergeId?: string;
  assignedConciergeName?: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string;
}

export interface SendMessageRequest {
  content: string;
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }[];
}

export interface StartSessionRequest {
  subject: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  initialMessage: string;
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

  async startSession(sessionData: StartSessionRequest): Promise<ConciergeSession> {
    try {
      const url = `${API_URL}/concierge/sessions`;
      console.log('🔵 START SESSION REQUEST:', url, sessionData);

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(sessionData),
      });

      console.log('🔵 START SESSION RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 START SESSION ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to start concierge session');
      }

      const data = await response.json() as ConciergeSession;
      console.log('✅ START SESSION SUCCESS:', data.id);
      return data;
    } catch (error) {
      console.error('🔴 START SESSION SERVICE ERROR:', error);
      throw error;
    }
  }

  async sendMessage(sessionId: string, messageData: SendMessageRequest): Promise<ConciergeMessage> {
    try {
      const url = `${API_URL}/concierge/sessions/${sessionId}/messages`;
      console.log('🔵 SEND MESSAGE REQUEST:', url, messageData);

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(messageData),
      });

      console.log('🔵 SEND MESSAGE RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 SEND MESSAGE ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to send message');
      }

      const data = await response.json() as ConciergeMessage;
      console.log('✅ SEND MESSAGE SUCCESS:', data.id);
      return data;
    } catch (error) {
      console.error('🔴 SEND MESSAGE SERVICE ERROR:', error);
      throw error;
    }
  }
}

export default new ConciergeService();
