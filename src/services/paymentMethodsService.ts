import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Config.API_URL || 'http://localhost:5001/api';

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'CreditCard' | 'DebitCard' | 'BankAccount' | 'DigitalWallet';
  provider: string;
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  holderName: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddPaymentMethodRequest {
  type: 'CreditCard' | 'DebitCard' | 'BankAccount' | 'DigitalWallet';
  provider: string;
  cardNumber: string;
  expiryMonth?: number;
  expiryYear?: number;
  cvv: string;
  holderName: string;
  isDefault?: boolean;
}

class PaymentMethodsService {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const url = `${API_URL}/paymentmethods`;
      console.log('🔵 PAYMENT METHODS REQUEST:', url);

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log('🔵 PAYMENT METHODS RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 PAYMENT METHODS ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to fetch payment methods');
      }

      const data = await response.json() as PaymentMethod[];
      console.log('✅ PAYMENT METHODS SUCCESS:', data.length, 'methods loaded');
      return data;
    } catch (error) {
      console.error('🔴 PAYMENT METHODS SERVICE ERROR:', error);
      throw error;
    }
  }

  async addPaymentMethod(paymentData: AddPaymentMethodRequest): Promise<PaymentMethod> {
    try {
      const url = `${API_URL}/paymentmethods`;
      console.log('🔵 ADD PAYMENT METHOD REQUEST:', url, { ...paymentData, cardNumber: '****', cvv: '***' });

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(paymentData),
      });

      console.log('🔵 ADD PAYMENT METHOD RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 ADD PAYMENT METHOD ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to add payment method');
      }

      const data = await response.json() as PaymentMethod;
      console.log('✅ ADD PAYMENT METHOD SUCCESS:', data.id);
      return data;
    } catch (error) {
      console.error('🔴 ADD PAYMENT METHOD SERVICE ERROR:', error);
      throw error;
    }
  }

  async setDefaultPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
    try {
      const url = `${API_URL}/paymentmethods/${paymentMethodId}/set-default`;
      console.log('🔵 SET DEFAULT PAYMENT METHOD REQUEST:', url);

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'PUT',
        headers,
      });

      console.log('🔵 SET DEFAULT PAYMENT METHOD RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 SET DEFAULT PAYMENT METHOD ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to set default payment method');
      }

      const data = await response.json() as PaymentMethod;
      console.log('✅ SET DEFAULT PAYMENT METHOD SUCCESS:', data.id);
      return data;
    } catch (error) {
      console.error('🔴 SET DEFAULT PAYMENT METHOD SERVICE ERROR:', error);
      throw error;
    }
  }

  async deactivatePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      const url = `${API_URL}/paymentmethods/${paymentMethodId}`;
      console.log('🔵 DEACTIVATE PAYMENT METHOD REQUEST:', url);

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      });

      console.log('🔵 DEACTIVATE PAYMENT METHOD RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 DEACTIVATE PAYMENT METHOD ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to deactivate payment method');
      }

      console.log('✅ DEACTIVATE PAYMENT METHOD SUCCESS');
    } catch (error) {
      console.error('🔴 DEACTIVATE PAYMENT METHOD SERVICE ERROR:', error);
      throw error;
    }
  }
}

export default new PaymentMethodsService();
