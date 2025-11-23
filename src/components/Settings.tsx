import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface SettingsProps {
  onClose: () => void;
  isGuestMode?: boolean;
}

const Settings: React.FC<SettingsProps> = ({ onClose, isGuestMode = false }) => {
  const [settings, setSettings] = useState({
    faceId: true,
    location: true,
    notifications: true,
    haptics: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    if (isGuestMode) {
      Alert.alert('Guest Mode', 'Please create an account to modify settings.');
      return;
    }
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDeleteAccount = () => {
    if (isGuestMode) {
      Alert.alert('Guest Mode', 'Please create an account first.');
      return;
    }
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. All your data will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion API call
            Alert.alert('Account Deletion', 'Feature will be implemented with backend integration.');
          }
        }
      ]
    );
  };

  const handleResetDefaults = () => {
    if (isGuestMode) {
      Alert.alert('Guest Mode', 'Please create an account first.');
      return;
    }
    Alert.alert(
      'Reset to Defaults',
      'Are you sure you want to reset all settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          onPress: () => {
            setSettings({
              faceId: true,
              location: true,
              notifications: true,
              haptics: true,
            });
            Alert.alert('Success', 'Settings reset to defaults.');
          }
        }
      ]
    );
  };

  const SettingItem = ({ 
    label, 
    description, 
    value, 
    onToggle 
  }: { 
    label: string; 
    description: string; 
    value: boolean; 
    onToggle: () => void;
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDesc}>{description}</Text>
      </View>
      <TouchableOpacity 
        style={[styles.toggleContainer, value && styles.toggleContainerActive]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={[styles.toggleKnob, value && styles.toggleKnobActive]} />
      </TouchableOpacity>
    </View>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Icon name="arrow-left" size={14} color="#737373" />
          <Text style={styles.backText}>MENU</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Settings</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Section title="SECURITY & PRIVACY">
          <SettingItem
            label="FaceID Authentication"
            description="Require biometrics for app entry"
            value={settings.faceId}
            onToggle={() => toggleSetting('faceId')}
          />
          <SettingItem
            label="Real-time Location"
            description="Allow Ops to track device during active missions"
            value={settings.location}
            onToggle={() => toggleSetting('location')}
          />
        </Section>

        <Section title="NOTIFICATIONS">
          <SettingItem
            label="Push Notifications"
            description="Mission updates and security alerts"
            value={settings.notifications}
            onToggle={() => toggleSetting('notifications')}
          />
          <SettingItem
            label="Haptic Feedback"
            description="Tactile responses for interactions"
            value={settings.haptics}
            onToggle={() => toggleSetting('haptics')}
          />
        </Section>

        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>DANGER ZONE</Text>

          <TouchableOpacity 
            style={styles.dangerButton}
            onPress={handleResetDefaults}
          >
            <Icon name="refresh-cw" size={14} color="#fca5a5" />
            <Text style={styles.dangerButtonText}>Reset to Defaults</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.dangerButton, styles.dangerButtonCritical]}
            onPress={handleDeleteAccount}
          >
            <Icon name="x-circle" size={14} color="#ef4444" />
            <Text style={styles.dangerButtonTextCritical}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Icon name="info" size={14} color="#737373" />
          <Text style={styles.infoText}>
            Changes are saved automatically and synced to secure servers.
          </Text>
        </View>

        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>ATLAS Mobile v2.5.0</Text>
          <Text style={styles.buildText}>Build 2024.11.21</Text>
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
    gap: 32,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 9,
    color: '#525252',
    letterSpacing: 2.5,
    fontWeight: '700',
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
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
  dangerZone: {
    borderWidth: 1,
    borderColor: '#7f1d1d',
    padding: 16,
    gap: 12,
  },
  dangerTitle: {
    fontSize: 9,
    color: '#fca5a5',
    letterSpacing: 2.5,
    fontWeight: '700',
    marginBottom: 8,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#7f1d1d',
    backgroundColor: 'rgba(127,29,29,0.05)',
  },
  dangerButtonText: {
    fontSize: 11,
    color: '#fca5a5',
    letterSpacing: 0.5,
  },
  dangerButtonCritical: {
    borderColor: '#991b1b',
    backgroundColor: 'rgba(127,29,29,0.1)',
  },
  dangerButtonTextCritical: {
    fontSize: 11,
    color: '#ef4444',
    letterSpacing: 0.5,
    fontWeight: '600',
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
    lineHeight: 16,
  },
  versionInfo: {
    alignItems: 'center',
    paddingTop: 16,
    gap: 4,
  },
  versionText: {
    fontSize: 10,
    color: '#404040',
    fontFamily: 'Courier New',
    letterSpacing: 1,
  },
  buildText: {
    fontSize: 9,
    color: '#262626',
    fontFamily: 'Courier New',
  },
});

export default Settings;
