import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface ProtocolProps {
  onClose: () => void;
}

const Protocol: React.FC<ProtocolProps> = ({ onClose }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Icon name="arrow-left" size={14} color="#737373" />
          <Text style={styles.backText}>MENU</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Operational Protocol</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MISSION SECURITY</Text>
          <Text style={styles.paragraph}>
            All ATLAS operations adhere to strict security protocols. Client identity and movement 
            data are compartmentalized and encrypted using AES-256 military-grade encryption. 
            Real-time location tracking is only active during confirmed bookings and is terminated 
            immediately upon mission completion.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OPERATIONAL PROCEDURES</Text>
          <Text style={styles.paragraph}>
            Every asset deployed through ATLAS undergoes rigorous vetting. Drivers, pilots, and 
            security personnel maintain active clearances and are subject to continuous background 
            monitoring. Vehicle integrity checks are performed before each deployment.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>COMMUNICATION CHANNELS</Text>
          <Text style={styles.paragraph}>
            Direct client communication is conducted exclusively through encrypted channels. 
            Emergency support is available 24/7 via the Concierge interface. All conversations 
            are logged for quality assurance but automatically purged after 30 days unless 
            flagged for incident review.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PAYMENT AUTHORIZATION</Text>
          <Text style={styles.paragraph}>
            Pre-authorization holds are placed at booking confirmation. Final charges are 
            calculated upon service completion and include base rate, operational surcharges, 
            and applicable risk premiums. Itemized invoices are delivered within 24 hours of 
            mission end.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTINGENCY PROTOCOLS</Text>
          <Text style={styles.paragraph}>
            In the event of route deviation, threat escalation, or force majeure circumstances, 
            ATLAS Operations reserves the right to modify mission parameters. Clients will be 
            notified immediately via secure channels. Alternative assets or routes will be 
            deployed without additional authorization required.
          </Text>
        </View>

        <View style={styles.warningBox}>
          <Icon name="alert-triangle" size={16} color="#fca5a5" />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>CRITICAL NOTICE</Text>
            <Text style={styles.warningText}>
              ATLAS is not liable for delays or service interruptions caused by civil unrest, 
              natural disasters, or government actions. High-risk zone operations require 
              additional waivers and carry elevated premiums.
            </Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Icon name="shield" size={14} color="#737373" />
          <Text style={styles.infoText}>
            Last Updated: November 2025 • Protocol Version 2.5.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(23,23,23,0.5)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  backText: {
    fontSize: 9,
    color: '#737373',
    letterSpacing: 2.5,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Georgia',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 9,
    color: '#737373',
    letterSpacing: 2.5,
    fontWeight: '700',
  },
  paragraph: {
    fontSize: 11,
    color: '#a3a3a3',
    lineHeight: 20,
    textAlign: 'justify',
  },
  warningBox: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(127,29,29,0.1)',
    borderWidth: 1,
    borderColor: '#7f1d1d',
    alignItems: 'flex-start',
  },
  warningContent: {
    flex: 1,
    gap: 8,
  },
  warningTitle: {
    fontSize: 10,
    color: '#fca5a5',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  warningText: {
    fontSize: 10,
    color: '#fca5a5',
    lineHeight: 16,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(64,64,64,0.1)',
    borderWidth: 1,
    borderColor: '#262626',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 9,
    color: '#737373',
    fontFamily: 'Courier New',
  },
});

export default Protocol;
