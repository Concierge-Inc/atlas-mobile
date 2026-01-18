import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import paymentsService, { PaymentIntentDto } from '../services/paymentsService';

interface PaymentDetailScreenProps {
  route: {
    params: {
      paymentId: string;
    };
  };
}

export const PaymentDetailScreen: React.FC<PaymentDetailScreenProps> = ({ route }) => {
  const { paymentId } = route.params;
  const [payment, setPayment] = useState<PaymentIntentDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentDetails();
  }, [paymentId]);

  const loadPaymentDetails = async () => {
    try {
      const details = await paymentsService.getPaymentIntent(paymentId);
      setPayment(details);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = () => {
    if (!payment) return;

    Alert.alert(
      'Request Refund',
      'Are you sure you want to request a refund for this payment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Refund',
          style: 'destructive',
          onPress: async () => {
            try {
              await paymentsService.refundPayment({
                id: payment.id,
                reason: 'Customer requested refund',
              });
              Alert.alert('Success', 'Refund request submitted successfully');
              loadPaymentDetails();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to process refund');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading payment details...</Text>
      </View>
    );
  }

  if (!payment) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Payment not found</Text>
      </View>
    );
  }

  const statusColor = paymentsService.getPaymentStatusColor(payment.status);
  const statusText = paymentsService.getPaymentStatusText(payment.status);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
        <Text style={styles.amount}>
          {paymentsService.formatAmount(payment.totalAmount, payment.currency)}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Information</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Payment ID</Text>
          <Text style={styles.value}>{payment.id}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Stripe ID</Text>
          <Text style={styles.value}>{payment.stripePaymentIntentId}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>
            {new Date(payment.createdAt).toLocaleString()}
          </Text>
        </View>

        {payment.completedAt && (
          <View style={styles.row}>
            <Text style={styles.label}>Completed At</Text>
            <Text style={styles.value}>
              {new Date(payment.completedAt).toLocaleString()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Amount Details</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Amount</Text>
          <Text style={styles.value}>
            {paymentsService.formatAmount(payment.amount, payment.currency)}
          </Text>
        </View>

        {payment.discountAmount && payment.discountAmount > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Discount</Text>
            <Text style={[styles.value, styles.discount]}>
              -{paymentsService.formatAmount(payment.discountAmount, payment.currency)}
            </Text>
          </View>
        )}

        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.label}>Total</Text>
          <Text style={[styles.value, styles.total]}>
            {paymentsService.formatAmount(payment.totalAmount, payment.currency)}
          </Text>
        </View>
      </View>

      {payment.bookingId && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Related Booking</Text>
          <Text style={styles.value}>{payment.bookingId}</Text>
        </View>
      )}

      {payment.invoiceId && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Related Invoice</Text>
          <Text style={styles.value}>{payment.invoiceId}</Text>
        </View>
      )}

      {payment.status === 'Failed' && payment.failureReason && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Failure Reason</Text>
          <View style={styles.failureContainer}>
            <Text style={styles.failureReason}>{payment.failureReason}</Text>
          </View>
        </View>
      )}

      {payment.status === 'Completed' && (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.refundButton}
            onPress={handleRefund}
          >
            <Text style={styles.refundButtonText}>Request Refund</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    borderTopColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
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
  total: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  failureContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
  },
  failureReason: {
    fontSize: 14,
    color: '#D32F2F',
  },
  refundButton: {
    backgroundColor: '#D32F2F',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  refundButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentDetailScreen;
