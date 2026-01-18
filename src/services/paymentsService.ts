import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

const API_URL = Config.API_URL || 'http://localhost:5001/api';

// Types matching Atlas.Core backend DTOs
export interface PaymentIntentDto {
  id: string;
  stripePaymentIntentId: string;
  stripeClientSecret?: string;
  amount: number;
  currency: string;
  discountAmount?: number;
  totalAmount: number;
  status: string;
  failureReason?: string;
  bookingId?: string;
  invoiceId?: string;
  createdAt: string;
}

export interface CreatePaymentIntentRequest {
  amount: number;
  currency?: string;
  bookingId?: string;
  invoiceId?: string;
  stripeCustomerId?: string;
  paymentMethodId?: string;
  description?: string;
  discountAmount?: number;
  metadata?: Record<string, string>;
}

export interface ConfirmPaymentRequest {
  id: string;
  paymentMethodId?: string;
}

export interface CustomerDto {
  customerId: string;
  email: string;
  name?: string;
  phone?: string;
}

export interface CreateCustomerRequest {
  email: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, string>;
}

export interface SetupIntentDto {
  setupIntentId: string;
  clientSecret?: string;
}

export interface CreateSetupIntentRequest {
  customerId?: string;
}

export interface RefundRequest {
  id: string;
  amount?: number;
  reason?: string;
}

class PaymentsService {
  private getAuthHeader = async (): Promise<string> => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) throw new Error('No authentication token found');
    return `Bearer ${token}`;
  };

  private handleError = async (response: Response): Promise<Error> => {
    let errorMessage = 'An error occurred';

    if (response.headers.get('content-type')?.includes('application/json')) {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.title || errorMessage;
    }

    const error = new Error(errorMessage);
    (error as any).status = response.status;
    return error;
  };

  /**
   * Create a payment intent
   */
  async createPaymentIntent(request: CreatePaymentIntentRequest): Promise<PaymentIntentDto> {
    const authHeader = await this.getAuthHeader();

    const response = await fetch(`${API_URL}/payments/intents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Get a payment intent by ID
   */
  async getPaymentIntent(id: string): Promise<PaymentIntentDto> {
    const authHeader = await this.getAuthHeader();

    const response = await fetch(`${API_URL}/payments/intents/${id}`, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Get user payment history
   */
  async getPaymentHistory(): Promise<PaymentIntentDto[]> {
    const authHeader = await this.getAuthHeader();

    const response = await fetch(`${API_URL}/payments/history`, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Confirm a payment intent
   */
  async confirmPayment(request: ConfirmPaymentRequest): Promise<PaymentIntentDto> {
    const authHeader = await this.getAuthHeader();

    const response = await fetch(`${API_URL}/payments/intents/${request.id}/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({ paymentMethodId: request.paymentMethodId }),
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Create a Stripe customer
   */
  async createCustomer(request: CreateCustomerRequest): Promise<CustomerDto> {
    const authHeader = await this.getAuthHeader();

    const response = await fetch(`${API_URL}/payments/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Create a setup intent for saving payment methods
   */
  async createSetupIntent(request?: CreateSetupIntentRequest): Promise<SetupIntentDto> {
    const authHeader = await this.getAuthHeader();

    const response = await fetch(`${API_URL}/payments/setup-intents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(request || {}),
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Process a refund
   */
  async refundPayment(request: RefundRequest): Promise<void> {
    const authHeader = await this.getAuthHeader();

    const response = await fetch(`${API_URL}/payments/${request.id}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: request.amount,
        reason: request.reason,
      }),
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }
  }

  /**
   * Get payment status display text
   */
  getPaymentStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      Pending: 'Pending',
      Processing: 'Processing',
      Completed: 'Completed',
      Failed: 'Failed',
      Cancelled: 'Cancelled',
      Refunded: 'Refunded',
    };

    return statusMap[status] || status;
  }

  /**
   * Get payment status color
   */
  getPaymentStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      Pending: '#FFA500', // Orange
      Processing: '#2196F3', // Blue
      Completed: '#4CAF50', // Green
      Failed: '#F44336', // Red
      Cancelled: '#9E9E9E', // Gray
      Refunded: '#9C27B0', // Purple
    };

    return colorMap[status] || '#000000';
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  }
}

export default new PaymentsService();
