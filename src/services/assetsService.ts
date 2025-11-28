import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Config.API_URL || 'http://localhost:5001/api';

export interface MoneyDto {
  amount: number;
  currency: string;
}

export interface AssetSpecsDto {
  speed?: string;
  range?: string;
  passengerCapacity?: number;
  luggageCapacity?: string;
  ballisticGrade?: string;
  languages?: string[];
  specialties?: string[];
}

export enum ServiceCategory {
  Aviation = 0,
  Chauffeur = 1,
  Armoured = 2,
  Protection = 3
}

export interface Asset {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  imageUrl?: string;
  hourlyRate: MoneyDto;
  isAvailable: boolean;
  specs?: AssetSpecsDto;
  createdAt: string;
}

export interface AssetListDto {
  id: string;
  name: string;
  category: ServiceCategory;
  imageUrl?: string;
  hourlyRate: MoneyDto;
  isAvailable: boolean;
}

class AssetsService {
  async getAssets(params?: {
    category?: number;
    isAvailable?: boolean;
  }): Promise<AssetListDto[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.category !== undefined) queryParams.append('category', params.category.toString());
      if (params?.isAvailable !== undefined) queryParams.append('isAvailable', params.isAvailable.toString());

      const url = `${API_URL}/assets${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('🔵 ASSETS REQUEST:', url);

      const token = await AsyncStorage.getItem('accessToken');
      const headers: Record<string, string> = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log('🔵 ASSETS RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 ASSETS ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to fetch assets');
      }

      const data = await response.json() as AssetListDto[];
      console.log('✅ ASSETS SUCCESS:', data.length, 'assets loaded');
      return data;
    } catch (error) {
      console.error('🔴 ASSETS SERVICE ERROR:', error);
      throw error;
    }
  }

  async getAssetById(id: string): Promise<Asset> {
    try {
      const url = `${API_URL}/assets/${id}`;
      console.log('🔵 ASSET DETAIL REQUEST:', url);

      const token = await AsyncStorage.getItem('accessToken');
      const headers: Record<string, string> = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log('🔵 ASSET DETAIL RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 ASSET DETAIL ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to fetch asset details');
      }

      const data = await response.json() as Asset;
      console.log('✅ ASSET DETAIL SUCCESS:', data.name);
      return data;
    } catch (error) {
      console.error('🔴 ASSET DETAIL SERVICE ERROR:', error);
      throw error;
    }
  }
}

export default new AssetsService();
