import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import paymentsService, { PaymentIntentDto } from '../services/paymentsService';

interface PaymentScreenProps {
  navigation: any;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({ navigation }) => {
  const [payments, setPayments] = useState<PaymentIntentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPayments = async () => {
    try {
      const history = await paymentsService.getPaymentHistory();
      setPayments(history);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load payment history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadPayments();
  };

  const renderPaymentItem = (payment: PaymentIntentDto) => {
    const statusColor = paymentsService.getPaymentStatusColor(payment.status);
    const statusText = paymentsService.getPaymentStatusText(payment.status);

    return (
      <TouchableOpacity
        key={payment.id}
        style={styles.paymentCard}
        onPress={() => navigation.navigate('PaymentDetail', { paymentId: payment.id })}
      >
        <View style={styles.paymentHeader}>
          <Text style={styles.paymentAmount}>
            {paymentsService.formatAmount(payment.totalAmount, payment.currency)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>

        <Text style={styles.paymentId}>
          ID: {payment.id.slice(0, 8)}...
        </Text>

        {payment.description && (
          <Text style={styles.paymentDescription}>{payment.description}</Text>
        )}

        <View style={styles.paymentDetails}>
          <Text style={styles.paymentDate}>
            {new Date(payment.createdAt).toLocaleDateString()}
          </Text>
          {payment.discountAmount && payment.discountAmount > 0 && (
            <Text style={styles.discount}>
              Discount: -{paymentsService.formatAmount(payment.discountAmount, payment.currency)}
            </Text>
          )}
        </View>

        {payment.bookingId && (
          <Text style={styles.relatedInfo}>Booking: {payment.bookingId.slice(0, 8)}...</Text>
        )}
        {payment.invoiceId && (
          <Text style={styles.relatedInfo}>Invoice: {payment.invoiceId.slice(0, 8)}...</Text>
        )}

        {payment.status === 'Failed' && payment.failureReason && (
          <View style={styles.failureContainer}>
            <Text style={styles.failureReason}>{payment.failureReason}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading payment history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payment History</Text>
        <Text style={styles.headerSubtitle}>{payments.length} transactions</Text>
      </View>

      {payments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No payment history yet</Text>
          <Text style={styles.emptySubtext}>Your transactions will appear here</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {payments.map(renderPaymentItem)}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  paymentId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  paymentDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  paymentDate: {
    fontSize: 14,
    color: '#666',
  },
  discount: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  relatedInfo: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  failureContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  failureReason: {
    fontSize: 14,
    color: '#D32F2F',
  },
});

export default PaymentScreen;
