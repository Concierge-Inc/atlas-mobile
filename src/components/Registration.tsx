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

interface RegistrationProps {
  onRegister: () => void;
  onSwitchToLogin: () => void;
}

type RegistrationStep = 'CREDENTIALS' | 'PERSONAL' | 'VERIFICATION' | 'COMPLETE';

const Registration: React.FC<RegistrationProps> = ({ onRegister, onSwitchToLogin }) => {
  const [step, setStep] = useState<RegistrationStep>('CREDENTIALS');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNextStep = async () => {
    setError(null);
    
    // Validation
    if (step === 'CREDENTIALS') {
      if (!email || !password || !confirmPassword) {
        setError('Please fill in all fields');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      setStep('PERSONAL');
      return;
    }
    
    if (step === 'PERSONAL') {
      if (!firstName || !lastName) {
        setError('Please enter your name');
        return;
      }
      
      // Call registration API
      setIsLoading(true);
      try {
        await authService.register({
          email,
          password,
          firstName,
          lastName,
          phoneNumber: phone || undefined,
        });
        
        // Skip verification for now and go to complete
        setStep('COMPLETE');
        setTimeout(() => {
          onRegister();
        }, 2000);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Registration failed';
        setError(errorMessage);
        Alert.alert('Registration Failed', errorMessage);
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    if (step === 'VERIFICATION') {
      if (!verificationCode || verificationCode.length !== 6) {
        setError('Please enter a valid 6-digit code');
        return;
      }
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setStep('COMPLETE');
        setTimeout(() => {
          onRegister();
        }, 2000);
      }, 800);
    }
  };

  const handleBack = () => {
    if (step === 'PERSONAL') {
      setStep('CREDENTIALS');
    } else if (step === 'VERIFICATION') {
      setStep('PERSONAL');
    }
  };

  const renderStepIndicator = () => {
    const steps = ['CREDENTIALS', 'PERSONAL', 'VERIFICATION'];
    const currentIndex = steps.indexOf(step);

    return (
      <View style={styles.stepIndicator}>
        {steps.map((s, index) => (
          <View key={s} style={styles.stepContainer}>
            <View style={[
              styles.stepDot,
              index <= currentIndex && styles.stepDotActive
            ]} />
            {index < steps.length - 1 && (
              <View style={[
                styles.stepLine,
                index < currentIndex && styles.stepLineActive
              ]} />
            )}
          </View>
        ))}
      </View>
    );
  };

  if (step === 'COMPLETE') {
    return (
      <View style={styles.container}>
        <View style={styles.completeContainer}>
          <View style={styles.completeIconContainer}>
            <Icon name="check-circle" size={64} color="#737373" />
          </View>
          <Text style={styles.completeTitle}>Registration Complete</Text>
          <Text style={styles.completeSubtext}>
            Your account has been created successfully.{'\n'}
            Redirecting to dashboard...
          </Text>
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
          {step !== 'CREDENTIALS' && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Icon name="arrow-left" size={20} color="#737373" />
            </TouchableOpacity>
          )}
          <View style={styles.headerContent}>
            <Text style={styles.logoText}>ATLAS</Text>
            <View style={styles.headerDivider} />
            <Text style={styles.headerSubtext}>NEW REGISTRATION</Text>
          </View>
        </View>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Title */}
        <View style={styles.stepTitleContainer}>
          <Text style={styles.stepTitle}>
            {step === 'CREDENTIALS' && 'Create Account'}
            {step === 'PERSONAL' && 'Personal Details'}
            {step === 'VERIFICATION' && 'Verify Identity'}
          </Text>
          <Text style={styles.stepSubtext}>
            {step === 'CREDENTIALS' && 'Set up your secure credentials'}
            {step === 'PERSONAL' && 'Provide your contact information'}
            {step === 'VERIFICATION' && 'Enter the code sent to your email'}
          </Text>
        </View>

        {/* Form Content */}
        <View style={styles.form}>
          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={16} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {step === 'CREDENTIALS' && (
            <>
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

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PASSWORD</Text>
                <View style={styles.inputContainer}>
                  <Icon name="lock" size={16} color="#525252" />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Minimum 8 characters"
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

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
                <View style={styles.inputContainer}>
                  <Icon name="lock" size={16} color="#525252" />
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Re-enter password"
                    placeholderTextColor="#404040"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                </View>
              </View>
            </>
          )}

          {step === 'PERSONAL' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>FIRST NAME</Text>
                <View style={styles.inputContainer}>
                  <Icon name="user" size={16} color="#525252" />
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="John"
                    placeholderTextColor="#404040"
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>LAST NAME</Text>
                <View style={styles.inputContainer}>
                  <Icon name="user" size={16} color="#525252" />
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Doe"
                    placeholderTextColor="#404040"
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PHONE NUMBER</Text>
                <View style={styles.inputContainer}>
                  <Icon name="phone" size={16} color="#525252" />
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+1 (555) 000-0000"
                    placeholderTextColor="#404040"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </>
          )}

          {step === 'VERIFICATION' && (
            <>
              <View style={styles.verificationInfo}>
                <Icon name="mail" size={24} color="#525252" />
                <Text style={styles.verificationText}>
                  We've sent a 6-digit verification code to{'\n'}
                  <Text style={styles.verificationEmail}>{email}</Text>
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>VERIFICATION CODE</Text>
                <View style={styles.inputContainer}>
                  <Icon name="shield" size={16} color="#525252" />
                  <TextInput
                    style={styles.input}
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    placeholder="000000"
                    placeholderTextColor="#404040"
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.resendButton}>
                <Text style={styles.resendButtonText}>Resend Code</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Next Button */}
          <TouchableOpacity 
            style={[styles.nextButton, isLoading && styles.nextButtonDisabled]}
            onPress={handleNextStep}
            disabled={isLoading}
          >
            <Text style={styles.nextButtonText}>
              {isLoading ? 'PROCESSING...' : 
               step === 'VERIFICATION' ? 'COMPLETE REGISTRATION' : 'CONTINUE'}
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          {step === 'CREDENTIALS' && (
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={onSwitchToLogin}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By registering, you agree to our Terms & Privacy Policy
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
    paddingHorizontal: 32,
    paddingTop: 56,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
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
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#262626',
  },
  stepDotActive: {
    backgroundColor: '#737373',
  },
  stepLine: {
    width: 40,
    height: 1,
    backgroundColor: '#262626',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#737373',
  },
  stepTitleContainer: {
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  stepSubtext: {
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
  verificationInfo: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 16,
  },
  verificationText: {
    fontSize: 13,
    color: '#737373',
    textAlign: 'center',
    lineHeight: 20,
  },
  verificationEmail: {
    color: '#fff',
    fontWeight: '500',
  },
  resendButton: {
    alignSelf: 'center',
    marginBottom: 32,
  },
  resendButtonText: {
    fontSize: 12,
    color: '#737373',
    textDecorationLine: 'underline',
  },
  nextButton: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 11,
    color: '#0a0a0a',
    letterSpacing: 2.5,
    fontWeight: '700',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 13,
    color: '#737373',
  },
  loginLink: {
    fontSize: 13,
    color: '#fff',
    textDecorationLine: 'underline',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 11,
    color: '#525252',
    textAlign: 'center',
    lineHeight: 16,
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  completeIconContainer: {
    marginBottom: 32,
  },
  completeTitle: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
    fontFamily: 'Georgia',
    marginBottom: 16,
  },
  completeSubtext: {
    fontSize: 14,
    color: '#737373',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default Registration;
