import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Feather';
import { ServiceCategory } from '../utils/types';
import bookingsService from '../services/bookingsService';
import assetsService, { AssetListDto } from '../services/assetsService';
import signalrService from '../services/signalrService';

const { width } = Dimensions.get('window');

interface BookingFlowProps {
  category: ServiceCategory;
  onBack: () => void;
  onComplete: () => void;
}

const BookingFlow: React.FC<BookingFlowProps> = ({ category, onBack, onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedAsset, setSelectedAsset] = useState<AssetListDto | null>(null);
  const [includeProtection, setIncludeProtection] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pickupLocation, setPickupLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [timing, setTiming] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [assets, setAssets] = useState<AssetListDto[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);

  // Fetch assets from backend
  useEffect(() => {
    loadAssets();
  }, [category]);

  const loadAssets = async () => {
    try {
      setLoadingAssets(true);
      const assetsData = await assetsService.getAssets({ category });
      console.log(`✅ Loaded ${assetsData.length} assets for category ${category}`);
      setAssets(assetsData);
    } catch (error) {
      console.error('Failed to load assets:', error);
      Alert.alert('Error', 'Failed to load available assets');
      setAssets([]); // Set empty array on error
    } finally {
      setLoadingAssets(false);
    }
  };

  // Subscribe to booking updates when booking is created
  useEffect(() => {
    if (createdBookingId) {
      signalrService.subscribeToBooking(createdBookingId);
      
      const unsubscribeStatus = signalrService.onBookingStatusChanged((update) => {
        console.log('Booking status changed:', update);
        Alert.alert('Booking Update', `Status: ${update.status}${update.message ? '\n' + update.message : ''}`);
      });

      const unsubscribeUpdate = signalrService.onBookingUpdate((update) => {
        console.log('Booking updated:', update);
      });

      return () => {
        signalrService.unsubscribeFromBooking(createdBookingId);
        unsubscribeStatus();
        unsubscribeUpdate();
      };
    }
  }, [createdBookingId]);

  const handleAssetSelect = (asset: AssetListDto) => {
    if (!asset.isAvailable) return;
    setSelectedAsset(asset);
    setStep(2);
  };

  const handleConfirm = async () => {
    if (!selectedAsset) return;

    setIsProcessing(true);

    try {
      // Create booking via API
      const bookingId = await bookingsService.createBooking({
        assetId: selectedAsset.id,
        serviceDate: selectedDate.toISOString(),
        serviceTime: timing,
        pickupLocation,
        dropoffLocation: destination,
        includeProtection,
        notes: includeProtection ? 'CPO protection detail added' : undefined,
      });

      console.log('✅ Booking created:', bookingId);
      setCreatedBookingId(bookingId);

      // Simulate processing delay for UI
      setTimeout(() => {
        setIsProcessing(false);
        Alert.alert(
          'Booking Confirmed',
          `Your ${getCategoryTitle(category)} booking has been created successfully!`,
          [
            {
              text: 'OK',
              onPress: onComplete,
            },
          ]
        );
      }, 2000);
    } catch (error: any) {
      console.error('Booking creation error:', error);
      setIsProcessing(false);
      Alert.alert('Booking Failed', error.message || 'Failed to create booking. Please try again.');
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency, 
      maximumFractionDigits: 0 
    }).format(amount);

  const getCategoryTitle = (cat: ServiceCategory) => {
    if (cat === 'AVIATION') return 'Private Air Transfer';
    return cat.charAt(0) + cat.slice(1).toLowerCase();
  };

  if (step === 1) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Icon name="arrow-left" size={14} color="#737373" />
            <Text style={styles.backText}>RETURN</Text>
          </TouchableOpacity>
          <Text style={styles.stepIndicator}>01 — 03</Text>
        </View>
        <Text style={styles.headerTitle}>Select {getCategoryTitle(category)}</Text>

        {/* Asset List */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.assetList}>
          {loadingAssets ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading assets...</Text>
            </View>
          ) : assets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No assets available</Text>
            </View>
          ) : (
            assets.map(asset => (
              <TouchableOpacity
                key={asset.id}
                onPress={() => handleAssetSelect(asset)}
                style={[styles.assetCard, !asset.isAvailable && styles.assetCardDisabled]}
                disabled={!asset.isAvailable}
              >
                <View style={styles.assetImageContainer}>
                  <Image 
                    source={{ uri: asset.imageUrl || 'https://picsum.photos/800/600?grayscale' }} 
                    style={styles.assetImage}
                  />
                  <View style={styles.assetPriceBadge}>
                    <Text style={styles.assetPrice}>
                      {formatCurrency(asset.hourlyRate.amount, asset.hourlyRate.currency)}/HR
                    </Text>
                  </View>
                </View>

                <View style={styles.assetInfo}>
                  <View style={styles.assetHeader}>
                    <View>
                      <Text style={styles.assetName}>{asset.name}</Text>
                      <View style={styles.assetSpecs}>
                        <Text style={styles.assetSpecText}>AVAILABLE</Text>
                      </View>
                    </View>
                    
                    {asset.isAvailable ? (
                      <View style={styles.availableDot} />
                    ) : (
                      <Text style={styles.reservedText}>RESERVED</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  if (step === 2) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep(1)} style={styles.backButton}>
            <Icon name="arrow-left" size={14} color="#737373" />
            <Text style={styles.backText}>BACK</Text>
          </TouchableOpacity>
          <Text style={styles.stepIndicator}>02 — 03</Text>
        </View>
        <Text style={styles.headerTitle}>Mission Logistics</Text>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.formContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Selected Asset Summary */}
          <View style={styles.assetSummary}>
            <View style={styles.assetSummaryIcon}>
              <Text style={styles.assetSummaryIconText}>REF</Text>
            </View>
            <View style={styles.assetSummaryInfo}>
              <Text style={styles.assetSummaryName}>{selectedAsset?.name}</Text>
              <View style={styles.assetSecured}>
                <View style={styles.securedDot} />
                <Text style={styles.assetSecuredText}>Asset secured</Text>
              </View>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.formFields}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PICKUP POINT</Text>
              <View style={styles.inputContainer}>
                <Icon name="map-pin" size={14} color="#525252" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Coordinates or Address"
                  placeholderTextColor="#262626"
                  value={pickupLocation}
                  onChangeText={setPickupLocation}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>DESTINATION</Text>
              <View style={styles.inputContainer}>
                <Icon name="corner-down-right" size={14} color="#525252" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Drop-off or Duration"
                  placeholderTextColor="#262626"
                  value={destination}
                  onChangeText={setDestination}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>TIMING</Text>
              <TouchableOpacity 
                style={styles.inputContainer}
                onPress={() => setShowDatePicker(true)}
              >
                <Icon name="calendar" size={14} color="#525252" style={styles.inputIcon} />
                <Text style={[styles.input, styles.dateText]}>
                  {selectedDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="datetime"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (date) {
                      setSelectedDate(date);
                      setTiming(date.toISOString());
                    }
                  }}
                  minimumDate={new Date()}
                  textColor="#fff"
                  themeVariant="dark"
                />
              )}
            </View>

            {/* Protection Add-On */}
            {category !== 'PROTECTION' && (
              <TouchableOpacity
                style={[
                  styles.protectionCard,
                  includeProtection && styles.protectionCardActive
                ]}
                onPress={() => setIncludeProtection(!includeProtection)}
              >
                <View style={[
                  styles.checkbox,
                  includeProtection && styles.checkboxActive
                ]}>
                  {includeProtection && <View style={styles.checkboxInner} />}
                </View>
                <View style={styles.protectionContent}>
                  <View style={styles.protectionHeader}>
                    <Icon 
                      name="shield" 
                      size={14} 
                      color={includeProtection ? '#fff' : '#737373'} 
                    />
                    <Text style={[
                      styles.protectionTitle,
                      includeProtection && styles.protectionTitleActive
                    ]}>
                      SECURE PROTECTION DETAIL
                    </Text>
                  </View>
                  <Text style={styles.protectionDesc}>
                    Add a Close Protection Officer (CPO) to the manifest for duration of movement.
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Review Mission Button */}
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={() => setStep(3)}
            >
              <Text style={styles.primaryButtonText}>REVIEW MISSION</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Icon name="info" size={12} color="#737373" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              All movements are monitored by ATLAS Operations. Final routing and risk assessment confirmed via secure channel.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (step === 3) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep(2)} style={styles.backButton}>
            <Icon name="arrow-left" size={14} color="#737373" />
            <Text style={styles.backText}>ADJUST</Text>
          </TouchableOpacity>
          <Text style={styles.stepIndicator}>03 — 03</Text>
        </View>
        <Text style={styles.headerTitle}>Confirmation</Text>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.confirmationContainer}
          showsVerticalScrollIndicator={false}
        >
          {isProcessing ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.processingTitle}>Verifying Clearance</Text>
              <Text style={styles.processingSubtitle}>Encrypted Handshake...</Text>
            </View>
          ) : (
            <>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>ASSET</Text>
                  <Text style={styles.summaryValue}>{selectedAsset?.name}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>SERVICE</Text>
                  <Text style={styles.summaryValue}>{getCategoryTitle(category)}</Text>
                </View>
                {includeProtection && (
                  <>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryRow}>
                      <View style={styles.summaryLabelWithIcon}>
                        <Icon name="lock" size={10} color="#737373" />
                        <Text style={styles.summaryLabel}>PROTOCOL</Text>
                      </View>
                      <Text style={styles.summaryValue}>CPO Added</Text>
                    </View>
                  </>
                )}
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>EST. RATE</Text>
                  <Text style={styles.summaryValue}>
                    {selectedAsset ? formatCurrency(selectedAsset.hourlyRate.amount, selectedAsset.hourlyRate.currency) : '$0'}/hr
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                <Text style={styles.secondaryButtonText}>INITIATE REQUEST</Text>
              </TouchableOpacity>

              <Text style={styles.disclaimer}>
                By confirming, you authorize a discreet pre-authorization hold. ATLAS Operations will initiate protocol immediately.
              </Text>
            </>
          )}
        </ScrollView>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingTop: 56,
    paddingBottom: 32,
    paddingHorizontal: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#171717',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backText: {
    fontSize: 9,
    color: '#737373',
    letterSpacing: 2.5,
    fontWeight: '600',
  },
  stepIndicator: {
    fontSize: 9,
    color: '#404040',
    letterSpacing: 2,
    fontFamily: 'Courier New',
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 8,
    letterSpacing: 1.5,
    fontWeight: '300',
  },
  scrollView: {
    flex: 1,
  },
  assetList: {
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 128,
    gap: 48,
  },
  assetCard: {
    marginBottom: 24,
  },
  assetCardDisabled: {
    opacity: 0.4,
  },
  assetImageContainer: {
    height: 192,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#262626',
    overflow: 'hidden',
    position: 'relative',
  },
  assetImage: {
    width: '100%',
    height: '100%',
    opacity: 0.5,
  },
  assetPriceBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  assetPrice: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Courier New',
  },
  assetInfo: {
    marginTop: 20,
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  assetName: {
    fontSize: 14,
    color: '#fff',
    letterSpacing: 1.5,
    fontWeight: '500',
    marginBottom: 8,
  },
  assetDescription: {
    fontSize: 11,
    color: '#737373',
    lineHeight: 18,
    marginTop: 12,
  },
  assetSpecs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  assetSpecText: {
    fontSize: 9,
    color: '#737373',
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  specDivider: {
    width: 1,
    height: 8,
    backgroundColor: '#262626',
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  reservedText: {
    fontSize: 8,
    color: '#525252',
    letterSpacing: 2,
    fontWeight: '600',
  },
  formContainer: {
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 200,
  },
  assetSummary: {
    flexDirection: 'row',
    gap: 24,
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#171717',
    marginBottom: 48,
  },
  assetSummaryIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#262626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assetSummaryIconText: {
    fontSize: 9,
    color: '#737373',
    fontFamily: 'Courier New',
  },
  assetSummaryInfo: {
    flex: 1,
    paddingTop: 4,
  },
  assetSummaryName: {
    fontSize: 14,
    color: '#fff',
    letterSpacing: 1.5,
    fontWeight: '500',
    marginBottom: 8,
  },
  assetSecured: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  securedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#737373',
  },
  assetSecuredText: {
    fontSize: 9,
    color: '#525252',
    letterSpacing: 2,
    fontWeight: '600',
  },
  formFields: {
    gap: 40,
  },
  inputGroup: {
    gap: 16,
  },
  inputLabel: {
    fontSize: 9,
    color: '#737373',
    letterSpacing: 2,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
    paddingBottom: 8,
  },
  inputIcon: {
    marginRight: 16,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    fontWeight: '300',
    letterSpacing: 0.8,
    padding: 0,
  },
  dateText: {
    paddingVertical: 4,
  },
  protectionCard: {
    borderWidth: 1,
    borderColor: '#262626',
    backgroundColor: 'transparent',
    padding: 24,
    flexDirection: 'row',
    gap: 20,
    marginTop: 24,
  },
  protectionCardActive: {
    borderColor: '#fff',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#525252',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  checkboxInner: {
    width: 8,
    height: 8,
    backgroundColor: '#000',
  },
  protectionContent: {
    flex: 1,
  },
  protectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  protectionTitle: {
    fontSize: 12,
    color: '#a3a3a3',
    letterSpacing: 2,
    fontWeight: '600',
  },
  protectionTitleActive: {
    color: '#fff',
  },
  protectionDesc: {
    fontSize: 9,
    color: '#525252',
    lineHeight: 16,
    fontWeight: '300',
  },
  infoBox: {
    flexDirection: 'row',
    gap: 20,
    padding: 20,
    backgroundColor: 'rgba(23,23,23,0.2)',
    borderWidth: 1,
    borderColor: '#171717',
    marginTop: 48,
  },
  infoIcon: {
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 9,
    color: '#737373',
    lineHeight: 16,
    fontFamily: 'Courier New',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 32,
    backgroundColor: '#0a0a0a',
    borderTopWidth: 1,
    borderTopColor: '#171717',
  },
  primaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  primaryButtonText: {
    fontSize: 9,
    color: '#000',
    fontWeight: '700',
    letterSpacing: 2.5,
  },
  secondaryButton: {
    backgroundColor: '#171717',
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#262626',
  },
  secondaryButtonText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 2.5,
  },
  confirmationContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 120,
    alignItems: 'center',
  },
  processingContainer: {
    alignItems: 'center',
    gap: 40,
  },
  processingTitle: {
    fontSize: 10,
    color: '#fff',
    letterSpacing: 3,
    fontWeight: '600',
  },
  processingSubtitle: {
    fontSize: 9,
    color: '#525252',
    fontFamily: 'Courier New',
  },
  summaryCard: {
    width: '100%',
    maxWidth: 300,
    borderWidth: 1,
    borderColor: '#171717',
    backgroundColor: 'rgba(23,23,23,0.1)',
    padding: 20,
    gap: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  summaryLabel: {
    fontSize: 9,
    color: '#737373',
    letterSpacing: 2,
    fontWeight: '600',
  },
  summaryLabelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryValue: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
    letterSpacing: 0.8,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#171717',
  },
  confirmButton: {
    backgroundColor: '#171717',
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#262626',
    marginTop: 20,
    width: '100%',
    maxWidth: 300,
  },
  disclaimer: {
    fontSize: 9,
    color: '#525252',
    lineHeight: 16,
    textAlign: 'center',
    maxWidth: 240,
    marginTop: 20,
    fontWeight: '300',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
  },
});

export default BookingFlow;
