import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Config.API_URL || 'http://localhost:5001/api';

export interface Promotion {
  id: string;
  title: string;
  description: string;
  promoCode: string;
  startDate: string;
  endDate: string;
  discountType: number; // DiscountType enum: 0=Percentage, 1=Fixed
  discountValue?: number;
  serviceCategory?: number; // ServiceCategory enum
  maxRedemptions?: number;
  currentRedemptions: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromotionRequest {
  title: string;
  description: string;
  promoCode: string;
  startDate: string;
  endDate: string;
  discountType: number;
  discountValue?: number;
  serviceCategory?: number;
  maxRedemptions?: number;
}

class PromotionsService {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getActivePromotions(category?: number): Promise<Promotion[]> {
    try {
      const queryParams = new URLSearchParams();
      if (category !== undefined) queryParams.append('category', category.toString());
      
      const url = `${API_URL}/promotions/active${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('🔵 ACTIVE PROMOTIONS REQUEST:', url);

      const token = await AsyncStorage.getItem('accessToken');
      const headers: Record<string, string> = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log('🔵 ACTIVE PROMOTIONS RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 ACTIVE PROMOTIONS ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to fetch active promotions');
      }

      const data = await response.json() as Promotion[];
      console.log('✅ ACTIVE PROMOTIONS SUCCESS:', data.length, 'promotions loaded');
      return data;
    } catch (error) {
      console.error('🔴 ACTIVE PROMOTIONS SERVICE ERROR:', error);
      throw error;
    }
  }

  async validatePromoCode(code: string): Promise<Promotion> {
    try {
      const url = `${API_URL}/promotions/validate/${code}`;
      console.log('🔵 VALIDATE PROMO CODE REQUEST:', url);

      const token = await AsyncStorage.getItem('accessToken');
      const headers: Record<string, string> = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log('🔵 VALIDATE PROMO CODE RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 VALIDATE PROMO CODE ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to validate promo code');
      }

      const data = await response.json() as Promotion;
      console.log('✅ VALIDATE PROMO CODE SUCCESS:', data.code);
      return data;
    } catch (error) {
      console.error('🔴 VALIDATE PROMO CODE SERVICE ERROR:', error);
      throw error;
    }
  }

  async applyPromotion(promoCode: string, originalAmount: number): Promise<number> {
    try {
      const url = `${API_URL}/promotions/apply`;
      const requestData = { promoCode, originalAmount };
      console.log('🔵 APPLY PROMOTION REQUEST:', url, requestData);

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestData),
      });

      console.log('🔵 APPLY PROMOTION RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 APPLY PROMOTION ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to apply promotion');
      }

      const data = await response.json() as { discountedAmount: number };
      console.log('✅ APPLY PROMOTION SUCCESS:', data.discountedAmount);
      return data.discountedAmount;
    } catch (error) {
      console.error('🔴 APPLY PROMOTION SERVICE ERROR:', error);
      throw error;
    }
  }

  async createPromotion(promotionData: CreatePromotionRequest): Promise<Promotion> {
    try {
      const url = `${API_URL}/promotions`;
      console.log('🔵 CREATE PROMOTION REQUEST:', url, promotionData);

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(promotionData),
      });

      console.log('🔵 CREATE PROMOTION RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 CREATE PROMOTION ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to create promotion');
      }

      const data = await response.json() as Promotion;
      console.log('✅ CREATE PROMOTION SUCCESS:', data.code);
      return data;
    } catch (error) {
      console.error('🔴 CREATE PROMOTION SERVICE ERROR:', error);
      throw error;
    }
  }
}

export default new PromotionsService();
