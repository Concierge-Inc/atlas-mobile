export type ServiceCategory = 'AVIATION' | 'CHAUFFEUR' | 'ARMOURED' | 'PROTECTION';

export interface AssetSpecs {
  speed?: string;
  range?: string;
  passengers: number;
  luggage?: string;
  ballisticGrade?: string; // B6, B7
  languages?: string[];
  specialties?: string[];
}

export interface Asset {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  specs: AssetSpecs;
  image: string;
  hourlyRateUSD: number;
  available: boolean;
}

export interface BookingRequest {
  id: string;
  serviceType: ServiceCategory;
  assetId: string;
  date: string;
  pickupLocation: string;
  dropoffLocation: string; // or Duration
  includeProtection: boolean;
  status: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: Date;
}

export enum ViewState {
  HOME = 'HOME',
  BOOKING_FLOW = 'BOOKING_FLOW',
  CONCIERGE = 'CONCIERGE',
  PROFILE = 'PROFILE'
}
