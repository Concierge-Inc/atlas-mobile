import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Config.API_URL || 'http://localhost:5001/api';

export interface Invoice {
  id: string;
  userId: string;
  bookingId: string;
  invoiceNumber: string;
  amount: number;
  tax: number;
  totalAmount: number;
  status: 'Pending' | 'Paid' | 'Overdue' | 'Cancelled';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  description: string;
  lineItems: InvoiceLineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceListResponse {
  data: Invoice[];
  totalCount: number;
  page: number;
  pageSize: number;
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
    page?: number;
    pageSize?: number;
    status?: string;
  }): Promise<InvoiceListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params?.status) queryParams.append('status', params.status);

      const url = `${API_URL}/invoices${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('🔵 INVOICES REQUEST:', url);

      const headers = await this.getAuthHeaders();
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

      const data = await response.json() as InvoiceListResponse;
      console.log('✅ INVOICES SUCCESS:', data.data?.length, 'invoices loaded');
      return data;
    } catch (error) {
      console.error('🔴 INVOICES SERVICE ERROR:', error);
      throw error;
    }
  }

  async payInvoice(invoiceId: string, paymentData: PayInvoiceRequest): Promise<Invoice> {
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

      const data = await response.json() as Invoice;
      console.log('✅ PAY INVOICE SUCCESS:', data.id);
      return data;
    } catch (error) {
      console.error('🔴 PAY INVOICE SERVICE ERROR:', error);
      throw error;
    }
  }
}

export default new InvoicesService();
