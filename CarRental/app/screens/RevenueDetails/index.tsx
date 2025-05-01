import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Payment {
  amount: number;
  date: string;
  transactionId: string;
}

const RevenueDetailsScreen = () => {
  const router = useRouter();
  const { payments } = useLocalSearchParams<{ payments: string }>();
  const parsedPayments = payments ? JSON.parse(payments) as Payment[] : [];

  const totalRevenue = parsedPayments.reduce((sum, payment) => sum + payment.amount, 0);

  const renderPayment = ({ item }: { item: Payment }) => (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <Text style={styles.transactionId}>Transaction ID: {item.transactionId}</Text>
      </View>
      
      <View style={styles.paymentDetails}>
        <Text style={styles.amount}>PKR {item.amount.toLocaleString()}</Text>
        <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#FFF" />
      </TouchableOpacity>

      <Text style={styles.title}>Revenue Details</Text>
      
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Revenue</Text>
        <Text style={styles.summaryAmount}>PKR {totalRevenue.toLocaleString()}</Text>
        <Text style={styles.summarySubtitle}>{parsedPayments.length} Completed Payments</Text>
      </View>
      
      <FlatList
        data={parsedPayments}
        renderItem={renderPayment}
        keyExtractor={(item) => item.transactionId}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003366',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 100,
    marginBottom: 20,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#0A2647',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#ADD8E6',
    fontSize: 16,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CD964',
    marginBottom: 4,
  },
  summarySubtitle: {
    color: '#ADD8E6',
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 20,
  },
  paymentCard: {
    backgroundColor: '#0A2647',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  paymentHeader: {
    marginBottom: 12,
  },
  transactionId: {
    color: '#ADD8E6',
    fontSize: 14,
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CD964',
  },
  date: {
    color: '#ADD8E6',
    fontSize: 14,
  },
});

export default RevenueDetailsScreen; 