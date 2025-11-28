import { UserDto } from '../services/authService';
import { Booking, BookingStatus, MoneyDto, ServiceCategory } from '../services/bookingsService';
import { AssetListDto } from '../services/assetsService';
import { Notification, NotificationType } from '../services/notificationsService';
import { PaymentMethod } from '../services/paymentMethodsService';
import { Invoice, InvoiceStatus } from '../services/invoicesService';
import { Promotion } from '../services/promotionsService';

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
      category: ServiceCategory.Aviation,
      imageUrl: 'https://picsum.photos/800/600?grayscale',
      hourlyRate: createMoney(2200),
      isAvailable: true,
    },
    {
      id: 'avi-2',
      name: 'Pilatus PC-12 NGX',
      category: ServiceCategory.Aviation,
      imageUrl: 'https://picsum.photos/801/600?grayscale',
      hourlyRate: createMoney(3500),
      isAvailable: true,
    },
  ],
  CHAUFFEUR: [
    {
      id: 'chauf-1',
      name: 'Mercedes-Maybach S-Class',
      category: ServiceCategory.Chauffeur,
      imageUrl: 'https://picsum.photos/802/600?grayscale',
      hourlyRate: createMoney(150),
      isAvailable: true,
    },
    {
      id: 'chauf-2',
      name: 'Range Rover Autobiography',
      category: ServiceCategory.Chauffeur,
      imageUrl: 'https://picsum.photos/803/600?grayscale',
      hourlyRate: createMoney(180),
      isAvailable: true,
    },
  ],
  ARMOURED: [
    {
      id: 'arm-1',
      name: 'Toyota Land Cruiser 300 (B6)',
      category: ServiceCategory.Armoured,
      imageUrl: 'https://picsum.photos/804/600?grayscale',
      hourlyRate: createMoney(450),
      isAvailable: true,
    },
    {
      id: 'arm-2',
      name: 'Cadillac Escalade (B7)',
      category: ServiceCategory.Armoured,
      imageUrl: 'https://picsum.photos/805/600?grayscale',
      hourlyRate: createMoney(750),
      isAvailable: false,
    },
  ],
  PROTECTION: [
    {
      id: 'prot-1',
      name: 'Close Protection Officer (CPO)',
      category: ServiceCategory.Protection,
      imageUrl: 'https://picsum.photos/806/600?grayscale',
      hourlyRate: createMoney(120),
      isAvailable: true,
    },
    {
      id: 'prot-2',
      name: 'Tactical Support Team',
      category: ServiceCategory.Protection,
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
    type: NotificationType.BookingConfirmed,
    title: 'Booking Confirmed',
    text: 'Your aviation service ATL-2024-001 has been confirmed.',
    isUrgent: false,
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-2',
    type: NotificationType.General,
    title: 'Upcoming Service',
    text: 'Your chauffeur service is scheduled for today at 3:00 PM.',
    isUrgent: true,
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-3',
    type: NotificationType.General,
    title: 'Welcome to ATLAS',
    text: 'Thank you for choosing ATLAS Global Private Services. Your account is ready.',
    isUrgent: false,
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-4',
    type: NotificationType.General,
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

// Mock Payment Methods
export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pm-1',
    userId: 'guest-user-id',
    type: 0, // CreditCard
    cardType: 'American Express',
    last4Digits: '8849',
    expiryMonth: 9,
    expiryYear: 2028,
    cardHolderName: 'Guest User',
    isDefault: true,
    isActive: true,
    isExpired: false,
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock Invoices
export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2024-001',
    userId: 'guest-user-id',
    bookingId: 'booking-1',
    serviceDescription: 'Aviation Service - Gulfstream G650ER',
    amount: createMoney(93500),
    invoiceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: InvoiceStatus.Paid,
    paidAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    paymentReference: 'PAY-2024-001',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2024-002',
    userId: 'guest-user-id',
    bookingId: 'booking-3',
    serviceDescription: 'Armoured Transport - Range Rover Sentinel',
    amount: createMoney(2750),
    invoiceDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: InvoiceStatus.Paid,
    paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    paymentReference: 'PAY-2024-002',
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2024-003',
    userId: 'guest-user-id',
    bookingId: 'booking-4',
    serviceDescription: 'Protection Services - Executive Team Alpha',
    amount: createMoney(6600),
    invoiceDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString(),
    status: InvoiceStatus.Pending,
  },
];

export const getMockPaymentMethods = (): PaymentMethod[] => {
  return MOCK_PAYMENT_METHODS;
};

export const getMockInvoices = (): Invoice[] => {
  return MOCK_INVOICES;
};

// Mock Promotions - For Guest Preview Only (not redeemable)
export const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: 'promo-mock-1',
    title: 'Sample Aviation Offer',
    description: 'This is a sample promotion. Create an account to view real offers and exclusive benefits.',
    promoCode: 'DEMO-GUEST-ONLY',
    startDate: new Date(2024, 10, 1).toISOString(),
    endDate: new Date(2025, 11, 31).toISOString(),
    discountType: 0, // Percentage
    discountValue: 15,
    serviceCategory: 0, // Aviation
    maxRedemptions: 0,
    currentRedemptions: 0,
    isActive: false, // Not active for guests
    createdAt: new Date(2024, 10, 1).toISOString(),
    updatedAt: new Date(2024, 10, 1).toISOString(),
  },
  {
    id: 'promo-mock-2',
    title: 'Sample Transport Discount',
    description: 'Sign up to unlock real promotions and special member-only benefits.',
    promoCode: 'DEMO-PREVIEW',
    startDate: new Date(2024, 11, 1).toISOString(),
    endDate: new Date(2025, 11, 31).toISOString(),
    discountType: 0, // Percentage
    discountValue: 20,
    serviceCategory: 2, // Armoured
    maxRedemptions: 0,
    currentRedemptions: 0,
    isActive: false, // Not active for guests
    createdAt: new Date(2024, 11, 1).toISOString(),
    updatedAt: new Date(2024, 11, 1).toISOString(),
  },
];

export const getMockPromotions = (): Promotion[] => {
  return MOCK_PROMOTIONS;
};
