import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Transaction {
  _id: string;
  transactionId: string;
  bookingId: {
    _id: string;
    idVehicle: string;
    user: string;
    company: string;
    cityName: string;
    driver: string | null;
    from: string;
    to: string;
    fromTime: string;
    toTime: string;
    intercity: boolean;
    status: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  amount: number;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  __v: number;
}

const TransactionHistoryScreen = () => {
  const router = useRouter();
  const { transactions } = useLocalSearchParams<{ transactions: string }>();
  const parsedTransactions = transactions ? JSON.parse(transactions) as Transaction[] : [];

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionId}>Transaction ID: {item.transactionId}</Text>
        <Text style={[
          styles.status,
          item.paymentStatus === 'completed' ? styles.statusCompleted : 
          item.paymentStatus === 'pending' ? styles.statusPending : 
          styles.statusFailed
        ]}>
          {item.paymentStatus.toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.transactionDetails}>
        <Text style={styles.amount}>PKR {item.amount.toLocaleString()}</Text>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      
      <View style={styles.bookingDetails}>
        <Text style={styles.label}>Booking Period:</Text>
        <Text style={styles.value}>
          {new Date(item.bookingId.from).toLocaleDateString()} - {new Date(item.bookingId.to).toLocaleDateString()}
        </Text>
        <Text style={styles.label}>Payment Method:</Text>
        <Text style={styles.value}>{item.paymentMethod.toUpperCase()}</Text>
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

      <Text style={styles.title}>Transaction History</Text>
      
      <FlatList
        data={parsedTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item._id}
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
  listContainer: {
    paddingBottom: 20,
  },
  transactionCard: {
    backgroundColor: '#0A2647',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionId: {
    color: '#ADD8E6',
    fontSize: 14,
  },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusCompleted: {
    backgroundColor: '#4CD964',
    color: '#FFF',
  },
  statusPending: {
    backgroundColor: '#FF9500',
    color: '#FFF',
  },
  statusFailed: {
    backgroundColor: '#FF3B30',
    color: '#FFF',
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  bookingDetails: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
  },
  label: {
    color: '#ADD8E6',
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    color: '#FFF',
    fontSize: 14,
    marginBottom: 8,
  },
});

export default TransactionHistoryScreen; 