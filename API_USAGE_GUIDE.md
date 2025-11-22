# ATLAS Mobile - API Services Quick Reference

## 🚀 Quick Start

### Import Services
```typescript
import {
  authService,
  assetsService,
  bookingsService,
  conciergeService,
  invoicesService,
  notificationsService,
  paymentMethodsService,
  promotionsService,
  userSettingsService,
  signalrService,
} from '../services';
```

## 📚 Service Usage Examples

### 1. Assets Service
```typescript
// Get all available aircraft
const assets = await assetsService.getAssets({
  page: 1,
  pageSize: 10,
  type: 'Aircraft',
  isAvailable: true,
});

// Get specific asset details
const asset = await assetsService.getAssetById('asset-id');

// Create new asset (admin only)
const newAsset = await assetsService.createAsset({
  name: 'Gulfstream G650',
  type: 'Aircraft',
  category: 'AVIATION',
  description: 'Ultra-long-range business jet',
  capacity: 18,
  range: 7000,
  speed: 590,
  pricePerHour: 8500,
  isAvailable: true,
  features: ['WiFi', 'Bedroom', 'Shower'],
});
```

### 2. Bookings Service
```typescript
// Get user's bookings
const bookings = await bookingsService.getBookings({
  page: 1,
  pageSize: 20,
  status: 'Confirmed',
});

// Create new booking
const booking = await bookingsService.createBooking({
  assetId: 'asset-id',
  startDate: '2024-01-15T10:00:00Z',
  endDate: '2024-01-15T14:00:00Z',
  pickupLocation: 'London Luton Airport',
  dropoffLocation: 'Paris Le Bourget Airport',
  notes: 'CPO protection detail added',
});

// Confirm booking
await bookingsService.confirmBooking('booking-id');

// Cancel booking
await bookingsService.cancelBooking('booking-id', 'Change of plans');
```

### 3. Notifications Service
```typescript
// Get all notifications
const notifications = await notificationsService.getNotifications({
  page: 1,
  pageSize: 50,
  isRead: false,
});

// Get unread count (for badge)
const unreadCount = await notificationsService.getUnreadCount();

// Mark notification as read
await notificationsService.markAsRead('notification-id');

// Mark all as read
await notificationsService.markAllAsRead();
```

### 4. Concierge Service
```typescript
// Start new concierge session
const session = await conciergeService.startSession({
  subject: 'Special dining request',
  priority: 'High',
  initialMessage: 'Need reservation for 8 people at Michelin 3-star restaurant in Paris',
});

// Get session messages
const messages = await conciergeService.getSessionMessages(session.id);

// Send message in session
await conciergeService.sendMessage(session.id, {
  content: 'Can we get a private room?',
});
```

### 5. Payment Methods Service
```typescript
// Get all payment methods
const paymentMethods = await paymentMethodsService.getPaymentMethods();

// Add new payment method
const newCard = await paymentMethodsService.addPaymentMethod({
  type: 'CreditCard',
  provider: 'Visa',
  cardNumber: '4111111111111111',
  expiryMonth: 12,
  expiryYear: 2026,
  cvv: '123',
  holderName: 'John Doe',
  isDefault: true,
});

// Set default payment method
await paymentMethodsService.setDefaultPaymentMethod('payment-method-id');

// Deactivate payment method
await paymentMethodsService.deactivatePaymentMethod('payment-method-id');
```

### 6. Promotions Service
```typescript
// Get active promotions
const promotions = await promotionsService.getActivePromotions();

// Validate promo code
const validation = await promotionsService.validatePromoCode('ATLAS20', 10000);
if (validation.isValid) {
  console.log('Discount:', validation.discountAmount);
}

// Apply promotion to booking
await promotionsService.applyPromotion({
  code: 'ATLAS20',
  bookingId: 'booking-id',
});
```

### 7. Invoices Service
```typescript
// Get all invoices
const invoices = await invoicesService.getInvoices({
  page: 1,
  pageSize: 20,
  status: 'Pending',
});

// Pay invoice
await invoicesService.payInvoice('invoice-id', {
  paymentMethodId: 'payment-method-id',
});
```

### 8. User Settings Service
```typescript
// Get current settings
const settings = await userSettingsService.getSettings();

// Update security settings
await userSettingsService.updateSecuritySettings({
  twoFactorEnabled: true,
  sessionTimeout: 3600,
});

// Update app settings
await userSettingsService.updateAppSettings({
  theme: 'Dark',
  language: 'en',
  currency: 'USD',
});

// Update notification preferences
await userSettingsService.updatePreferences({
  emailNotifications: true,
  pushNotifications: true,
  bookingNotifications: true,
  promotionalNotifications: false,
});
```

