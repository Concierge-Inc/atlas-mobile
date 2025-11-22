import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { ServiceCategory } from '../utils/types';
import bookingsService, { Booking as ApiBooking } from '../services/bookingsService';
import signalrService from '../services/signalrService';

const { width } = Dimensions.get('window');

interface BookingTrackerProps {
  onChat: () => void;
}

const BookingTracker: React.FC<BookingTrackerProps> = ({ onChat }) => {
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PAST' | 'CANCELLED'>('UPCOMING');
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();

    // Subscribe to real-time booking updates
    const unsubscribeStatus = signalrService.onBookingStatusChanged((update) => {
      console.log('Booking status changed:', update);
      // Reload bookings when status changes
      loadBookings();
    });

    const unsubscribeUpdate = signalrService.onBookingUpdate((update) => {
      console.log('Booking updated:', update);
      // Reload bookings when updated
      loadBookings();
    });

    return () => {
      unsubscribeStatus();
      unsubscribeUpdate();
    };
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const bookings = await bookingsService.getBookings();
      setBookings(bookings);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getBookingStatus = (booking: ApiBooking): 'UPCOMING' | 'PAST' | 'CANCELLED' => {
    if (booking.status === 4) return 'CANCELLED'; // Cancelled
    if (booking.status === 3) return 'PAST'; // Completed
    return 'UPCOMING';
  };

  const getStatusText = (status: number): string => {
    // Map the status enum number to readable text
    switch (status) {
      case 0:
        return 'Pending';
      case 1:
        return 'Confirmed';
      case 2:
        return 'Active';
      case 3:
        return 'Completed';
      case 4:
        return 'Cancelled';
      default:
        return `Status ${status}`; // fallback
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if today
    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    }
    // Check if tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    // Format as "14 Nov"
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency, 
      maximumFractionDigits: 0 
    }).format(amount);

  const filteredBookings = (bookings || []).filter(b => getBookingStatus(b) === activeTab);

  const getIcon = (assetName: string): string => {
    // Try to determine icon from asset name
    if (assetName.toLowerCase().includes('aircraft') || assetName.toLowerCase().includes('jet')) {
      return 'compass';
    }
    if (assetName.toLowerCase().includes('vehicle') || assetName.toLowerCase().includes('car')) {
      return 'truck';
    }
    if (assetName.toLowerCase().includes('armoured') || assetName.toLowerCase().includes('armor')) {
      return 'shield';
    }
    return 'user-check';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return '#fff';
      case 'PAST':
        return '#525252';
      case 'CANCELLED':
        return '#7f1d1d';
      default:
        return '#737373';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MISSION LOG</Text>
        <View style={styles.tabs}>
          {(['UPCOMING', 'PAST', 'CANCELLED'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={styles.tab}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab ? styles.tabTextActive : styles.tabTextInactive
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={width * 0.75 + 16}
        decelerationRate="fast"
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Loading bookings...</Text>
          </View>
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={styles.iconContainer}>
                    <Icon 
                      name={getIcon(booking.assetName)} 
                      size={16} 
                      color="#a3a3a3" 
                    />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.serviceType} numberOfLines={2}>{booking.assetName}</Text>
                    <Text style={styles.bookingId}>#{booking.id.slice(0, 8)}</Text>
                  </View>
                </View>
                
                <View style={styles.statusBadge}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(getBookingStatus(booking)) }
                  ]} />
                  <Text style={styles.statusLabel}>{getStatusText(booking.status)}</Text>
                </View>
              </View>

              {/* Title */}
              <Text style={styles.bookingTitle}>
                {booking.pickupLocation} → {booking.dropoffLocation}
              </Text>

              {/* Details */}
              <View style={styles.details}>
                <View style={styles.detailRow}>
                  <Icon name="clock" size={12} color="#737373" />
                  <Text style={styles.detailText}>
                    {formatDate(booking.serviceDate)} • {formatTime(booking.serviceDate)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="map-pin" size={12} color="#737373" />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {booking.pickupLocation}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="dollar-sign" size={12} color="#737373" />
                  <Text style={styles.detailText}>
                    {(() => {
                      console.log('💰 CPO Badge - estimatedCost:', booking.estimatedCost);
                      console.log('💰 CPO Badge - amount:', booking.estimatedCost?.amount);
                      console.log('💰 CPO Badge - currency:', booking.estimatedCost?.currency);
                      console.log('💰 CPO Badge - formatted:', booking.estimatedCost ? formatCurrency(booking.estimatedCost.amount, booking.estimatedCost.currency) : 'TBD');
                      return booking.estimatedCost ? formatCurrency(booking.estimatedCost.amount, booking.estimatedCost.currency) : 'TBD';
                    })()}
                  </Text>
                </View>
                {booking.bookingNumber && (
                  <View style={styles.detailRow}>
                    <Icon name="info" size={12} color="#737373" />
                    <Text style={styles.detailText} numberOfLines={2}>
                      Ref: {booking.bookingNumber}
                    </Text>
                  </View>
                )}
              </View>

              {/* Chat Button */}
              <TouchableOpacity
                style={styles.chatButton}
                onPress={onChat}
              >
                <Icon name="message-square" size={12} color="#000" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="activity" size={16} color="#404040" />
            <Text style={styles.emptyText}>NO ACTIVITY LOGGED</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    marginBottom: 32,
  },
  header: {
    paddingHorizontal: 32,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 9,
    color: '#737373',
    letterSpacing: 2.5,
    fontWeight: '700',
  },
  tabs: {
    flexDirection: 'row',
    gap: 16,
  },
  tab: {
    paddingVertical: 4,
  },
  tabText: {
    fontSize: 8,
    letterSpacing: 2,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  tabTextInactive: {
    color: '#404040',
  },
  scrollContent: {
    paddingHorizontal: 32,
    gap: 16,
  },
  bookingCard: {
    width: width * 0.75,
    backgroundColor: 'rgba(23,23,23,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(38,38,38,0.8)',
    padding: 20,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  iconContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#262626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceType: {
    fontSize: 8,
    color: '#525252',
    letterSpacing: 2,
    fontWeight: '600',
    marginBottom: 2,
  },
  bookingId: {
    fontSize: 8,
    color: '#a3a3a3',
    fontFamily: 'Courier New',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(23,23,23,0.5)',
    flexShrink: 0,
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  statusLabel: {
    fontSize: 8,
    color: '#d4d4d4',
    letterSpacing: 2,
    fontWeight: '600',
  },
  bookingTitle: {
    fontSize: 14,
    color: '#e5e5e5',
    fontWeight: '500',
    letterSpacing: 0.8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  details: {
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(38,38,38,0.5)',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  detailText: {
    fontSize: 9,
    color: '#737373',
    fontFamily: 'Courier New',
  },
  loadingContainer: {
    width: width * 0.75,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 11,
    color: '#737373',
    letterSpacing: 1.5,
  },
  chatButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    width: width - 64,
    paddingVertical: 32,
    borderWidth: 1,
    borderColor: '#262626',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 9,
    color: '#525252',
    letterSpacing: 2,
    fontWeight: '600',
  },
});

export default BookingTracker;
