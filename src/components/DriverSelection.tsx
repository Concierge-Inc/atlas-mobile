import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  rating: number;
  totalTrips: number;
  profileImageUrl?: string;
  licenseNumber: string;
  operatorType: number; // 0=Driver, 1=Pilot, 2=CPO, 3=Concierge
  isAvailable: boolean;
  isVerified: boolean;
}

interface DriverSelectionProps {
  drivers: Driver[];
  loading: boolean;
  onDriverSelect: (driver: Driver) => void;
  selectedDriverId?: string;
}

const DriverSelection: React.FC<DriverSelectionProps> = ({
  drivers,
  loading,
  onDriverSelect,
  selectedDriverId,
}) => {
  const [selectedId, setSelectedId] = useState<string | undefined>(selectedDriverId);

  useEffect(() => {
    setSelectedId(selectedDriverId);
  }, [selectedDriverId]);

  const handleSelectDriver = (driver: Driver) => {
    setSelectedId(driver.id);
    onDriverSelect(driver);
  };

  const getOperatorTypeLabel = (type: number): string => {
    switch (type) {
      case 0: return 'Driver';
      case 1: return 'Pilot';
      case 2: return 'CPO';
      case 3: return 'Concierge';
      default: return 'Operator';
    }
  };

  const renderDriver = ({ item }: { item: Driver }) => (
    <TouchableOpacity
      style={[
        styles.driverCard,
        selectedId === item.id && styles.selectedDriverCard,
        !item.isAvailable && styles.unavailableDriverCard,
      ]}
      onPress={() => item.isAvailable && handleSelectDriver(item)}
      disabled={!item.isAvailable}
      activeOpacity={0.7}
    >
      <View style={styles.driverInfo}>
        {item.profileImageUrl ? (
          <Image
            source={{ uri: item.profileImageUrl }}
            style={styles.driverAvatar}
          />
        ) : (
          <View style={[styles.driverAvatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {item.firstName[0]}{item.lastName[0]}
            </Text>
          </View>
        )}

        <View style={styles.driverDetails}>
          <View style={styles.driverNameRow}>
            <Text style={styles.driverName}>
              {item.firstName} {item.lastName}
            </Text>
            {item.isVerified && (
              <Icon name="checkmark-circle" size={16} color="#4CAF50" />
            )}
          </View>

          <View style={styles.driverMeta}>
            <Text style={styles.operatorType}>
              {getOperatorTypeLabel(item.operatorType)}
            </Text>
            <Text style={styles.licenseNumber}>
              • {item.licenseNumber}
            </Text>
          </View>

          <View style={styles.driverStats}>
            <View style={styles.rating}>
              <Icon name="star" size={14} color="#FFC107" />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.tripsText}>
              {item.totalTrips} trips
            </Text>
          </View>
        </View>

        <View style={styles.selectionIndicator}>
          {selectedId === item.id ? (
            <Icon name="radio-button-on" size={24} color="#2196F3" />
          ) : (
            <Icon name="radio-button-off" size={24} color="#BDBDBD" />
          )}
        </View>
      </View>

      {!item.isAvailable && (
        <View style={styles.unavailableBadge}>
          <Text style={styles.unavailableText}>Unavailable</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading available drivers...</Text>
      </View>
    );
  }

  if (drivers.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="car" size={64} color="#BDBDBD" />
        <Text style={styles.emptyTitle}>No Drivers Available</Text>
        <Text style={styles.emptyText}>
          There are currently no available drivers for this service.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Select Your Driver</Text>
        <Text style={styles.headerSubtitle}>
          {drivers.length} {drivers.length === 1 ? 'driver' : 'drivers'} available
        </Text>
      </View>

      <FlatList
        data={drivers}
        renderItem={renderDriver}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#757575',
  },
  list: {
    padding: 16,
  },
  driverCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedDriverCard: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  unavailableDriverCard: {
    opacity: 0.6,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  driverDetails: {
    flex: 1,
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginRight: 6,
  },
  driverMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  operatorType: {
    fontSize: 13,
    color: '#757575',
    marginRight: 8,
  },
  licenseNumber: {
    fontSize: 13,
    color: '#9E9E9E',
  },
  driverStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#616161',
    marginLeft: 4,
  },
  tripsText: {
    fontSize: 13,
    color: '#757575',
  },
  selectionIndicator: {
    marginLeft: 8,
  },
  unavailableBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#F44336',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  unavailableText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#757575',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default DriverSelection;