### 9. SignalR Service (Real-time)
```typescript
// Start SignalR connection (automatically done on login in App.tsx)
await signalrService.start();

// Subscribe to notifications
const unsubscribe = signalrService.onNotification((notification) => {
  console.log('New notification:', notification.title);
  Alert.alert(notification.title, notification.message);
});

// Subscribe to booking status changes
const unsubscribeStatus = signalrService.onBookingStatusChanged((update) => {
  console.log('Booking status:', update.status);
  // Update UI accordingly
});

// Subscribe to specific booking
await signalrService.subscribeToBooking('booking-id');

// Cleanup when component unmounts
useEffect(() => {
  return () => {
    unsubscribe();
    unsubscribeStatus();
    signalrService.unsubscribeFromBooking('booking-id');
  };
}, []);

// Check connection state
const state = signalrService.getConnectionState();
console.log('Atlas hub:', state.atlas);
console.log('Notifications hub:', state.notifications);

// Stop SignalR (automatically done on logout in App.tsx)
await signalrService.stop();
```

## 🎯 React Component Integration Examples

### Example 1: Dashboard with Bookings
```typescript
import React, { useEffect, useState } from 'react';
import { bookingsService, notificationsService } from '../services';

const Dashboard: React.FC = () => {
  const [bookings, setBookings] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bookingsData, count] = await Promise.all([
        bookingsService.getBookings({ page: 1, pageSize: 10 }),
        notificationsService.getUnreadCount(),
      ]);
      
      setBookings(bookingsData.data);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text>Bookings: {bookings.length}</Text>
      <Text>Unread: {unreadCount}</Text>
      {/* Render bookings */}
    </View>
  );
};
```

### Example 2: Real-time Notifications
```typescript
import React, { useEffect, useState } from 'react';
import { notificationsService, signalrService } from '../services';

const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadNotifications();

    // Listen for real-time notifications
    const unsubscribe = signalrService.onNotification((notification) => {
      // Add new notification to the top
      setNotifications(prev => [notification, ...prev]);
    });

    return () => unsubscribe();
  }, []);

  const loadNotifications = async () => {
    const data = await notificationsService.getNotifications({
      page: 1,
      pageSize: 50,
    });
    setNotifications(data.data);
  };

  const markAsRead = async (id: string) => {
    await notificationsService.markAsRead(id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  return (
    <FlatList
      data={notifications}
      renderItem={({ item }) => (
        <NotificationItem
          notification={item}
          onPress={() => markAsRead(item.id)}
        />
      )}
    />
  );
};
```

### Example 3: Booking with Real-time Updates
```typescript
import React, { useEffect, useState } from 'react';
import { bookingsService, signalrService } from '../services';

const BookingDetails: React.FC<{ bookingId: string }> = ({ bookingId }) => {
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    // Subscribe to booking updates
    signalrService.subscribeToBooking(bookingId);

    const unsubscribeStatus = signalrService.onBookingStatusChanged((update) => {
      if (update.bookingId === bookingId) {
        setBooking(prev => ({ ...prev, status: update.status }));
      }
    });

    const unsubscribeUpdate = signalrService.onBookingUpdate((update) => {
      if (update.bookingId === bookingId) {
        // Update specific field
        setBooking(prev => ({ ...prev, [update.field]: update.newValue }));
      }
    });

    return () => {
      signalrService.unsubscribeFromBooking(bookingId);
      unsubscribeStatus();
      unsubscribeUpdate();
    };
  }, [bookingId]);

  return (
    <View>
      <Text>Status: {booking?.status}</Text>
      {/* Render booking details */}
    </View>
  );
};
```

## 🔐 Error Handling

All services throw errors with meaningful messages. Wrap calls in try-catch:

```typescript
try {
  const booking = await bookingsService.createBooking(data);
  Alert.alert('Success', 'Booking created!');
} catch (error: any) {
  Alert.alert('Error', error.message || 'Something went wrong');
  console.error('Booking error:', error);
}
```

## 📝 Console Logging

All services log detailed information:
- 🔵 **REQUEST**: URL and parameters
- 🔵 **RESPONSE STATUS**: HTTP status code
- 🔴 **ERROR**: Full error JSON response
- ✅ **SUCCESS**: Success message with key data

Check the console for debugging!

## 🎉 That's It!

All services are ready to use. They handle:
- ✅ Authentication headers automatically
- ✅ Token refresh via authService
- ✅ Error handling and logging
- ✅ TypeScript type safety
- ✅ Real-time updates via SignalR

Happy coding! 🚀
