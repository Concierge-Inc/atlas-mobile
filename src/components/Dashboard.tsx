import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

type SectionType = 'MAIN' | 'PERSONAL' | 'BILLING' | 'PROMO' | 'NOTIFICATIONS' | 'SETTINGS' | 'LEGAL_PRIVACY' | 'LEGAL_TERMS' | 'LEGAL_NOTICE';

interface DashboardProps {
  onLogout?: () => void;
  initialSection?: SectionType;
  onBack?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, initialSection, onBack }) => {
  const [currentSection, setCurrentSection] = useState<SectionType>(initialSection || 'MAIN');

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
          <Text style={styles.clientId}>ID: 8849-ALPHA</Text>
        </View>
      )}
      {currentSection !== 'MAIN' && (
        <Text style={styles.sectionTitle}>
          {currentSection === 'PROMO' ? 'Promotions' : 
           currentSection === 'NOTIFICATIONS' ? 'Notifications' :
           currentSection === 'SETTINGS' ? 'User Settings' :
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
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <TextInput
                style={styles.textInput}
                defaultValue="Jonathan V. Sterling"
                placeholderTextColor="#404040"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>PRIMARY CONTACT</Text>
              <TextInput
                style={styles.textInput}
                defaultValue="+1 (212) 555-0199"
                placeholderTextColor="#404040"
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>SECURE EMAIL</Text>
              <TextInput
                style={styles.textInput}
                defaultValue="j.sterling@atlas-secure.net"
                placeholderTextColor="#404040"
                keyboardType="email-address"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>PRINCIPAL RESIDENCE</Text>
              <TextInput
                style={styles.textInput}
                defaultValue="15 Central Park West, New York"
                placeholderTextColor="#404040"
              />
            </View>
            <TouchableOpacity style={styles.updateButton}>
              <Text style={styles.updateButtonText}>UPDATE RECORDS</Text>
            </TouchableOpacity>
          </ScrollView>
        );
      
      case 'BILLING':
        return (
          <ScrollView style={styles.content} contentContainerStyle={styles.billingContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>ACTIVE METHOD</Text>
            </View>
            
            <View style={styles.creditCard}>
              <View style={styles.creditCardIcon}>
                <Icon name="credit-card" size={48} color="rgba(255,255,255,0.2)" />
              </View>
              <Text style={styles.cardType}>CENTURION</Text>
              <Text style={styles.cardNumber}>•••• •••• •••• 8849</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardName}>J.V. STERLING</Text>
                <Text style={styles.cardExpiry}>09/28</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>RECENT INVOICES</Text>
            </View>

            {[
              { id: 'INV-2023-001', date: 'Oct 12, 2023', amount: '$4,500.00', service: 'Aviation Charter' },
              { id: 'INV-2023-002', date: 'Sep 28, 2023', amount: '$1,250.00', service: 'Armoured Transport' }
            ].map(inv => (
              <View key={inv.id} style={styles.invoiceItem}>
                <View>
                  <Text style={styles.invoiceService}>{inv.service}</Text>
                  <Text style={styles.invoiceDetails}>{inv.id} • {inv.date}</Text>
                </View>
                <Text style={styles.invoiceAmount}>{inv.amount}</Text>
              </View>
            ))}
          </ScrollView>
        );
      
      case 'PROMO':
        return (
          <ScrollView style={styles.content} contentContainerStyle={styles.promoContent}>
            <View style={styles.promoCard}>
              <View style={styles.promoGlow} />
              <Text style={styles.promoTitle}>Winter Aviation Credit</Text>
              <Text style={styles.promoDescription}>
                Receive complimentary ground transport with any international jet charter booked before December 2023.
              </Text>
              <View style={styles.promoCodeContainer}>
                <Text style={styles.promoCode}>CODE: ALTITUDE-23</Text>
              </View>
            </View>

            <View style={[styles.promoCard, styles.promoCardExpired]}>
              <Text style={styles.promoTitleExpired}>Monaco GP Access</Text>
              <Text style={styles.promoDescriptionExpired}>
                Exclusive paddock club access included with helicopter transfers.
              </Text>
              <View style={styles.promoCodeContainer}>
                <Text style={styles.promoCodeExpired}>EXPIRED</Text>
              </View>
            </View>
          </ScrollView>
        );
      
      case 'NOTIFICATIONS':
        return (
          <ScrollView style={styles.content}>
            {[
              { title: 'Route Safety Update', time: '2h ago', text: 'Increased traffic reported on N1 route. Alternative path loaded for 14:00 transfer.', urgent: false },
              { title: 'Payment Confirmed', time: '1d ago', text: 'Authorization hold for Booking #4922 released.', urgent: false },
              { title: 'Security Alert', time: '3d ago', text: 'Civil unrest reported near destination sector. Advisory issued.', urgent: true }
            ].map((note, i) => (
              <View key={i} style={[styles.notificationItem, note.urgent && styles.notificationUrgent]}>
                <View style={styles.notificationHeader}>
                  <Text style={[styles.notificationTitle, note.urgent && styles.notificationTitleUrgent]}>
                    {note.title}
                  </Text>
                  <Text style={styles.notificationTime}>{note.time}</Text>
                </View>
                <Text style={styles.notificationText}>{note.text}</Text>
              </View>
            ))}
          </ScrollView>
        );
      
      case 'SETTINGS':
        const settings = [
          { label: 'FaceID Authentication', desc: 'Require biometrics for app entry', active: true },
          { label: 'Real-time Location', desc: 'Allow Ops to track device during active missions', active: true },
          { label: 'Push Notifications', desc: 'Mission updates and security alerts', active: true },
          { label: 'Stealth Mode', desc: 'Dim interface and reduce haptics', active: false },
        ];
        return (
          <ScrollView style={styles.content} contentContainerStyle={styles.settingsContent}>
            {settings.map((setting, i) => (
              <View key={i} style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>{setting.label}</Text>
                  <Text style={styles.settingDesc}>{setting.desc}</Text>
                </View>
                <View style={[styles.toggleContainer, setting.active && styles.toggleContainerActive]}>
                  <View style={[styles.toggleKnob, setting.active && styles.toggleKnobActive]} />
                </View>
              </View>
            ))}
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
            <View style={styles.menuSection}>
              <MenuItem 
                iconName="user" 
                label="PERSONAL INFORMATION" 
                onPress={() => setCurrentSection('PERSONAL')} 
              />
              <MenuItem 
                iconName="credit-card" 
                label="PAYMENT & BILLING" 
                onPress={() => setCurrentSection('BILLING')} 
                value="Visa •• 42"
              />
              <MenuItem 
                iconName="tag" 
                label="PROMOTIONS" 
                onPress={() => setCurrentSection('PROMO')} 
                value="1 Active"
              />
              <MenuItem 
                iconName="bell" 
                label="NOTIFICATIONS" 
                onPress={() => setCurrentSection('NOTIFICATIONS')} 
              />
              <MenuItem 
                iconName="settings" 
                label="USER SETTINGS" 
                onPress={() => setCurrentSection('SETTINGS')} 
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(23,23,23,0.5)',
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
  invoiceAmount: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Courier New',
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
  },
  notificationUrgent: {
    backgroundColor: 'rgba(127,29,29,0.1)',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
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
  notificationTime: {
    fontSize: 9,
    color: '#525252',
    fontFamily: 'Courier New',
    marginLeft: 12,
  },
  notificationText: {
    fontSize: 10,
    color: '#737373',
    lineHeight: 18,
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
});

export default Dashboard;
