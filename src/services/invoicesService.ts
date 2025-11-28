import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Config.API_URL || 'http://localhost:5001/api';

export interface MoneyDto {
  amount: number;
  currency: string;
}

export enum InvoiceStatus {
  Pending = 0,
  Paid = 1,
  Overdue = 2,
  Cancelled = 3
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  bookingId?: string;
  serviceDescription: string;
  amount: MoneyDto;
  invoiceDate: string;
  dueDate?: string;
  status: InvoiceStatus;
  paidAt?: string;
  paymentReference?: string;
}

export interface PayInvoiceRequest {
  paymentMethodId: string;
}

class InvoicesService {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getInvoices(params?: {
    onlyPending?: boolean;
  }): Promise<Invoice[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.onlyPending !== undefined) queryParams.append('onlyPending', params.onlyPending.toString());

      const url = `${API_URL}/invoices${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('🔵 INVOICES REQUEST:', url);

      const token = await AsyncStorage.getItem('accessToken');
      const headers: Record<string, string> = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log('🔵 INVOICES RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 INVOICES ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to fetch invoices');
      }

      const data = await response.json() as Invoice[];
      console.log('✅ INVOICES SUCCESS:', data.length, 'invoices loaded');
      return data;
    } catch (error) {
      console.error('🔴 INVOICES SERVICE ERROR:', error);
      throw error;
    }
  }

  async payInvoice(invoiceId: string, paymentData: PayInvoiceRequest): Promise<void> {
    try {
      const url = `${API_URL}/invoices/${invoiceId}/pay`;
      console.log('🔵 PAY INVOICE REQUEST:', url, paymentData);

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(paymentData),
      });

      console.log('🔵 PAY INVOICE RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 PAY INVOICE ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to pay invoice');
      }

      console.log('✅ PAY INVOICE SUCCESS');
    } catch (error) {
      console.error('🔴 PAY INVOICE SERVICE ERROR:', error);
      throw error;
    }
  }
}

export default new InvoicesService();
