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

type SectionType = 'MAIN' | 'PERSONAL' | 'BILLING';

const Dashboard: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<SectionType>('MAIN');

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
          onPress={() => setCurrentSection('MAIN')} 
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={14} color="#737373" />
          <Text style={styles.backText}>PROFILE</Text>
        </TouchableOpacity>
      ) : (
        <View>
          <Text style={styles.headerTitle}>Client Profile</Text>
          <Text style={styles.clientId}>ID: 8849-ALPHA</Text>
        </View>
      )}
      {currentSection !== 'MAIN' && (
        <Text style={styles.sectionTitle}>{title}</Text>
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
                onPress={() => {}} 
                value="1 Active"
              />
              <MenuItem 
                iconName="bell" 
                label="NOTIFICATIONS" 
                onPress={() => {}} 
              />
              <MenuItem 
                iconName="settings" 
                label="USER SETTINGS" 
                onPress={() => {}} 
              />
            </View>

            <View style={styles.legalSection}>
              <Text style={styles.legalHeader}>LEGAL & COMPLIANCE</Text>
              <TouchableOpacity style={styles.legalLink}>
                <Text style={styles.legalLinkText}>Legal Notice</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.legalLink}>
                <Text style={styles.legalLinkText}>Privacy Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.legalLink}>
                <Text style={styles.legalLinkText}>Terms & Conditions</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton}>
              <Icon name="log-out" size={12} color="#737373" />
              <Text style={styles.logoutText}>SECURE LOGOUT</Text>
            </TouchableOpacity>
          </ScrollView>
        );
    }
  };

  return (
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
});

export default Dashboard;
