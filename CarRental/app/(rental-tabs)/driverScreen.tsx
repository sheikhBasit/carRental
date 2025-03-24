import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import RentalAppLayout from '@/app/screens/rentalAppLayout';
import { AppConstants } from '@/constants/appConstants';
import { getStoredCompanyId } from '@/utils/storageUtil';
import { useRouter } from 'expo-router';

interface Driver {
  _id: string;
  name: string;
  profileimg: string;
  license: string;
  phNo: string;
  age: number;
  experience: number;
  cnic: string;
}

const DriverScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      const fetchDrivers = async () => {
        setLoading(true); // Start loading
        setError(''); // Clear any previous error
        try {
          const companyId = await getStoredCompanyId();
          if (!companyId) {
            setError('Company ID not found.');
            setLoading(false);
            return;
          }

          const response = await fetch(
            `${AppConstants.LOCAL_URL}/drivers/company?company=${companyId}`
          );
          const data = await response.json();
          console.log(data.drivers);
          
          if (response.ok) {
            if (Array.isArray(data.drivers)) {
              setDrivers(data.drivers);
              setError('');
            } else {
              setError('Unexpected response format.');
            }
          } else {
            setError(data?.message || 'Failed to fetch drivers.');
          }
        } catch (err) {
          setError('An error occurred while fetching drivers.');
          console.error(err);
        } finally {
          setLoading(false); // Stop loading
        }
      };

      fetchDrivers();
    }, [])
  );

  if (loading) {
    return (
      <RentalAppLayout title="Drivers">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading drivers...</Text>
        </View>
      </RentalAppLayout>
    );
  }

  if (error) {
    return (
      <RentalAppLayout title="Drivers">
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </RentalAppLayout>
    );
  }

  if (drivers.length === 0) {
    return (
      <RentalAppLayout title="Drivers">
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No drivers found.</Text>
        </View>
      </RentalAppLayout>
    );
  }

  return (
    <RentalAppLayout title="Drivers">
      <ScrollView style={styles.container}>
        {drivers.map((driver) => (
          <TouchableOpacity
            key={driver._id}
            onPress={() =>
              router.push({ pathname: '/screens/EditDriver/[driverId]', params: { driverId: driver._id } })
            }
          >
            <View style={styles.driverCard}>
              {driver.profileimg && (
                <Image source={{ uri: driver.profileimg }} style={styles.driverImage} />
              )}
              <View style={styles.driverDetails}>
                <Text style={styles.driverName}>{driver.name}</Text>
                <Text style={styles.driverInfo}>License: {driver.license}</Text>
                <Text style={styles.driverInfo}>Phone: {driver.phNo}</Text>
                <Text style={styles.driverInfo}>Age: {driver.age} years</Text>
                <Text style={styles.driverInfo}>Experience: {driver.experience} years</Text>
                <Text style={styles.driverInfo}>CNIC: {driver.cnic}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </RentalAppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#003366",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  driverCard: {
    flexDirection: 'row',
    backgroundColor: '#1E5A82',
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  driverImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 15,
  },
  driverDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  driverInfo: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 3,
  },
});

export default DriverScreen;
