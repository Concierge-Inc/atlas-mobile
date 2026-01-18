import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import locationService, { DriverLocationDto } from '../services/locationService';
import signalrService from '../services/signalrService';

interface LiveTrackingScreenProps {
  route: {
    params: {
      driverId: string;
      bookingId?: string;
      pickupLocation?: { latitude: number; longitude: number; address?: string };
      dropoffLocation?: { latitude: number; longitude: number; address?: string };
    };
  };
  navigation: any;
}

export const LiveTrackingScreen: React.FC<LiveTrackingScreenProps> = ({ route, navigation }) => {
  const { driverId, bookingId, pickupLocation, dropoffLocation } = route.params;

  const [driverLocation, setDriverLocation] = useState<DriverLocationDto | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState(true);
  const [eta, setEta] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  const locationUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeTracking();

    return () => {
      cleanup();
    };
  }, [driverId, bookingId]);

  const initializeTracking = async () => {
    try {
      // Request location permissions for Android
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Required', 'Location permission is needed for live tracking');
        }
      }

      // Connect to SignalR for real-time updates
      if (bookingId) {
        await signalrService.connectToDriverLocationHub();
        await signalrService.subscribeToBookingTracking(bookingId);
      } else {
        await signalrService.connectToDriverLocationHub();
        await signalrService.subscribeToDriver(driverId);
      }

      // Set up SignalR event handler
      signalrService.onDriverLocationUpdated((location: DriverLocationDto) => {
        if (location.driverId === driverId) {
          handleLocationUpdate(location);
        }
      });

      // Get initial driver location
      const initialLocation = await locationService.getDriverLocation(driverId);

      if (initialLocation) {
        handleLocationUpdate(initialLocation);
      }

      // Set up polling for location updates as backup
      locationUpdateInterval.current = setInterval(async () => {
        const location = await locationService.getDriverLocation(driverId);
        if (location) {
          handleLocationUpdate(location);
        }
      }, 15000); // Poll every 15 seconds

      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Failed to initialize tracking');
    }
  };

  const handleLocationUpdate = useCallback((location: DriverLocationDto) => {
    setDriverLocation(location);

    // Add to route coordinates
    setRouteCoordinates((prev) => {
      const newCoordinates = [...prev, [location.latitude, location.longitude]];

      // Keep last 100 points to avoid memory issues
      if (newCoordinates.length > 100) {
        return newCoordinates.slice(-100);
      }

      return newCoordinates;
    });

    // Calculate distance to destination if available
    if (dropoffLocation) {
      const dist = locationService.calculateDistance(
        location.latitude,
        location.longitude,
        dropoffLocation.latitude,
        dropoffLocation.longitude
      );
      setDistance(Math.round(dist * 10) / 10);

      // Estimate ETA (assuming average speed of 40 km/h in city)
      const speed = location.speed || 40;
      const etaMinutes = Math.round((dist / speed) * 60);
      setEta(`${etaMinutes} min`);
    }
  }, [dropoffLocation]);

  const cleanup = () => {
    if (locationUpdateInterval.current) {
      clearInterval(locationUpdateInterval.current);
    }

    // Unsubscribe from SignalR
    if (bookingId) {
      signalrService.unsubscribeFromBookingTracking(bookingId);
    } else {
      signalrService.unsubscribeFromDriver(driverId);
    }
  };

  const handleCallDriver = () => {
    Alert.alert('Call Driver', 'This would open the phone dialer to call the driver');
  };

  const handleMessageDriver = () => {
    Alert.alert('Message Driver', 'This would open a chat with the driver');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Initializing live tracking...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map View */}
      <View style={styles.mapContainer}>
        {driverLocation ? (
          <>
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapPlaceholderText}>
                📍 Map View would be displayed here
              </Text>
              <Text style={styles.mapPlaceholderSubtext}>
                Driver Location: {driverLocation.latitude.toFixed(4)}, {driverLocation.longitude.toFixed(4)}
              </Text>
              {routeCoordinates.length > 0 && (
                <Text style={styles.mapPlaceholderSubtext}>
                  Route Points: {routeCoordinates.length}
                </Text>
              )}
            </View>

            {/* Map Controls Overlay */}
            <View style={styles.mapControls}>
              <TouchableOpacity style={styles.mapControlButton}>
                <Text style={styles.mapControlButtonText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mapControlButton}>
                <Text style={styles.mapControlButtonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mapControlButton}>
                <Text style={styles.mapControlButtonText}>📍</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>
              Waiting for driver location...
            </Text>
            <ActivityIndicator size="small" color="#007AFF" style={{ marginTop: 16 }} />
          </View>
        )}
      </View>

      {/* Driver Info Card */}
      <View style={styles.driverCard}>
        <View style={styles.driverInfoHeader}>
          <View style={styles.driverAvatar}>
            <Text style={styles.driverAvatarText}>🚗</Text>
          </View>
          <View style={styles.driverDetails}>
            <Text style={styles.driverName}>Driver en route</Text>
            <Text style={styles.driverStatus}>
              {driverLocation?.speed ? `Speed: ${Math.round(driverLocation.speed)} km/h` : 'Moving to pickup'}
            </Text>
          </View>
          <View style={styles.etaContainer}>
            {eta ? (
              <>
                <Text style={styles.etaValue}>{eta}</Text>
                <Text style={styles.etaLabel}>ETA</Text>
              </>
            ) : (
              <>
                <Text style={styles.etaValue}>--</Text>
                <Text style={styles.etaLabel}>ETA</Text>
              </>
            )}
          </View>
        </View>

        {distance !== null && (
          <View style={styles.distanceRow}>
            <Text style={styles.distanceLabel}>Distance to destination:</Text>
            <Text style={styles.distanceValue}>{distance} km</Text>
          </View>
        )}

        {/* Route Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressDots}>
            <View style={styles.progressDotActive} />
            <View style={styles.progressLine} />
            <View style={styles.progressDot} />
            <View style={styles.progressLine} />
            <View style={styles.progressDot} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>Pickup</Text>
            <Text style={styles.progressLabel}>En Route</Text>
            <Text style={styles.progressLabel}>Dropoff</Text>
          </View>
        </View>
      </View>

      {/* Location Details */}
      <View style={styles.locationCard}>
        <View style={styles.locationRow}>
          <View style={styles.locationIconContainer}>
            <Text style={styles.locationIcon}>🟢</Text>
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>PICKUP</Text>
            <Text style={styles.locationAddress}>
              {pickupLocation?.address || `${pickupLocation?.latitude.toFixed(4)}, ${pickupLocation?.longitude.toFixed(4)}`}
            </Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <View style={styles.locationIconContainer}>
            <Text style={styles.locationIcon}>🔴</Text>
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>DROPOFF</Text>
            <Text style={styles.locationAddress}>
              {dropoffLocation?.address || `${dropoffLocation?.latitude.toFixed(4)}, ${dropoffLocation?.longitude.toFixed(4)}`}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCallDriver}>
          <Text style={styles.actionButtonIcon}>📞</Text>
          <Text style={styles.actionButtonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleMessageDriver}>
          <Text style={styles.actionButtonIcon}>💬</Text>
          <Text style={styles.actionButtonText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={() => Alert.alert('Share Trip', 'Share trip status with a contact')}
        >
          <Text style={styles.actionButtonIcon}>🔗</Text>
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Safety Features */}
      <View style={styles.safetyCard}>
        <TouchableOpacity style={styles.safetyButton}>
          <Text style={styles.safetyButtonIcon}>🛡️</Text>
          <Text style={styles.safetyButtonText}>Safety Tools</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  mapContainer: {
    height: 400,
    backgroundColor: '#E0E0E0',
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
  },
  mapPlaceholderText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -60,
  },
  mapControlButton: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  mapControlButtonText: {
    fontSize: 20,
    color: '#333',
  },
  driverCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  driverInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  driverAvatar: {
    width: 56,
    height: 56,
    backgroundColor: '#007AFF',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverAvatarText: {
    fontSize: 28,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  driverStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  etaContainer: {
    alignItems: 'center',
  },
  etaValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  etaLabel: {
    fontSize: 12,
    color: '#666',
  },
  distanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 12,
  },
  distanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  distanceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressDots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressDotActive: {
    width: 12,
    height: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  progressDot: {
    width: 12,
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    color: '#999',
  },
  locationCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  locationIconContainer: {
    marginRight: 12,
  },
  locationIcon: {
    fontSize: 24,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButton: {
    backgroundColor: '#007AFF',
  },
  actionButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  safetyCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 24,
  },
  safetyButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safetyButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  safetyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default LiveTrackingScreen;
