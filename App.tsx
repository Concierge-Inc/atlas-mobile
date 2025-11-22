import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from './src/services/authService';
import signalrService from './src/services/signalrService';
import { ViewState, ServiceCategory } from './src/utils/types';
import BookingFlow from './src/components/BookingFlow';
import Concierge from './src/components/Concierge';
import Dashboard from './src/components/Dashboard';
import BookingTracker from './src/components/BookingTracker';
import Protocol from './src/components/Protocol';
import Settings from './src/components/Settings';
import Login from './src/components/Login';
import Registration from './src/components/Registration';

type AuthView = 'LOGIN' | 'REGISTER' | null;

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('LOGIN');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isProtocolOpen, setIsProtocolOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const isAuth = await authService.isAuthenticated();
      if (isAuth) {
        // Verify token is still valid by fetching profile
        const user = await authService.getProfile();
        if (user) {
          setIsAuthenticated(true);
          
          // Start SignalR connection for already authenticated users
          try {
            await signalrService.start();
            console.log('✅ SignalR connected on app start');
          } catch (error) {
            console.error('❌ Failed to start SignalR on app start:', error);
          }
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleLogin = async () => {
    // Auth is handled by Login/Registration components
    // Just update the state here
    setIsAuthenticated(true);
    
    // Start SignalR connection after successful login
    try {
      await signalrService.start();
      console.log('✅ SignalR connected after login');
    } catch (error) {
      console.error('❌ Failed to start SignalR:', error);
    }
  };

  const handleLogout = async () => {
    try {
      // Stop SignalR connection before logout
      await signalrService.stop();
      console.log('✅ SignalR disconnected');
      
      await authService.logout();
      setIsAuthenticated(false);
      setAuthView('LOGIN');
      setView(ViewState.HOME);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigateTo = (newView: ViewState) => {
    setView(newView);
    setIsMenuOpen(false);
    if (newView === ViewState.HOME) {
      setSelectedCategory(null);
    }
  };

  const startBooking = (category: ServiceCategory) => {
    setSelectedCategory(category);
    setView(ViewState.BOOKING_FLOW);
  };

  const getCategoryIcon = (cat: ServiceCategory) => {
    const iconMap = {
      AVIATION: 'compass',
      CHAUFFEUR: 'truck',
      ARMOURED: 'shield',
      PROTECTION: 'user-check',
    };
    return iconMap[cat];
  };

  const getCategoryLabel = (cat: ServiceCategory) => {
    const labels = {
      AVIATION: 'PRIVATE AIR\nTRANSFER',
      CHAUFFEUR: 'CHAUFFEUR\nSERVICES',
      ARMOURED: 'ARMOURED\nTRANSPORT',
      PROTECTION: 'PROTECTION\nSERVICES',
    };
    return labels[cat];
  };

  const renderContent = () => {
    switch (view) {
      case ViewState.BOOKING_FLOW:
        if (selectedCategory) {
          return (
            <BookingFlow
              category={selectedCategory}
              onBack={() => navigateTo(ViewState.HOME)}
              onComplete={() => navigateTo(ViewState.CONCIERGE)}
            />
          );
        }
        return null;
      
      case ViewState.CONCIERGE:
        return <Concierge />;
      
      case ViewState.PROFILE:
        return <Dashboard onLogout={handleLogout} />;
      
      case ViewState.HOME:
      default:
        return (
          <ScrollView style={styles.homeContainer} contentContainerStyle={styles.homeContent}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.logoText}>ATLAS</Text>
                <View style={styles.headerDivider} />
                <Text style={styles.headerSubtext}>GLOBAL PRIVATE SERVICES</Text>
              </View>
              <View style={styles.statusContainer}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>ONLINE</Text>
              </View>
            </View>

            {/* Service Grid */}
            <View style={styles.serviceGrid}>
              {(['AVIATION', 'CHAUFFEUR', 'ARMOURED', 'PROTECTION'] as ServiceCategory[]).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={styles.serviceCard}
                  onPress={() => startBooking(cat)}
                  activeOpacity={0.8}
                >
                  <View style={styles.serviceIconContainer}>
                    <View style={styles.serviceIconBox}>
                      <Icon 
                        name={getCategoryIcon(cat)} 
                        size={16} 
                        color="#a3a3a3" 
                      />
                    </View>
                    {cat !== 'PROTECTION' && (
                      <Icon 
                        name="user-check" 
                        size={12} 
                        color="#525252" 
                      />
                    )}
                  </View>

                  <View style={styles.serviceCardContent}>
                    <Text style={styles.serviceLabel}>{getCategoryLabel(cat)}</Text>
                    <View style={styles.serviceDivider} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Booking Tracker */}
            <BookingTracker onChat={() => navigateTo(ViewState.CONCIERGE)} />

            {/* Footer Icon */}
            <View style={styles.footer}>
              <Icon name="command" size={16} color="#404040" />
            </View>
          </ScrollView>
        );
    }
  };

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        <View style={styles.loadingContainer}>
          <Text style={styles.logoText}>ATLAS</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show auth screens if not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        {authView === 'LOGIN' ? (
          <Login 
            onLogin={handleLogin}
            onSwitchToRegister={() => setAuthView('REGISTER')}
          />
        ) : (
          <Registration 
            onRegister={handleLogin}
            onSwitchToLogin={() => setAuthView('LOGIN')}
          />
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      
      <View style={styles.main}>
        {renderContent()}

        {/* Protocol Overlay */}
        {isProtocolOpen && (
          <View style={styles.fullScreenOverlay}>
            <Protocol onClose={() => setIsProtocolOpen(false)} />
          </View>
        )}

        {/* Privacy Overlay */}
        {isPrivacyOpen && (
          <View style={styles.fullScreenOverlay}>
            <Dashboard 
              initialSection="LEGAL_PRIVACY"
              onBack={() => setIsPrivacyOpen(false)}
            />
          </View>
        )}

        {/* Settings Overlay */}
        {isSettingsOpen && (
          <View style={styles.fullScreenOverlay}>
            <Settings onClose={() => setIsSettingsOpen(false)} />
          </View>
        )}

        {/* Menu Overlay */}
        {isMenuOpen && (
          <View style={styles.menuOverlay}>
            <TouchableOpacity 
              style={styles.menuCloseButton}
              onPress={() => setIsMenuOpen(false)}
            >
              <Icon name="x" size={20} color="#525252" />
            </TouchableOpacity>
            
            <View style={styles.menuContent}>
              {['Protocol', 'Privacy', 'Concierge', 'Settings'].map((item) => (
                <TouchableOpacity 
                  key={item}
                  style={styles.menuItem}
                  onPress={() => {
                    if (item === 'Concierge') {
                      navigateTo(ViewState.CONCIERGE);
                    } else if (item === 'Privacy') {
                      setIsPrivacyOpen(true);
                      setIsMenuOpen(false);
                    } else if (item === 'Protocol') {
                      setIsProtocolOpen(true);
                      setIsMenuOpen(false);
                    } else if (item === 'Settings') {
                      setIsSettingsOpen(true);
                      setIsMenuOpen(false);
                    }
                  }}
                >
                  <Text style={styles.menuItemText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.menuFooter}>
              <Text style={styles.menuFooterText}>ENCRYPTED • V 2.5.0</Text>
            </View>
          </View>
        )}

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          {[
            { id: ViewState.HOME, icon: 'home', label: 'Home' },
            { id: ViewState.CONCIERGE, icon: 'message-square', label: 'Chat' },
            { id: ViewState.PROFILE, icon: 'user', label: 'Profile' }
          ].map((item) => {
            const isActive = view === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.navItem}
                onPress={() => navigateTo(item.id)}
              >
                {isActive && <View style={styles.navIndicator} />}
                <Icon
                  name={item.icon}
                  size={16}
                  color={isActive ? '#fff' : '#525252'}
                />
                <Text style={[
                  styles.navLabel,
                  isActive ? styles.navLabelActive : styles.navLabelInactive
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
          
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => setIsMenuOpen(true)}
          >
            <Icon name="menu" size={16} color="#525252" />
            <Text style={[styles.navLabel, styles.navLabelInactive]}>Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  main: {
    flex: 1,
    position: 'relative',
  },
  homeContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  homeContent: {
    paddingBottom: 128,
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 32,
    paddingBottom: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logoText: {
    fontSize: 20,
    color: '#fff',
    letterSpacing: 4,
    fontWeight: '300',
  },
  headerDivider: {
    width: 32,
    height: 1,
    backgroundColor: '#262626',
    marginVertical: 12,
  },
  headerSubtext: {
    fontSize: 9,
    color: '#737373',
    letterSpacing: 3,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#262626',
    position: 'relative',
  },
  statusText: {
    fontSize: 9,
    color: '#525252',
    letterSpacing: 2,
    fontWeight: '600',
    fontFamily: 'Courier New',
  },
  serviceGrid: {
    paddingHorizontal: 24,
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    width: '48%',
    aspectRatio: 4 / 5,
    backgroundColor: 'rgba(23,23,23,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(38,38,38,0.6)',
    padding: 20,
    justifyContent: 'space-between',
  },
  serviceIconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  serviceIconBox: {
    padding: 8,
    backgroundColor: 'rgba(23,23,23,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  serviceCardContent: {
    gap: 12,
  },
  serviceLabel: {
    fontSize: 10,
    color: '#d4d4d4',
    letterSpacing: 2,
    fontWeight: '500',
    lineHeight: 20,
  },
  serviceDivider: {
    width: 16,
    height: 1,
    backgroundColor: '#262626',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    opacity: 0.2,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    backgroundColor: 'rgba(10,10,10,0.98)',
    borderTopWidth: 1,
    borderTopColor: '#171717',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  navIndicator: {
    position: 'absolute',
    top: -20,
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  navLabel: {
    fontSize: 8,
    letterSpacing: 2.5,
    fontWeight: '600',
  },
  navLabelActive: {
    color: '#fff',
  },
  navLabelInactive: {
    color: '#404040',
  },
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0a0a0a',
    zIndex: 200,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0a0a0a',
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuCloseButton: {
    position: 'absolute',
    top: 32,
    right: 32,
    padding: 16,
    zIndex: 101,
  },
  menuContent: {
    gap: 40,
    alignItems: 'center',
  },
  menuItem: {
    paddingVertical: 8,
  },
  menuItemText: {
    fontSize: 18,
    color: '#737373',
    letterSpacing: 2,
    fontWeight: '300',
    textTransform: 'uppercase',
  },
  menuFooter: {
    position: 'absolute',
    bottom: 48,
  },
  menuFooterText: {
    fontSize: 9,
    color: '#404040',
    letterSpacing: 3,
    fontWeight: '600',
  },
});

export default App;
