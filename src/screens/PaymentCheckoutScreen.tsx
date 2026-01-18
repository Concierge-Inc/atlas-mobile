import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import paymentsService, { CreatePaymentIntentRequest, PaymentIntentDto } from '../services/paymentsService';

interface PaymentCheckoutScreenProps {
  route: {
    params: {
      amount: number;
      currency?: string;
      bookingId?: string;
      invoiceId?: string;
      description?: string;
      discountAmount?: number;
    };
  };
  navigation: any;
}

export const PaymentCheckoutScreen: React.FC<PaymentCheckoutScreenProps> = ({ route, navigation }) => {
  const { amount, currency = 'usd', bookingId, invoiceId, description, discountAmount } = route.params;

  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  const formatCardNumber = (text: string) => {
    return text.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (text: string) => {
    if (text.length === 2 && !text.includes('/')) {
      return text + '/';
    }
    return text;
  };

  const handlePay = async () => {
    // Validation
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      Alert.alert('Error', 'Please enter a valid card number');
      return;
    }

    if (expiry.length !== 5) {
      Alert.alert('Error', 'Please enter a valid expiry date (MM/YY)');
      return;
    }

    if (cvv.length < 3) {
      Alert.alert('Error', 'Please enter a valid CVV');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Error', 'Please enter the cardholder name');
      return;
    }

    setLoading(true);

    try {
      // Create payment intent
      const request: CreatePaymentIntentRequest = {
        amount,
        currency,
        bookingId,
        invoiceId,
        description,
        discountAmount,
      };

      const paymentIntent = await paymentsService.createPaymentIntent(request);

      // In a real app, you would use Stripe SDK to confirm the payment
      // For now, we'll simulate the payment confirmation
      Alert.alert(
        'Payment',
        'This is a demo. In production, Stripe SDK would process the card payment.',
        [
          {
            text: 'Simulate Success',
            onPress: async () => {
              try {
                await paymentsService.confirmPayment({
                  id: paymentIntent.id,
                });
                Alert.alert('Success', 'Payment completed successfully!');
                navigation.goBack();
              } catch (error: any) {
                Alert.alert('Error', error.message || 'Payment confirmation failed');
              }
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = amount - (discountAmount || 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Payment Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Amount</Text>
          <Text style={styles.summaryValue}>
            {paymentsService.formatAmount(amount, currency)}
          </Text>
        </View>

        {discountAmount && discountAmount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount</Text>
            <Text style={[styles.summaryValue, styles.discount]}>
              -{paymentsService.formatAmount(discountAmount, currency)}
            </Text>
          </View>
        )}

        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {paymentsService.formatAmount(totalAmount, currency)}
          </Text>
        </View>

        {description && (
          <Text style={styles.description}>{description}</Text>
        )}
      </View>

      <View style={styles.cardSection}>
        <Text style={styles.sectionTitle}>Card Details</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Card Number</Text>
          <TextInput
            style={styles.input}
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChangeText={(text) => setCardNumber(formatCardNumber(text))}
            keyboardType="number-pad"
            maxLength={19}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputContainer, styles.halfWidth]}>
            <Text style={styles.inputLabel}>Expiry</Text>
            <TextInput
              style={styles.input}
              placeholder="MM/YY"
              value={expiry}
              onChangeText={(text) => setExpiry(formatExpiry(text))}
              keyboardType="number-pad"
              maxLength={5}
            />
          </View>

          <View style={[styles.inputContainer, styles.halfWidth]}>
            <Text style={styles.inputLabel}>CVV</Text>
            <TextInput
              style={styles.input}
              placeholder="123"
              value={cvv}
              onChangeText={setCvv}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Cardholder Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            value={name}
            onChangeText={setName}
          />
        </View>

        <TouchableOpacity
          style={styles.saveCardContainer}
          onPress={() => setSaveCard(!saveCard)}
        >
          <View style={[styles.checkbox, saveCard && styles.checkboxChecked]}>
            {saveCard && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.saveCardText}>Save card for future payments</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.secureNotice}>
        <Text style={styles.secureText}>🔒 Secured by Stripe</Text>
        <Text style={styles.secureSubtext}>
          Your payment information is encrypted and secure
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.payButton, loading && styles.payButtonDisabled]}
        onPress={handlePay}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.payButtonText}>
            Pay {paymentsService.formatAmount(totalAmount, currency)}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  discount: {
    color: '#4CAF50',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  description: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
    fontStyle: 'italic',
  },
  cardSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  saveCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveCardText: {
    fontSize: 14,
    color: '#333',
  },
  secureNotice: {
    alignItems: 'center',
    marginVertical: 16,
  },
  secureText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 4,
  },
  secureSubtext: {
    fontSize: 14,
    color: '#666',
  },
  payButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 16,
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default PaymentCheckoutScreen;
