import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import authService, { UserDto } from '../services/authService';
import bookingsService, { Booking, BookingStatus } from '../services/bookingsService';
import notificationsService, { Notification } from '../services/notificationsService';
import paymentMethodsService, { PaymentMethod } from '../services/paymentMethodsService';
import invoicesService, { Invoice } from '../services/invoicesService';
import promotionsService, { Promotion } from '../services/promotionsService';
import { MOCK_GUEST_USER, getMockBookings, getMockNotifications, getMockUnreadCount, getMockPaymentMethods, getMockInvoices, getMockPromotions } from '../utils/mockData';

type SectionType = 'MAIN' | 'PERSONAL' | 'PHONE' | 'BILLING' | 'PROMO' | 'NOTIFICATIONS' | 'BOOKINGS' | 'LEGAL_PRIVACY' | 'LEGAL_TERMS' | 'LEGAL_NOTICE';

interface DashboardProps {
  onLogout?: () => void;
  initialSection?: SectionType;
  onBack?: () => void;
  isGuestMode?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, initialSection, onBack, isGuestMode = false }) => {
  const [currentSection, setCurrentSection] = useState<SectionType>(initialSection || 'MAIN');
  const [user, setUser] = useState<UserDto | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Form fields for editing
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Handle phone number input (only numbers, spaces, +, -, (, ))
  const handlePhoneChange = (text: string) => {
    // Allow only numbers and phone formatting characters
    const cleaned = text.replace(/[^0-9+\-() ]/g, '');
    setPhoneNumber(cleaned);
  };

  // Check if profile has been modified
  const hasProfileChanged = () => {
    if (!user) return false;
    return (
      firstName !== user.firstName ||
      lastName !== user.lastName ||
      phoneNumber !== (user.phoneNumber || '')
    );
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Use mock data for guest mode
      if (isGuestMode) {
        setUser(MOCK_GUEST_USER);
        setFirstName(MOCK_GUEST_USER.firstName);
        setLastName(MOCK_GUEST_USER.lastName);
        setPhoneNumber(MOCK_GUEST_USER.phoneNumber || '');
        
        const mockBookings = getMockBookings();
        const mockActiveBookings = [
          ...getMockBookings(BookingStatus.Confirmed),
          ...getMockBookings(BookingStatus.Active),
        ];
        
        setBookings(mockBookings);
        setActiveBookings(mockActiveBookings);
        setUnreadCount(getMockUnreadCount());
        setNotifications(getMockNotifications());
        setPaymentMethods(getMockPaymentMethods());
        setInvoices([]); // Don't load invoices for guest users
        setPromotions(getMockPromotions());
        setLoading(false);
        return;
      }
      
      // Fetch user profile
      const userData = await authService.getProfile();
      if (userData) {
        setUser(userData);
        setFirstName(userData.firstName);
        setLastName(userData.lastName);
        setPhoneNumber(userData.phoneNumber || '');
      }

      // Fetch all bookings and active bookings separately
      const [allBookings, activeBookingsConfirmed, activeBookingsActive, notifCount, notificationsList, paymentMethodsList, invoicesList, promotionsList] = await Promise.all([
        bookingsService.getBookings().catch(() => []),
        bookingsService.getBookings({ status: BookingStatus.Confirmed }).catch(() => []),
        bookingsService.getBookings({ status: BookingStatus.Active }).catch(() => []),
        notificationsService.getUnreadCount().catch(() => 0),
        notificationsService.getNotifications().catch(() => []),
        paymentMethodsService.getPaymentMethods().catch(() => []),
        invoicesService.getInvoices().catch(() => []),
        promotionsService.getPromotions().catch(() => []),
      ]);

      setBookings(allBookings || []);
      // Combine Confirmed and Active bookings
      const activeBookingsList = [
        ...(activeBookingsConfirmed || []),
        ...(activeBookingsActive || [])
      ];
      setActiveBookings(activeBookingsList);
      setUnreadCount(notifCount);
      setNotifications(notificationsList || []);
      setPaymentMethods(paymentMethodsList || []);
      setInvoices(invoicesList || []);
      setPromotions(promotionsList || []);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleMarkAsRead = async (notificationId: string) => {
    // Prevent action in guest mode
    if (isGuestMode) {
      Alert.alert('Guest Mode', 'Please sign in to manage notifications.');
      return;
    }
    
    try {
      await notificationsService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleUpdateProfile = async () => {
    // Prevent action in guest mode
    if (isGuestMode) {
      Alert.alert('Guest Mode', 'Please sign in to update your profile.');
      return;
    }
    
    try {
      setUpdating(true);
      await authService.updateProfile({
        firstName,
        lastName,
        phoneNumber,
      });
      
      // Reload user data
      const userData = await authService.getProfile();
      setUser(userData);
      
      Alert.alert('Success', 'Profile updated successfully');
      setCurrentSection('MAIN');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const MenuItem = ({ 
    iconName, 
    label, 
    onPress, 
    value 
  }: { 
    iconName: string; 
    label: string; 
    onPress: () => void; 
    value?: string;
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <Icon name={iconName} size={16} color="#737373" />
        <Text style={styles.menuItemLabel}>{label}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {value && <Text style={styles.menuItemValue}>{value}</Text>}
        <Icon name="chevron-right" size={12} color="#404040" />
      </View>
    </TouchableOpacity>
  );

  const Header = ({ title }: { title: string }) => (
    <View style={styles.header}>
      {currentSection !== 'MAIN' ? (
        <TouchableOpacity 
          onPress={() => {
            if (onBack && initialSection) {
              onBack();
            } else {
              setCurrentSection('MAIN');
            }
          }} 
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={14} color="#737373" />
          <Text style={styles.backText}>{onBack ? 'MENU' : 'PROFILE'}</Text>
        </TouchableOpacity>
      ) : (
        <View>
          <Text style={styles.headerTitle}>Client Profile</Text>
          <Text style={styles.clientId}>
            {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
          </Text>
        </View>
      )}
      {currentSection !== 'MAIN' && (
        <Text style={styles.sectionTitle}>
          {currentSection === 'PHONE' ? 'Phone Number' :
           currentSection === 'PROMO' ? 'Promotions' : 
           currentSection === 'BOOKINGS' ? 'Active Bookings' :
           currentSection === 'NOTIFICATIONS' ? 'Notifications' :
           currentSection === 'LEGAL_NOTICE' ? 'Legal Notice' :
           currentSection === 'LEGAL_PRIVACY' ? 'Privacy Policy' :
           currentSection === 'LEGAL_TERMS' ? 'Terms & Conditions' : title}
        </Text>
      )}
    </View>
  );

  const renderContent = () => {
    switch (currentSection) {
      case 'PERSONAL':
        return (
          <ScrollView style={styles.content} contentContainerStyle={styles.formContent}>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>FIRST NAME</Text>
              <TextInput
                style={styles.textInput}
                value={firstName}
                onChangeText={setFirstName}
                placeholderTextColor="#404040"
                editable={!updating && !isGuestMode}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>LAST NAME</Text>
              <TextInput
                style={styles.textInput}
                value={lastName}
                onChangeText={setLastName}
                placeholderTextColor="#404040"
                editable={!updating && !isGuestMode}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <TextInput
                style={[styles.textInput, styles.textInputDisabled]}
                value={user?.email || ''}
                placeholderTextColor="#404040"
                editable={false}
              />
              <Text style={styles.inputHint}>Email cannot be changed</Text>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>PHONE</Text>
              <TextInput
                style={styles.textInput}
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                placeholderTextColor="#404040"
                keyboardType="phone-pad"
                editable={!updating && !isGuestMode}
              />
            </View>
            
            <TouchableOpacity 
              style={[
                styles.saveButton, 
                (updating || !hasProfileChanged() || isGuestMode) && styles.saveButtonDisabled
              ]} 
              onPress={handleUpdateProfile}
              disabled={updating || !hasProfileChanged() || isGuestMode}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#0a0a0a" />
              ) : (
                <Text style={styles.saveButtonText}>SAVE CHANGES</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        );
      
      case 'PHONE':
        return (
          <ScrollView style={styles.content} contentContainerStyle={styles.formContent}>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>PHONE NUMBER</Text>
              <TextInput
                style={styles.textInput}
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                placeholderTextColor="#404040"
                placeholder="+1 (555) 000-0000"
                keyboardType="phone-pad"
                editable={!updating && !isGuestMode}
              />
              <Text style={styles.inputHint}>
                International format recommended (e.g., +1 555 000 0000)
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.saveButton, 
                (updating || !hasProfileChanged() || isGuestMode) && styles.saveButtonDisabled
              ]} 
              onPress={handleUpdateProfile}
              disabled={updating || !hasProfileChanged() || isGuestMode}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#0a0a0a" />
              ) : (
                <Text style={styles.saveButtonText}>UPDATE PHONE</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        );
      
      case 'BILLING':
        const defaultPaymentMethod = paymentMethods.find(pm => pm.isDefault) || paymentMethods[0];
        
        return (
          <ScrollView style={styles.content} contentContainerStyle={styles.billingContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>ACTIVE METHOD</Text>
            </View>
            
            {defaultPaymentMethod ? (
              <View style={styles.creditCard}>
                <View style={styles.creditCardIcon}>
                  <Icon name="credit-card" size={48} color="rgba(255,255,255,0.2)" />
                </View>
                <Text style={styles.cardType}>{defaultPaymentMethod.provider.toUpperCase()}</Text>
                <Text style={styles.cardNumber}>•••• •••• •••• {defaultPaymentMethod.last4}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardName}>{defaultPaymentMethod.holderName.toUpperCase()}</Text>
                  {defaultPaymentMethod.expiryMonth && defaultPaymentMethod.expiryYear && (
                    <Text style={styles.cardExpiry}>
                      {String(defaultPaymentMethod.expiryMonth).padStart(2, '0')}/{String(defaultPaymentMethod.expiryYear).slice(-2)}
                    </Text>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Icon name="credit-card" size={32} color="#262626" />
                <Text style={styles.emptyText}>No payment method on file</Text>
              </View>
            )}

            {/* Only show invoices for authenticated users */}
            {!isGuestMode && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>RECENT INVOICES</Text>
                </View>

                {invoices.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Icon name="file-text" size={32} color="#262626" />
                    <Text style={styles.emptyText}>No invoices</Text>
                  </View>
                ) : (
                  invoices.slice(0, 5).map(invoice => {
                    const getStatusColor = () => {
                      switch (invoice.status) {
                        case 'Paid': return '#22c55e';
                        case 'Pending': return '#eab308';
                        case 'Overdue': return '#ef4444';
                        default: return '#737373';
                      }
                    };
                    
                    return (
                      <View key={invoice.id} style={styles.invoiceItem}>
                        <View style={styles.invoiceLeft}>
                          <Text style={styles.invoiceService}>{invoice.description}</Text>
                          <Text style={styles.invoiceDetails}>
                            {invoice.invoiceNumber} • {new Date(invoice.issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </Text>
                        </View>
                        <View style={styles.invoiceRight}>
                          <Text style={styles.invoiceAmount}>
                            ${invoice.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Text>
                          <View style={[styles.invoiceStatus, { backgroundColor: getStatusColor() }]}>
                            <Text style={styles.invoiceStatusText}>{invoice.status.toUpperCase()}</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })
                )}
              </>
            )}
          </ScrollView>
        );
      
      case 'PROMO':
        return (
          <ScrollView style={styles.content} contentContainerStyle={styles.promoContent}>
            {promotions.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="gift" size={32} color="#262626" />
                <Text style={styles.emptyText}>No promotions available</Text>
              </View>
            ) : (
              promotions.map((promo) => {
                const isExpired = !promo.isActive || new Date(promo.endDate) < new Date();
                const isLimitReached = promo.usageLimit && promo.usageCount >= promo.usageLimit;
                
                return (
                  <View 
                    key={promo.id} 
                    style={[
                      styles.promoCard, 
                      (isExpired || isLimitReached) && styles.promoCardExpired
                    ]}
                  >
                    {!isExpired && !isLimitReached && <View style={styles.promoGlow} />}
                    <Text style={isExpired || isLimitReached ? styles.promoTitleExpired : styles.promoTitle}>
                      {promo.name}
                    </Text>
                    <Text style={isExpired || isLimitReached ? styles.promoDescriptionExpired : styles.promoDescription}>
                      {promo.description}
                    </Text>
                    <View style={styles.promoCodeContainer}>
                      {isExpired || isLimitReached ? (
                        <Text style={styles.promoCodeExpired}>
                          {isLimitReached ? 'LIMIT REACHED' : 'EXPIRED'}
                        </Text>
                      ) : (
                        <Text style={styles.promoCode}>CODE: {promo.code}</Text>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        );
      
      case 'BOOKINGS':
        return (
          <ScrollView style={styles.content}>
            {activeBookings.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="briefcase" size={32} color="#262626" />
                <Text style={styles.emptyText}>No active bookings</Text>
              </View>
            ) : (
              activeBookings.map((booking) => {
                const getStatusColor = () => {
                  switch (booking.status) {
                    case BookingStatus.Confirmed: return '#22c55e';
                    case BookingStatus.Active: return '#3b82f6';
                    default: return '#737373';
                  };
                };
                const getStatusText = () => {
                  switch (booking.status) {
                    case BookingStatus.Confirmed: return 'CONFIRMED';
                    case BookingStatus.Active: return 'ACTIVE';
                    default: return 'UNKNOWN';
                  };
                };
                return (
                  <View key={booking.id} style={styles.bookingCard}>
                    <View style={styles.bookingHeader}>
                      <Text style={styles.bookingNumber}>{booking.bookingNumber}</Text>
                      <View style={[styles.bookingStatus, { backgroundColor: getStatusColor() }]}>
                        <Text style={styles.bookingStatusText}>{getStatusText()}</Text>
                      </View>
                    </View>
                    <Text style={styles.bookingAsset}>{booking.assetName}</Text>
                    <View style={styles.bookingDetails}>
                      <View style={styles.bookingDetailRow}>
                        <Icon name="map-pin" size={12} color="#737373" />
                        <Text style={styles.bookingDetailText}>{booking.pickupLocation}</Text>
                      </View>
                      <View style={styles.bookingDetailRow}>
                        <Icon name="navigation" size={12} color="#737373" />
                        <Text style={styles.bookingDetailText}>{booking.dropoffLocation}</Text>
                      </View>
                      <View style={styles.bookingDetailRow}>
                        <Icon name="calendar" size={12} color="#737373" />
                        <Text style={styles.bookingDetailText}>
                          {new Date(booking.serviceDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </Text>
                      </View>
                      {booking.estimatedCost && (
                        <View style={styles.bookingDetailRow}>
                          <Icon name="dollar-sign" size={12} color="#737373" />
                          <Text style={styles.bookingDetailText}>
                            {new Intl.NumberFormat('en-US', { 
                              style: 'currency', 
                              currency: booking.estimatedCost.currency 
                            }).format(booking.estimatedCost.amount)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        );
      
      case 'NOTIFICATIONS':
        return (
          <ScrollView style={styles.content}>
            {notifications.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="bell-off" size={32} color="#262626" />
                <Text style={styles.emptyText}>No notifications</Text>
              </View>
            ) : (
              notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationItem,
                    notification.isUrgent && styles.notificationUrgent,
                    !notification.isRead && styles.notificationUnread
                  ]}
                  onPress={() => !notification.isRead && handleMarkAsRead(notification.id)}
                >
                  <View style={styles.notificationHeader}>
                    <View style={styles.notificationTitleRow}>
                      <Text style={[
                        styles.notificationTitle,
                        notification.isUrgent && styles.notificationTitleUrgent
                      ]}>
                        {notification.title}
                      </Text>
                      {!notification.isRead && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notificationTime}>{formatNotificationTime(notification.createdAt)}</Text>
                  </View>
                  <Text style={styles.notificationText}>{notification.text}</Text>
                  {notification.isUrgent && (
                    <View style={styles.urgentBadge}>
                      <Text style={styles.urgentText}>URGENT</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        );
      
      case 'LEGAL_PRIVACY':
      case 'LEGAL_TERMS':
      case 'LEGAL_NOTICE':
        return (
          <ScrollView style={styles.content} contentContainerStyle={styles.legalContent}>
            <Text style={styles.legalParagraph}>
              This document constitutes a binding agreement between the Client and ATLAS Secure Logistics. 
              All data transmission is encrypted using military-grade protocols. Client location data is 
              retained only for the duration of active missions and is subsequently purged from operational 
              servers within 24 hours. By using this interface, you acknowledge that ATLAS acts as a 
              facilitator for third-party armoured and aviation assets. Force majeure clauses apply to all 
              high-risk environment operations.
            </Text>
            <Text style={styles.legalParagraph}>
              Strict confidentiality is maintained regarding all client movements. Disclosure of operational 
              details to unauthorized parties constitutes a breach of service terms.
            </Text>
          </ScrollView>
        );
      
      default:
        return (
          <ScrollView style={styles.content} contentContainerStyle={styles.mainContent}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Loading profile...</Text>
              </View>
            ) : (
              <>
                <View style={styles.menuSection}>
                  <MenuItem 
                    iconName="user" 
                    label="PERSONAL INFORMATION" 
                    onPress={() => setCurrentSection('PERSONAL')}
                    value={user ? `${user.firstName} ${user.lastName}` : ''}
                  />
                  <MenuItem 
                    iconName="phone" 
                    label="PHONE" 
                    onPress={() => setCurrentSection('PHONE')} 
                    value={user?.phoneNumber || 'Not set'}
                  />
                  <MenuItem 
                    iconName="briefcase" 
                    label="ACTIVE BOOKINGS" 
                    onPress={() => setCurrentSection('BOOKINGS')} 
                    value={activeBookings.length > 0 ? `${activeBookings.length} active` : 'None'}
                  />
                  <MenuItem 
                    iconName="credit-card" 
                    label="PAYMENT & BILLING" 
                    onPress={() => setCurrentSection('BILLING')} 
                    value="Manage"
                  />
                  <MenuItem 
                    iconName="tag" 
                    label="PROMOTIONS" 
                    onPress={() => setCurrentSection('PROMO')} 
                    value="Available"
                  />
                  <MenuItem 
                    iconName="bell" 
                    label="NOTIFICATIONS" 
                    onPress={() => setCurrentSection('NOTIFICATIONS')}
                    value={unreadCount > 0 ? `${unreadCount} unread` : ''}
                  />
                </View>

                <View style={styles.legalSection}>
                  <Text style={styles.legalHeader}>LEGAL & COMPLIANCE</Text>
                  <TouchableOpacity 
                    style={styles.legalLink}
                    onPress={() => setCurrentSection('LEGAL_NOTICE')}
                  >
                    <Text style={styles.legalLinkText}>Legal Notice</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.legalLink}
                    onPress={() => setCurrentSection('LEGAL_PRIVACY')}
                  >
                    <Text style={styles.legalLinkText}>Privacy Policy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.legalLink}
                    onPress={() => setCurrentSection('LEGAL_TERMS')}
                  >
                    <Text style={styles.legalLinkText}>Terms & Conditions</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={styles.logoutButton}
                  onPress={onLogout}
                >
                  <Icon name="log-out" size={12} color="#737373" />
                  <Text style={styles.logoutText}>SECURE LOGOUT</Text>
                </TouchableOpacity>
              </>
            )}
      </ScrollView>
    );
  }
};  return (
    <View style={styles.container}>
      <Header 
        title={
          currentSection === 'PERSONAL' ? 'Personal Information' : 
          currentSection === 'BILLING' ? 'Payment & Billing' : 
          'Profile'
        } 
      />
      {renderContent()}
    </View>
  );
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
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  backText: {
    fontSize: 9,
    color: '#737373',
    letterSpacing: 2.5,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    letterSpacing: 2,
    fontWeight: '300',
  },
  clientId: {
    fontSize: 9,
    color: '#525252',
    letterSpacing: 2,
    fontFamily: 'Courier New',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#fff',
    letterSpacing: 1.5,
    fontWeight: '300',
  },
  content: {
    flex: 1,
  },
  mainContent: {
    paddingBottom: 128,
  },
  menuSection: {
    paddingVertical: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#171717',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  menuItemLabel: {
    fontSize: 12,
    color: '#d4d4d4',
    letterSpacing: 2,
    fontWeight: '600',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemValue: {
    fontSize: 9,
    color: '#525252',
    fontFamily: 'Courier New',
  },
  legalSection: {
    paddingHorizontal: 32,
    paddingTop: 48,
    gap: 16,
  },
  legalHeader: {
    fontSize: 9,
    color: '#525252',
    letterSpacing: 2.5,
    fontWeight: '700',
    marginBottom: 8,
  },
  legalLink: {
    paddingVertical: 4,
  },
  legalLinkText: {
    fontSize: 10,
    color: '#737373',
    letterSpacing: 0.8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 32,
    paddingTop: 48,
    opacity: 0.5,
  },
  logoutText: {
    fontSize: 9,
    color: '#737373',
    letterSpacing: 2,
    fontWeight: '600',
  },
  formContent: {
    paddingHorizontal: 32,
    paddingVertical: 32,
    gap: 32,
    paddingBottom: 128,
  },
  formGroup: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 9,
    color: '#737373',
    letterSpacing: 2,
    fontWeight: '600',
  },
  textInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
    paddingVertical: 8,
    fontSize: 14,
    color: '#fff',
    fontWeight: '300',
    letterSpacing: 0.8,
  },
  updateButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  updateButtonText: {
    fontSize: 9,
    color: '#000',
    fontWeight: '700',
    letterSpacing: 2,
  },
  billingContent: {
    paddingBottom: 128,
  },
  sectionHeader: {
    paddingHorizontal: 32,
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#171717',
  },
  sectionHeaderText: {
    fontSize: 9,
    color: '#737373',
    letterSpacing: 2.5,
    fontWeight: '700',
  },
  creditCard: {
    marginHorizontal: 32,
    marginVertical: 32,
    padding: 24,
    backgroundColor: 'linear-gradient(135deg, #262626 0%, #171717 100%)',
    borderWidth: 1,
    borderColor: '#404040',
    position: 'relative',
  },
  creditCardIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  cardType: {
    fontSize: 12,
    color: '#a3a3a3',
    fontFamily: 'Courier New',
    marginBottom: 32,
  },
  cardNumber: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Courier New',
    letterSpacing: 3,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardName: {
    fontSize: 9,
    color: '#737373',
    letterSpacing: 2,
    fontWeight: '600',
  },
  cardExpiry: {
    fontSize: 9,
    color: '#737373',
    fontFamily: 'Courier New',
  },
  invoiceItem: {
    marginHorizontal: 24,
    marginBottom: 12,
    padding: 16,
    backgroundColor: 'rgba(23,23,23,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(38,38,38,0.6)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceLeft: {
    flex: 1,
    marginRight: 16,
  },
  invoiceService: {
    fontSize: 12,
    color: '#d4d4d4',
    fontWeight: '500',
    marginBottom: 4,
  },
  invoiceDetails: {
    fontSize: 9,
    color: '#525252',
    fontFamily: 'Courier New',
  },
  invoiceRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  invoiceAmount: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Courier New',
  },
  invoiceStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  invoiceStatusText: {
    fontSize: 7,
    color: '#0a0a0a',
    fontWeight: '700',
    letterSpacing: 1,
  },
  promoContent: {
    paddingTop: 32,
    paddingHorizontal: 32,
    gap: 24,
  },
  promoCard: {
    borderWidth: 1,
    borderColor: '#262626',
    backgroundColor: 'rgba(64,64,64,0.1)',
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  promoGlow: {
    position: 'absolute',
    right: -16,
    top: -16,
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 32,
  },
  promoTitle: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Georgia',
    letterSpacing: 1,
    marginBottom: 8,
  },
  promoDescription: {
    fontSize: 9,
    color: '#737373',
    lineHeight: 16,
    marginBottom: 16,
  },
  promoCodeContainer: {
    alignSelf: 'flex-start',
  },
  promoCode: {
    fontSize: 9,
    color: '#fff',
    fontFamily: 'Courier New',
    borderWidth: 1,
    borderColor: '#525252',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  promoCardExpired: {
    opacity: 0.5,
    borderColor: '#1a1a1a',
  },
  promoTitleExpired: {
    fontSize: 14,
    color: '#525252',
    fontFamily: 'Georgia',
    letterSpacing: 1,
    marginBottom: 8,
  },
  promoDescriptionExpired: {
    fontSize: 9,
    color: '#404040',
    lineHeight: 16,
    marginBottom: 16,
  },
  promoCodeExpired: {
    fontSize: 9,
    color: '#404040',
    fontFamily: 'Courier New',
    borderWidth: 1,
    borderColor: '#262626',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  notificationItem: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#171717',
    position: 'relative',
  },
  notificationUnread: {
    backgroundColor: 'rgba(38,38,38,0.3)',
  },
  notificationUrgent: {
    backgroundColor: 'rgba(127,29,29,0.1)',
  },
  notificationHeader: {
    flexDirection: 'column',
    gap: 4,
    marginBottom: 8,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationTitle: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
    letterSpacing: 0.5,
    flex: 1,
  },
  notificationTitleUrgent: {
    color: '#fca5a5',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3b82f6',
  },
  notificationTime: {
    fontSize: 9,
    color: '#525252',
    fontFamily: 'Courier New',
  },
  notificationText: {
    fontSize: 10,
    color: '#737373',
    lineHeight: 18,
  },
  urgentBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#dc2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  urgentText: {
    fontSize: 7,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 11,
    color: '#525252',
    letterSpacing: 1.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 11,
    color: '#737373',
    letterSpacing: 1.5,
  },
  saveButton: {
    marginTop: 20,
    marginHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  saveButtonDisabled: {
    backgroundColor: '#404040',
  },
  saveButtonText: {
    fontSize: 11,
    color: '#0a0a0a',
    letterSpacing: 2,
    fontWeight: '700',
  },
  textInputDisabled: {
    backgroundColor: '#171717',
    opacity: 0.6,
  },
  inputHint: {
    fontSize: 9,
    color: '#525252',
    marginTop: 8,
    fontStyle: 'italic',
  },
  settingsContent: {
    paddingTop: 32,
    paddingHorizontal: 32,
    gap: 24,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 12,
    color: '#d4d4d4',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 9,
    color: '#525252',
    lineHeight: 14,
  },
  toggleContainer: {
    width: 32,
    height: 16,
    borderRadius: 16,
    backgroundColor: '#262626',
    position: 'relative',
    justifyContent: 'center',
  },
  toggleContainerActive: {
    backgroundColor: '#fff',
  },
  toggleKnob: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0a0a0a',
    position: 'absolute',
    left: 2,
  },
  toggleKnobActive: {
    left: 18,
  },
  legalContent: {
    paddingTop: 32,
    paddingHorizontal: 32,
  },
  legalParagraph: {
    fontSize: 10,
    color: '#737373',
    lineHeight: 20,
    textAlign: 'justify',
    marginBottom: 16,
  },
  bookingCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 20,
    backgroundColor: 'rgba(23,23,23,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(38,38,38,0.6)',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingNumber: {
    fontSize: 11,
    color: '#d4d4d4',
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  bookingStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  bookingStatusText: {
    fontSize: 8,
    color: '#0a0a0a',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  bookingAsset: {
    fontSize: 13,
    color: '#fff',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  bookingDetails: {
    gap: 10,
  },
  bookingDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookingDetailText: {
    fontSize: 10,
    color: '#737373',
    letterSpacing: 0.3,
  },
});

export default Dashboard;
