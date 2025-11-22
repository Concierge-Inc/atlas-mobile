import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Config.API_URL || 'http://localhost:5001/api';

// Booking status enum (matches backend)
export enum BookingStatus {
  Pending = 0,
  Confirmed = 1,
  Active = 2,
  Completed = 3,
  Cancelled = 4
}

export interface MoneyDto {
  amount: number;
  currency: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  assetName: string;
  serviceType: number;
  status: 'Pending' | 'Confirmed' | 'Active' | 'Completed' | 'Cancelled';
  serviceDate: string;
  pickupLocation: string;
  dropoffLocation: string;
  estimatedCost: MoneyDto | null;
}

export interface BookingListResponse {
  data: Booking[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CreateBookingRequest {
  assetId: string;
  serviceDate: string;
  serviceTime?: string;
  pickupLocation: string;
  dropoffLocation: string;
  includeProtection?: boolean;
  notes?: string;
}

class BookingsService {
  private async getAuthHeaders(includeContentType: boolean = true): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem('accessToken');
    return {
      ...(includeContentType ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getBookings(params?: {
    status?: number;
  }): Promise<Booking[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status !== undefined) queryParams.append('status', params.status.toString());

      const url = `${API_URL}/bookings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('🔵 BOOKINGS REQUEST:', url);

      const headers = await this.getAuthHeaders(false); // GET request, no Content-Type needed
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log('🔵 BOOKINGS RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 BOOKINGS ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to fetch bookings');
      }

      const data = await response.json() as Booking[];
      console.log('✅ BOOKINGS SUCCESS:', data.length, 'bookings loaded');
      return data;
    } catch (error) {
      console.error('🔴 BOOKINGS SERVICE ERROR:', error);
      throw error;
    }
  }

  async createBooking(bookingData: CreateBookingRequest): Promise<string> {
    try {
      const url = `${API_URL}/bookings`;
      console.log('🔵 CREATE BOOKING REQUEST:', url, bookingData);

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(bookingData),
      });

      console.log('🔵 CREATE BOOKING RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 CREATE BOOKING ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to create booking');
      }

      const bookingId = await response.json() as string;
      console.log('✅ CREATE BOOKING SUCCESS:', bookingId);
      return bookingId;
    } catch (error) {
      console.error('🔴 CREATE BOOKING SERVICE ERROR:', error);
      throw error;
    }
  }

  async confirmBooking(bookingId: string): Promise<Booking> {
    try {
      const url = `${API_URL}/bookings/${bookingId}/confirm`;
      console.log('🔵 CONFIRM BOOKING REQUEST:', url);

      const headers = await this.getAuthHeaders(false); // POST with no body
      const response = await fetch(url, {
        method: 'POST',
        headers,
      });

      console.log('🔵 CONFIRM BOOKING RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 CONFIRM BOOKING ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to confirm booking');
      }

      const data = await response.json() as Booking;
      console.log('✅ CONFIRM BOOKING SUCCESS:', data.id);
      return data;
    } catch (error) {
      console.error('🔴 CONFIRM BOOKING SERVICE ERROR:', error);
      throw error;
    }
  }

  async cancelBooking(bookingId: string, reason?: string): Promise<Booking> {
    try {
      const url = `${API_URL}/bookings/${bookingId}/cancel`;
      console.log('🔵 CANCEL BOOKING REQUEST:', url, { reason });

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ reason }),
      });

      console.log('🔵 CANCEL BOOKING RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 CANCEL BOOKING ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to cancel booking');
      }

      const data = await response.json() as Booking;
      console.log('✅ CANCEL BOOKING SUCCESS:', data.id);
      return data;
    } catch (error) {
      console.error('🔴 CANCEL BOOKING SERVICE ERROR:', error);
      throw error;
    }
  }
}

export default new BookingsService();
