import { UserDto } from '../services/authService';
import { Booking, BookingStatus, MoneyDto } from '../services/bookingsService';
import { AssetListDto } from '../services/assetsService';
import { Notification } from '../services/notificationsService';

// Mock User Data
export const MOCK_GUEST_USER: UserDto = {
  id: 'guest-user-id',
  email: 'guest@atlas.com',
  firstName: 'Guest',
  lastName: 'User',
  phoneNumber: undefined,
  avatarUrl: undefined,
  isEmailVerified: false,
  roles: ['Guest'],
};

// Mock Money Helper
const createMoney = (amount: number, currency: string = 'USD'): MoneyDto => ({
  amount,
  currency,
});

// Mock Assets by Category (from atlas-web-reference)
export const MOCK_ASSETS: { [key: string]: AssetListDto[] } = {
  AVIATION: [
    {
      id: 'avi-1',
      name: 'Airbus H130',
      category: 'AVIATION',
      imageUrl: 'https://picsum.photos/800/600?grayscale',
      hourlyRate: createMoney(2200),
      isAvailable: true,
    },
    {
      id: 'avi-2',
      name: 'Pilatus PC-12 NGX',
      category: 'AVIATION',
      imageUrl: 'https://picsum.photos/801/600?grayscale',
      hourlyRate: createMoney(3500),
      isAvailable: true,
    },
  ],
  CHAUFFEUR: [
    {
      id: 'chauf-1',
      name: 'Mercedes-Maybach S-Class',
      category: 'CHAUFFEUR',
      imageUrl: 'https://picsum.photos/802/600?grayscale',
      hourlyRate: createMoney(150),
      isAvailable: true,
    },
    {
      id: 'chauf-2',
      name: 'Range Rover Autobiography',
      category: 'CHAUFFEUR',
      imageUrl: 'https://picsum.photos/803/600?grayscale',
      hourlyRate: createMoney(180),
      isAvailable: true,
    },
  ],
  ARMOURED: [
    {
      id: 'arm-1',
      name: 'Toyota Land Cruiser 300 (B6)',
      category: 'ARMOURED',
      imageUrl: 'https://picsum.photos/804/600?grayscale',
      hourlyRate: createMoney(450),
      isAvailable: true,
    },
    {
      id: 'arm-2',
      name: 'Cadillac Escalade (B7)',
      category: 'ARMOURED',
      imageUrl: 'https://picsum.photos/805/600?grayscale',
      hourlyRate: createMoney(750),
      isAvailable: false,
    },
  ],
  PROTECTION: [
    {
      id: 'prot-1',
      name: 'Close Protection Officer (CPO)',
      category: 'PROTECTION',
      imageUrl: 'https://picsum.photos/806/600?grayscale',
      hourlyRate: createMoney(120),
      isAvailable: true,
    },
    {
      id: 'prot-2',
      name: 'Tactical Support Team',
      category: 'PROTECTION',
      imageUrl: 'https://picsum.photos/807/600?grayscale',
      hourlyRate: createMoney(500),
      isAvailable: true,
    },
  ],
};

// Mock Bookings
export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'booking-1',
    bookingNumber: 'ATL-2024-001',
    assetName: 'Gulfstream G650ER',
    serviceType: 0,
    status: BookingStatus.Confirmed,
    serviceDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    pickupLocation: 'Teterboro Airport, NJ',
    dropoffLocation: 'London Luton Airport, UK',
    estimatedCost: createMoney(85000),
  },
  {
    id: 'booking-2',
    bookingNumber: 'ATL-2024-002',
    assetName: 'Mercedes-Benz S-Class',
    serviceType: 1,
    status: BookingStatus.Active,
    serviceDate: new Date().toISOString(),
    pickupLocation: 'The Ritz-Carlton, New York',
    dropoffLocation: 'JFK Airport',
    estimatedCost: createMoney(450),
  },
  {
    id: 'booking-3',
    bookingNumber: 'ATL-2024-003',
    assetName: 'Range Rover Sentinel',
    serviceType: 2,
    status: BookingStatus.Completed,
    serviceDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    pickupLocation: 'Dubai International Airport',
    dropoffLocation: 'Burj Al Arab',
    estimatedCost: createMoney(2500),
  },
  {
    id: 'booking-4',
    bookingNumber: 'ATL-2024-004',
    assetName: 'Executive Protection Team - Alpha',
    serviceType: 3,
    status: BookingStatus.Pending,
    serviceDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    pickupLocation: 'Conference Center, Geneva',
    dropoffLocation: 'Hotel Beau-Rivage, Geneva',
    estimatedCost: createMoney(6000),
  },
];

// Mock Notifications
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    type: 'BookingConfirmed',
    title: 'Booking Confirmed',
    text: 'Your aviation service ATL-2024-001 has been confirmed.',
    isUrgent: false,
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-2',
    type: 'General',
    title: 'Upcoming Service',
    text: 'Your chauffeur service is scheduled for today at 3:00 PM.',
    isUrgent: true,
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-3',
    type: 'General',
    title: 'Welcome to ATLAS',
    text: 'Thank you for choosing ATLAS Global Private Services. Your account is ready.',
    isUrgent: false,
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-4',
    type: 'General',
    title: 'Service Completed',
    text: 'Your armoured transport service has been completed. Please rate your experience.',
    isUrgent: false,
    isRead: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Helper functions to get mock data
export const getMockAssets = (category?: string): AssetListDto[] => {
  if (category && MOCK_ASSETS[category]) {
    return MOCK_ASSETS[category];
  }
  // Return all assets if no category specified
  return Object.values(MOCK_ASSETS).flat();
};

export const getMockBookings = (status?: BookingStatus): Booking[] => {
  if (status !== undefined) {
    return MOCK_BOOKINGS.filter(b => b.status === status);
  }
  return MOCK_BOOKINGS;
};

export const getMockNotifications = (): Notification[] => {
  return MOCK_NOTIFICATIONS;
};

export const getMockUnreadCount = (): number => {
  return MOCK_NOTIFICATIONS.filter(n => !n.isRead).length;
};
