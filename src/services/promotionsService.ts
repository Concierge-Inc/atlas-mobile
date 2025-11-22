import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Config.API_URL || 'http://localhost:5001/api';

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: 'Percentage' | 'Fixed';
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  applicableAssetTypes?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ValidatePromotionResponse {
  isValid: boolean;
  promotion?: Promotion;
  discountAmount?: number;
  message: string;
}

export interface ApplyPromotionRequest {
  code: string;
  bookingId: string;
}

export interface CreatePromotionRequest {
  code: string;
  name: string;
  description: string;
  discountType: 'Percentage' | 'Fixed';
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  isActive: boolean;
  applicableAssetTypes?: string[];
}

class PromotionsService {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getActivePromotions(): Promise<Promotion[]> {
    try {
      const url = `${API_URL}/promotions/active`;
      console.log('🔵 ACTIVE PROMOTIONS REQUEST:', url);

      const headers = await this.getAuthHeaders();
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

  async validatePromoCode(code: string, amount: number): Promise<ValidatePromotionResponse> {
    try {
      const url = `${API_URL}/promotions/validate/${code}?amount=${amount}`;
      console.log('🔵 VALIDATE PROMO CODE REQUEST:', url);

      const headers = await this.getAuthHeaders();
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

      const data = await response.json() as ValidatePromotionResponse;
      console.log('✅ VALIDATE PROMO CODE SUCCESS:', data.isValid);
      return data;
    } catch (error) {
      console.error('🔴 VALIDATE PROMO CODE SERVICE ERROR:', error);
      throw error;
    }
  }

  async applyPromotion(applyData: ApplyPromotionRequest): Promise<void> {
    try {
      const url = `${API_URL}/promotions/apply`;
      console.log('🔵 APPLY PROMOTION REQUEST:', url, applyData);

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(applyData),
      });

      console.log('🔵 APPLY PROMOTION RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 APPLY PROMOTION ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to apply promotion');
      }

      console.log('✅ APPLY PROMOTION SUCCESS');
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
