import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import authService from '../services/authService';
import ForgotPassword from './ForgotPassword';

interface LoginProps {
  onLogin: () => void;
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Validation state
  const isLoginValid = email.trim() !== '' && password.trim() !== '';

  if (showForgotPassword) {
    return <ForgotPassword onBack={() => setShowForgotPassword(false)} />;
  }

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await authService.login({ email, password });
      onLogin();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logoText}>ATLAS</Text>
          <View style={styles.headerDivider} />
          <Text style={styles.headerSubtext}>SECURE ACCESS</Text>
        </View>

        {/* Welcome Text */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome Back</Text>
          <Text style={styles.welcomeSubtext}>
            Access your private services dashboard
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={16} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
            <View style={styles.inputContainer}>
              <Icon name="mail" size={16} color="#525252" />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor="#404040"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <View style={styles.inputContainer}>
              <Icon name="lock" size={16} color="#525252" />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#404040"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon 
                  name={showPassword ? 'eye-off' : 'eye'} 
                  size={16} 
                  color="#525252" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={() => setShowForgotPassword(true)}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity 
            style={[
              styles.loginButton, 
              (isLoading || !isLoginValid) && styles.loginButtonDisabled
            ]}
            onPress={handleLogin}
            disabled={isLoading || !isLoginValid}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'AUTHENTICATING...' : 'SECURE LOGIN'}
            </Text>
          </TouchableOpacity>

          {/* Guest Login */}
          <TouchableOpacity 
            style={styles.guestButton}
            onPress={onLogin}
            disabled={isLoading}
          >
            <Text style={styles.guestButtonText}>CONTINUE AS GUEST</Text>
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>New to ATLAS? </Text>
            <TouchableOpacity onPress={onSwitchToRegister}>
              <Text style={styles.registerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.securityBadge}>
            <Icon name="shield" size={12} color="#404040" />
            <Text style={styles.securityText}>256-BIT ENCRYPTED</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 56,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoText: {
    fontSize: 24,
    color: '#fff',
    letterSpacing: 6,
    fontWeight: '300',
  },
  headerDivider: {
    width: 40,
    height: 1,
    backgroundColor: '#262626',
    marginVertical: 16,
  },
  headerSubtext: {
    fontSize: 9,
    color: '#737373',
    letterSpacing: 3,
    fontWeight: '600',
  },
  welcomeContainer: {
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#737373',
    lineHeight: 20,
  },
  form: {
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    marginBottom: 24,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#ef4444',
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 10,
    color: '#737373',
    letterSpacing: 2,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(23,23,23,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(38,38,38,0.8)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    padding: 0,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordText: {
    fontSize: 12,
    color: '#737373',
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    fontSize: 11,
    color: '#0a0a0a',
    letterSpacing: 2.5,
    fontWeight: '700',
  },
  guestButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(38,38,38,0.8)',
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 32,
  },
  guestButtonText: {
    fontSize: 11,
    color: '#737373',
    letterSpacing: 2.5,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#262626',
  },
  dividerText: {
    fontSize: 10,
    color: '#525252',
    letterSpacing: 2,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(23,23,23,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(38,38,38,0.8)',
    paddingVertical: 18,
    gap: 12,
    marginBottom: 32,
  },
  biometricButtonText: {
    fontSize: 11,
    color: '#a3a3a3',
    letterSpacing: 2.5,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 13,
    color: '#737373',
  },
  registerLink: {
    fontSize: 13,
    color: '#fff',
    textDecorationLine: 'underline',
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  securityText: {
    fontSize: 9,
    color: '#404040',
    letterSpacing: 2,
    fontWeight: '600',
  },
});

export default Login;
