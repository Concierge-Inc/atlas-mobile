import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Config.API_URL || 'http://localhost:5001/api';

export interface Asset {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string;
  capacity: number;
  range: number;
  speed: number;
  pricePerHour: number;
  isAvailable: boolean;
  imageUrl?: string;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AssetListResponse {
  data: Asset[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CreateAssetRequest {
  name: string;
  type: string;
  category: string;
  description: string;
  capacity: number;
  range: number;
  speed: number;
  pricePerHour: number;
  isAvailable: boolean;
  imageUrl?: string;
  features: string[];
}

class AssetsService {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getAssets(params?: {
    page?: number;
    pageSize?: number;
    type?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    isAvailable?: boolean;
  }): Promise<AssetListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params?.type) queryParams.append('type', params.type);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
      if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
      if (params?.isAvailable !== undefined) queryParams.append('isAvailable', params.isAvailable.toString());

      const url = `${API_URL}/assets${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('🔵 ASSETS REQUEST:', url);

      const headers = await this.getAuthHeaders();
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

      const data = await response.json() as AssetListResponse;
      console.log('✅ ASSETS SUCCESS:', data.data?.length, 'assets loaded');
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

      const headers = await this.getAuthHeaders();
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

  async createAsset(assetData: CreateAssetRequest): Promise<Asset> {
    try {
      const url = `${API_URL}/assets`;
      console.log('🔵 CREATE ASSET REQUEST:', url, assetData);

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(assetData),
      });

      console.log('🔵 CREATE ASSET RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const errorData = await response.json() as any;
        console.log('🔴 CREATE ASSET ERROR:', JSON.stringify(errorData, null, 2));
        throw new Error(errorData.message || 'Failed to create asset');
      }

      const data = await response.json() as Asset;
      console.log('✅ CREATE ASSET SUCCESS:', data.name);
      return data;
    } catch (error) {
      console.error('🔴 CREATE ASSET SERVICE ERROR:', error);
      throw error;
    }
  }
}

export default new AssetsService();
