import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import RentalAppLayout from '@/app/screens/rentalAppLayout';
import { AppConstants } from '@/constants/appConstants';
import { getStoredCompanyId } from '@/utils/storageUtil';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

interface Driver {
  _id: string;
  name: string;
  profileimg: string;
  license: string;
  phNo: string;
  age: number;
  experience: number;
  cnic: string;
  baseDailyRate: number;
  rating: number;
  completedTrips: number;
}

const DriverScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  
  // Filter states
  const [minExperience, setMinExperience] = useState('');
  const [maxExperience, setMaxExperience] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [minRating, setMinRating] = useState('');
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');

  const applyFilters = useCallback(() => {
    let filtered = [...drivers];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(driver => 
        driver.name.toLowerCase().includes(query) ||
        driver.license.toLowerCase().includes(query) ||
        driver.phNo.toLowerCase().includes(query) ||
        driver.cnic.toLowerCase().includes(query)
      );
    }

    // Apply experience filter
    if (minExperience) {
      filtered = filtered.filter(driver => driver.experience >= parseInt(minExperience));
    }
    if (maxExperience) {
      filtered = filtered.filter(driver => driver.experience <= parseInt(maxExperience));
    }

    // Apply age filter
    if (minAge) {
      filtered = filtered.filter(driver => driver.age >= parseInt(minAge));
    }
    if (maxAge) {
      filtered = filtered.filter(driver => driver.age <= parseInt(maxAge));
    }

    // Apply rating filter
    if (minRating) {
      filtered = filtered.filter(driver => driver.rating >= parseInt(minRating));
    }

    // Apply rate filter
    if (minRate) {
      filtered = filtered.filter(driver => driver.baseDailyRate >= parseInt(minRate));
    }
    if (maxRate) {
      filtered = filtered.filter(driver => driver.baseDailyRate <= parseInt(maxRate));
    }

    setFilteredDrivers(filtered);
    setIsFiltered(true);
  }, [drivers, searchQuery, minExperience, maxExperience, minAge, maxAge, minRating, minRate, maxRate]);

  const resetFilters = () => {
    setSearchQuery('');
    setMinExperience('');
    setMaxExperience('');
    setMinAge('');
    setMaxAge('');
    setMinRating('');
    setMinRate('');
    setMaxRate('');
    setIsFiltered(false);
    setFilteredDrivers(drivers);
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchDrivers = async () => {
        setLoading(true);
        setError('');
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
          
          if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData || `Server responded with ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data && data.data && Array.isArray(data.data)) {
            setDrivers(data.data);
            setFilteredDrivers(data.data);
          } else {
            throw new Error('Unexpected response format: drivers array not found');
          }
        } catch (err) {
          console.error("Error fetching drivers:", err);
          setError(err instanceof Error ? err.message : 'An error occurred while fetching drivers.');
        } finally {
          setLoading(false);
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

  const displayDrivers = isFiltered ? filteredDrivers : drivers;

  return (
    <RentalAppLayout title="Drivers">
      <View style={styles.container}>
        {/* Search and Filter Bar */}
        <View style={styles.searchContainer}>
          <FontAwesome5 name="search" size={16} color="#BDC7D8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search drivers..."
            placeholderTextColor="#BDC7D8"
            value={searchQuery}
            onFocus={() => {
              resetFilters();
            }}
            onChangeText={(text) => {
              setSearchQuery(text);
              applyFilters();
            }}
          />
          <TouchableOpacity 
            style={[
              styles.filterButton,
              isFiltered && styles.filterButtonActive
            ]}
            onPress={() => setShowFilters(true)}
          >
            <FontAwesome5 name="filter" size={16} color="#FFF" />
            {isFiltered && (
              <View style={styles.activeFilterBadge}>
                <Text style={styles.activeFilterText}>!</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {displayDrivers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No drivers found.</Text>
          </View>
        ) : (
          <ScrollView>
            {displayDrivers.map((driver) => (
              <TouchableOpacity
                key={driver._id}
                onPress={() =>
                  router.push({ pathname: '/screens/EditDriver/[driverId]', params: { driverId: driver._id } })
                }
              >
                <View style={styles.driverCard}>
                  {driver.profileimg && (
                    <Image 
                      source={{ uri: driver.profileimg }} 
                      style={styles.driverImage}
                    />
                  )}
                  <View style={styles.driverDetails}>
                    <Text style={styles.driverName}>{driver.name}</Text>
                    <Text style={styles.driverInfo}>License: {driver.license}</Text>
                    <Text style={styles.driverInfo}>Phone: {driver.phNo}</Text>
                    <Text style={styles.driverInfo}>Age: {driver.age} years</Text>
                    <Text style={styles.driverInfo}>Experience: {driver.experience} years</Text>
                    <Text style={styles.driverInfo}>Rate: PKR {driver.baseDailyRate}/day</Text>
                    <Text style={styles.driverInfo}>Rating: {driver.rating}/5</Text>
                    <Text style={styles.driverInfo}>Trips: {driver.completedTrips}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Filter Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showFilters}
          onRequestClose={() => setShowFilters(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Filter Drivers</Text>
              
              <ScrollView>
                {/* Experience Range */}
                <Text style={styles.filterLabel}>Experience (years)</Text>
                <View style={styles.rangeContainer}>
                  <TextInput
                    style={styles.rangeInput}
                    placeholder="Min"
                    placeholderTextColor="#BDC7D8"
                    keyboardType="numeric"
                    value={minExperience}
                    onChangeText={setMinExperience}
                  />
                  <Text style={styles.rangeSeparator}>-</Text>
                  <TextInput
                    style={styles.rangeInput}
                    placeholder="Max"
                    placeholderTextColor="#BDC7D8"
                    keyboardType="numeric"
                    value={maxExperience}
                    onChangeText={setMaxExperience}
                  />
                </View>

                {/* Age Range */}
                <Text style={styles.filterLabel}>Age</Text>
                <View style={styles.rangeContainer}>
                  <TextInput
                    style={styles.rangeInput}
                    placeholder="Min"
                    placeholderTextColor="#BDC7D8"
                    keyboardType="numeric"
                    value={minAge}
                    onChangeText={setMinAge}
                  />
                  <Text style={styles.rangeSeparator}>-</Text>
                  <TextInput
                    style={styles.rangeInput}
                    placeholder="Max"
                    placeholderTextColor="#BDC7D8"
                    keyboardType="numeric"
                    value={maxAge}
                    onChangeText={setMaxAge}
                  />
                </View>

                {/* Rating */}
                <Text style={styles.filterLabel}>Minimum Rating</Text>
                <View style={styles.filterInput}>
                  <Picker
                    selectedValue={minRating}
                    style={styles.picker}
                    onValueChange={(itemValue: string) => setMinRating(itemValue)}
                    dropdownIconColor="#BDC7D8"
                  >
                    <Picker.Item label="Any" value="" />
                    <Picker.Item label="1" value="1" />
                    <Picker.Item label="2" value="2" />
                    <Picker.Item label="3" value="3" />
                    <Picker.Item label="4" value="4" />
                    <Picker.Item label="5" value="5" />
                  </Picker>
                </View>

                {/* Rate Range */}
                <Text style={styles.filterLabel}>Daily Rate (PKR)</Text>
                <View style={styles.rangeContainer}>
                  <TextInput
                    style={styles.rangeInput}
                    placeholder="Min"
                    placeholderTextColor="#BDC7D8"
                    keyboardType="numeric"
                    value={minRate}
                    onChangeText={setMinRate}
                  />
                  <Text style={styles.rangeSeparator}>-</Text>
                  <TextInput
                    style={styles.rangeInput}
                    placeholder="Max"
                    placeholderTextColor="#BDC7D8"
                    keyboardType="numeric"
                    value={maxRate}
                    onChangeText={setMaxRate}
                  />
                </View>

                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.resetButton]}
                    onPress={() => {
                      resetFilters();
                      setShowFilters(false);
                    }}
                  >
                    <Text style={styles.modalButtonText}>Reset All</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.applyButton]}
                    onPress={() => {
                      applyFilters();
                      setShowFilters(false);
                    }}
                  >
                    <Text style={styles.modalButtonText}>Apply Filters</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </RentalAppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003366',
    marginBottom: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#003366',
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
    backgroundColor: '#003366',
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#003366',
  },
  emptyText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A2647',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    marginLeft: 8,
    paddingVertical: 8,
  },
  filterButton: {
    backgroundColor: '#4DA6FF',
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  filterButtonActive: {
    backgroundColor: '#2D5F8B',
  },
  activeFilterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#4DA6FF',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFilterText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  driverCard: {
    flexDirection: 'row',
    backgroundColor: '#1E5A82',
    borderRadius: 10,
    margin: 16,
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0A2647',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterLabel: {
    color: '#BDC7D8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterInput: {
    backgroundColor: '#1E5A82',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#FFF',
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  rangeInput: {
    flex: 1,
    backgroundColor: '#1E5A82',
    borderRadius: 8,
    padding: 12,
    color: '#FFF',
    marginHorizontal: 4,
  },
  rangeSeparator: {
    color: '#BDC7D8',
    marginHorizontal: 8,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  resetButton: {
    backgroundColor: '#1E5A82',
  },
  applyButton: {
    backgroundColor: '#4DA6FF',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DriverScreen;