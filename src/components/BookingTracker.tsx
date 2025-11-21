import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { ServiceCategory } from '../utils/types';

const { width } = Dimensions.get('window');

interface Booking {
  id: string;
  service: ServiceCategory;
  title: string;
  date: string;
  time: string;
  status: 'UPCOMING' | 'PAST' | 'CANCELLED';
  location: string;
  statusLabel: string;
}

const MOCK_BOOKINGS: Booking[] = [
  {
    id: '1',
    service: 'AVIATION',
    title: 'Geneva Executive Transfer',
    date: 'Tomorrow',
    time: '09:00 CET',
    status: 'UPCOMING',
    location: 'LSGG Private Terminal',
    statusLabel: 'Confirmed'
  },
  {
    id: '2',
    service: 'ARMOURED',
    title: 'Diplomatic Convoy',
    date: '14 Nov',
    time: '18:30 SAST',
    status: 'UPCOMING',
    location: 'Pretoria, ZA',
    statusLabel: 'Processing'
  },
  {
    id: '3',
    service: 'PROTECTION',
    title: 'Estate Security Detail',
    date: '02 Nov',
    time: 'Completed',
    status: 'PAST',
    location: 'Cape Town',
    statusLabel: 'Report Filed'
  },
  {
    id: '4',
    service: 'CHAUFFEUR',
    title: 'Paris Fashion Week',
    date: '28 Oct',
    time: 'Cancelled',
    status: 'CANCELLED',
    location: 'Paris, FR',
    statusLabel: 'Client Request'
  }
];

interface BookingTrackerProps {
  onChat: () => void;
}

const BookingTracker: React.FC<BookingTrackerProps> = ({ onChat }) => {
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PAST' | 'CANCELLED'>('UPCOMING');

  const filteredBookings = MOCK_BOOKINGS.filter(b => b.status === activeTab);

  const getIcon = (cat: ServiceCategory) => {
    const iconMap = {
      AVIATION: 'compass',
      CHAUFFEUR: 'truck',
      ARMOURED: 'shield',
      PROTECTION: 'user-check',
    };
    return iconMap[cat];
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
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={styles.iconContainer}>
                    <Icon 
                      name={getIcon(booking.service)} 
                      size={16} 
                      color="#a3a3a3" 
                    />
                  </View>
                  <View>
                    <Text style={styles.serviceType}>{booking.service}</Text>
                    <Text style={styles.bookingId}>{booking.id.padStart(4, '0')}</Text>
                  </View>
                </View>
                
                <View style={styles.statusBadge}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(booking.status) }
                  ]} />
                  <Text style={styles.statusLabel}>{booking.statusLabel}</Text>
                </View>
              </View>

              {/* Title */}
              <Text style={styles.bookingTitle}>{booking.title}</Text>

              {/* Details */}
              <View style={styles.details}>
                <View style={styles.detailRow}>
                  <Icon name="clock" size={12} color="#737373" />
                  <Text style={styles.detailText}>
                    {booking.date} • {booking.time}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="map-pin" size={12} color="#737373" />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {booking.location}
                  </Text>
                </View>
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
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    gap: 12,
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
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(23,23,23,0.5)',
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
  },
  detailText: {
    fontSize: 9,
    color: '#737373',
    fontFamily: 'Courier New',
    flex: 1,
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
