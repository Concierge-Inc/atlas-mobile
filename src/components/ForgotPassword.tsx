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

interface ForgotPasswordProps {
  onBack: () => void;
}

type ForgotPasswordStep = 'EMAIL' | 'SUCCESS';

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
  const [step, setStep] = useState<ForgotPasswordStep>('EMAIL');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmailValid = email.trim() !== '' && email.includes('@');

  const handleSubmit = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await authService.requestPasswordReset(email);
      setStep('SUCCESS');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset email';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'SUCCESS') {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <Icon name="mail" size={64} color="#737373" />
          </View>
          <Text style={styles.successTitle}>Check Your Email</Text>
          <Text style={styles.successSubtext}>
            We've sent password reset instructions to{'\n'}
            <Text style={styles.emailText}>{email}</Text>
          </Text>
          <Text style={styles.successNote}>
            Please check your inbox and follow the link to reset your password.
          </Text>
          <TouchableOpacity 
            style={styles.backToLoginButton}
            onPress={onBack}
          >
            <Text style={styles.backToLoginButtonText}>BACK TO LOGIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Icon name="arrow-left" size={20} color="#737373" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.logoText}>ATLAS</Text>
            <View style={styles.headerDivider} />
            <Text style={styles.headerSubtext}>PASSWORD RECOVERY</Text>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you instructions to reset your password.
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

          {/* Submit Button */}
          <TouchableOpacity 
            style={[
              styles.submitButton, 
              (isLoading || !isEmailValid) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isLoading || !isEmailValid}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'SENDING...' : 'SEND RESET LINK'}
            </Text>
          </TouchableOpacity>

          {/* Back to Login */}
          <TouchableOpacity 
            style={styles.backLink}
            onPress={onBack}
          >
            <Icon name="arrow-left" size={14} color="#737373" />
            <Text style={styles.backLinkText}>Back to Login</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            For security reasons, password reset links expire after 24 hours.
          </Text>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 48,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
    zIndex: 1,
  },
  headerContent: {
    alignItems: 'center',
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
  titleContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  subtitle: {
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
  submitButton: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 11,
    color: '#0a0a0a',
    letterSpacing: 2.5,
    fontWeight: '700',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  backLinkText: {
    fontSize: 12,
    color: '#737373',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#404040',
    textAlign: 'center',
    lineHeight: 18,
  },
  // Success screen styles
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#0f0f0f',
    borderWidth: 2,
    borderColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  successTitle: {
    fontFamily: 'Georgia',
    fontSize: 28,
    fontWeight: '600',
    color: '#fafafa',
    marginBottom: 16,
  },
  successSubtext: {
    fontSize: 13,
    color: '#737373',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  emailText: {
    color: '#fafafa',
    fontWeight: '600',
  },
  successNote: {
    fontSize: 12,
    color: '#525252',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  backToLoginButton: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    height: 52,
    paddingHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backToLoginButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0a0a0a',
    letterSpacing: 1.5,
  },
});

export default ForgotPassword;
