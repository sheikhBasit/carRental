import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, TextInput, ScrollView, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { FontAwesome5 } from "@expo/vector-icons";
import RentalAppLayout from "@/app/screens/rentalAppLayout";
import { AppConstants } from "@/constants/appConstants";
import { loadCompanyId } from "@/utils/storageUtil";
import { useRouter } from "expo-router";
import { Picker } from '@react-native-picker/picker';
import { apiFetch } from "@/utils/api";

type Vehicle = {
  _id: string;
  carImageUrls: string[];
  manufacturer: string;
  rentalCompany: string;
  rent: number;
  model: string;
  transmission: string;
  capacity: number;
  trips: number;
};

// Update the TransactionData type to match the exact API response structure
type Transaction = {
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
};

type TransactionData = {
  transactions: Transaction[];
  totalTransactions: number;
  totalRevenue: number;
};

type HomeScreenNavigationProp = DrawerNavigationProp<any>;

const CarScreen = () => {
  const router = useRouter();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [cars, setCars] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
// Add these state variables at the top of your CarScreen component
const [searchQuery, setSearchQuery] = useState('');
const [selectedManufacturer, setSelectedManufacturer] = useState('All');
const [selectedModel, setSelectedModel] = useState('All');
const [selectedTransmission, setSelectedTransmission] = useState('All');
const [minRent, setMinRent] = useState('');
const [maxRent, setMaxRent] = useState('');
const [minCapacity, setMinCapacity] = useState('');
const [isFiltered, setIsFiltered] = useState(false);
const [filteredCars, setFilteredCars] = useState<Vehicle[]>([]);
const [showFilters, setShowFilters] = useState(false);

// Add this function to your component
const applyFilters = (
  manufacturer = selectedManufacturer,
  model = selectedModel,
  transmission = selectedTransmission,
  minRentVal = minRent,
  maxRentVal = maxRent,
  minCapacityVal = minCapacity
) => {
  let filtered = [...cars];
  
  // Check if any filter is active
  const hasActiveFilters = Boolean(
    (manufacturer && manufacturer !== 'All') ||
    (model && model !== 'All') ||
    (transmission && transmission !== 'All') ||
    (minRentVal && minRentVal !== '') ||
    (maxRentVal && maxRentVal !== '') ||
    (minCapacityVal && minCapacityVal !== '') ||
    searchQuery.trim().length > 0
  );
  
  setIsFiltered(hasActiveFilters);
  
  // Apply search filter first
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(v => 
      v.manufacturer.toLowerCase().includes(query) ||
      v.model.toLowerCase().includes(query) ||
      v.rentalCompany?.toLowerCase().includes(query)
    );
  }
  
  // Then apply other filters
  if (manufacturer && manufacturer !== 'All') {
    filtered = filtered.filter(v => 
      v.manufacturer.toLowerCase() === manufacturer.toLowerCase()
    );
  }

  if (model && model !== 'All') {
    filtered = filtered.filter(v => 
      v.model.toLowerCase() === model.toLowerCase()
    );
  }

  if (transmission && transmission !== 'All') {
    filtered = filtered.filter(v => 
      v.transmission.toLowerCase() === transmission.toLowerCase()
    );
  }

  if (minCapacityVal) {
    filtered = filtered.filter(v => v.capacity >= parseInt(minCapacityVal));
  }

  if (minRentVal) {
    filtered = filtered.filter(v => v.rent >= parseInt(minRentVal));
  }

  if (maxRentVal) {
    filtered = filtered.filter(v => v.rent <= parseInt(maxRentVal));
  }

  setFilteredCars(filtered);
};

// Call this whenever filters change or data is loaded
useEffect(() => {
  if (cars.length > 0) {
    applyFilters();
  }
}, [cars, searchQuery, selectedManufacturer, selectedModel, selectedTransmission, minRent, maxRent, minCapacity]);

// Add a function to reset all filters
const resetFilters = () => {
  setSearchQuery('');
  setSelectedManufacturer('All');
  setSelectedModel('All');
  setSelectedTransmission('All');
  setMinRent('');
  setMaxRent('');
  setMinCapacity('');
  setIsFiltered(false);
  setFilteredCars([...cars]);
};

// Get unique values for filter dropdowns
const manufacturers = [...new Set(cars.map(car => car.manufacturer))];
const models = [...new Set(cars.map(car => car.model))];
const transmissions = [...new Set(cars.map(car => car.transmission))];
  const handleTransactionsClick = () => {
    if (transactionData) {
      router.push({
        pathname: '/screens/TransactionHistory',
        params: { transactions: JSON.stringify(transactionData.transactions) }
      });
    }
  };

  const handleRevenueClick = () => {
    console.log("[RentalHome] Revenue button clicked");
    if (!transactionData) {
      // console.log("[RentalHome] No transaction data available");
      return;
    }

    console.log("[RentalHome] Processing completed payments");
    const completedPayments = transactionData.transactions
      .filter(txn => {
        console.log(`[RentalHome] Checking payment status for ${txn._id}:`, txn.paymentStatus);
        return txn.paymentStatus === 'completed';
      })
      .map(txn => {
        console.log(`[RentalHome] Formatting payment for ${txn._id}:`, {
          amount: txn.amount,
          date: txn.createdAt,
          transactionId: txn.transactionId
        });
        return {
          amount: txn.amount,
          date: txn.createdAt,
          transactionId: txn.transactionId
        };
      });

    console.log("[RentalHome] Completed payments to be passed:", completedPayments);
    
    if (completedPayments.length === 0) {
      console.log("[RentalHome] No completed payments found");
      Alert.alert("No Revenue Data", "There are no completed payments to display.");
      return;
    }

    router.push({
      pathname: '/screens/RevenueDetails',
      params: { payments: JSON.stringify(completedPayments) }
    });
  };

  const fetchCompanyVehicles = useCallback(async (id: string) => {
    if (!id) return;
  
    try {
      const data = await apiFetch(`/vehicles/company?company=${id}`);
      
      if (data && Array.isArray(data.vehicles)) {
        console.log("Vehicles:", data.vehicles);
        setCars(data.vehicles as Vehicle[]);
      } else {
        console.warn("Unexpected response structure:", data);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  }, []);
  const fetchTransactionData = useCallback(async (id: string) => {
    if (!id) {
      console.log("[RentalHome] No company ID provided for transaction fetch");
      return;
    }
  
    try {
      console.log(`[RentalHome] Fetching transaction data for company ${id}`);
      
      const data = await apiFetch(`/transaction/company/${id}`);
      console.log("[RentalHome] Raw transaction data:", data);
  
      // Handle both array and object responses
      const transactionsArray = Array.isArray(data)
        ? data
        : data.transactions || [];
  
      console.log("[RentalHome] Processed transactions array:", transactionsArray);
  
      // Calculate totals
      const totalTransactions = transactionsArray.length;
      const totalRevenue = transactionsArray
        .filter((txn: Transaction) => {
          console.log(`[RentalHome] Checking transaction ${txn._id}:`, {
            paymentStatus: txn.paymentStatus,
            amount: txn.amount
          });
          return txn.paymentStatus === 'completed';
        })
        .reduce((sum: number, txn: Transaction) => {
          console.log(`[RentalHome] Adding to revenue: ${txn.amount}`);
          return sum + txn.amount;
        }, 0);
  
      console.log("[RentalHome] Calculated totals:", {
        totalTransactions,
        totalRevenue
      });
  
      setTransactionData({
        transactions: transactionsArray,
        totalTransactions,
        totalRevenue
      });
    } catch (error) {
      console.log("[RentalHome] Error fetching transaction data:", error);
    }
  }, []);
  
  


  const loadData = useCallback(async () => {
    console.log("[RentalHome] Starting data load");
    setLoading(true);
    
    try {
      const storedUserId = await loadCompanyId();
      console.log("[RentalHome] Loaded company ID:", storedUserId);
      
      if (storedUserId) {
        setCompanyId(storedUserId);
        console.log("[RentalHome] Fetching company data");
        await Promise.all([
          fetchCompanyVehicles(storedUserId),
          fetchTransactionData(storedUserId)
        ]);
      } else {
        console.log("[RentalHome] Company ID not found in storage");
      }
    } catch (error) {
      console.log("[RentalHome] Error in loadData:", error);
    } finally {
      console.log("[RentalHome] Finished data load");
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchCompanyVehicles, fetchTransactionData]);

  // Initial data load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle refresh when returning to screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });

    return unsubscribe;
  }, [navigation, loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const renderIcon = (name:any, color = "#FFF") => (
    <FontAwesome5 name={name} size={14} color={color} style={styles.icon} />
  );

  return (
    <RentalAppLayout title="Dashboard">
      <View style={styles.container}>
        {loading && !refreshing ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#4DA6FF" />
            <Text style={styles.loadingText}>Loading dashboard data...</Text>
          </View>
        ) : (
          <>
            {/* Dashboard Summary Cards */}
            {transactionData && (
              <View style={styles.summaryContainer}>
                <TouchableOpacity 
                  style={[styles.summaryCard, styles.transactionsCard]}
                  onPress={handleTransactionsClick}
                >
                  <View style={styles.summaryIconContainer}>
                    {renderIcon("exchange-alt")}
                  </View>
                  <View>
                    <Text style={styles.summaryValue}>{transactionData.totalTransactions}</Text>
                    <Text style={styles.summaryLabel}>Transactions</Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.summaryCard, styles.revenueCard]}
                  // onPress={handleRevenueClick}
                >
                  <View style={styles.summaryIconContainer}>
                    {renderIcon("dollar-sign")}
                  </View>
                  <View>
                    <Text style={styles.summaryValue}>PKR {transactionData.totalRevenue.toLocaleString()}</Text>
                    <Text style={styles.summaryLabel}>Revenue</Text>
                  </View>
                </TouchableOpacity>
                
                <View style={[styles.summaryCard, styles.vehiclesCard]}>
                  <View style={styles.summaryIconContainer}>
                    {renderIcon("car")}
                  </View>
                  <View>
                    <Text style={styles.summaryValue}>{cars.length}</Text>
                    <Text style={styles.summaryLabel}>Vehicles</Text>
                  </View>
                </View>
              </View>
            )}
            {/* Search and Filter Section */}
            <View style={styles.searchContainer}>
              <FontAwesome5 name="search" size={16} color="#BDC7D8" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search vehicles..."
                placeholderTextColor="#BDC7D8"
                value={searchQuery}
                onFocus={() => {
                  resetFilters();
                }}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  if (text.trim() !== '') {
                    const filtered = cars.filter(v => 
                      v.manufacturer.toLowerCase().includes(text.toLowerCase()) ||
                      v.model.toLowerCase().includes(text.toLowerCase()) ||
                      v.rentalCompany?.toLowerCase().includes(text.toLowerCase())
                    );
                    setFilteredCars(filtered);
                    setIsFiltered(true);
                  } else {
                    setFilteredCars(cars);
                    setIsFiltered(false);
                  }
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
            {/* Fleet Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Fleet</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => router.push('/screens/addCarScreen')}
              >
                <Text style={styles.addButtonText}>Add Vehicle</Text>
                {renderIcon("plus")}
              </TouchableOpacity>
            </View>
            {/* Filter Modal */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={showFilters}
              onRequestClose={() => setShowFilters(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Filter Vehicles</Text>
                  
                  <ScrollView>
                    {/* Manufacturer Filter */}
                    <Text style={styles.filterLabel}>Make</Text>
                    <View style={styles.filterInput}>
                      <Picker
                        selectedValue={selectedManufacturer}
                        style={styles.picker}
                        onValueChange={(itemValue) => setSelectedManufacturer(itemValue)}
                        dropdownIconColor="#BDC7D8"
                      >
                        <Picker.Item label="All Manufacturers" value="All" />
                        {manufacturers.map((make) => (
                          <Picker.Item key={make} label={make} value={make} />
                        ))}
                      </Picker>
                    </View>

                    {/* Model Filter */}
                    <Text style={styles.filterLabel}>Model</Text>
                    <View style={styles.filterInput}>
                      <Picker
                        selectedValue={selectedModel}
                        style={styles.picker}
                        onValueChange={(itemValue) => setSelectedModel(itemValue)}
                        dropdownIconColor="#BDC7D8"
                      >
                        <Picker.Item label="All Models" value="All" />
                        {models.map((model) => (
                          <Picker.Item key={model} label={model} value={model} />
                        ))}
                      </Picker>
                    </View>

                    {/* Transmission Filter */}
                    <Text style={styles.filterLabel}>Transmission</Text>
                    <View style={styles.filterInput}>
                      <Picker
                        selectedValue={selectedTransmission}
                        style={styles.picker}
                        onValueChange={(itemValue) => setSelectedTransmission(itemValue)}
                        dropdownIconColor="#BDC7D8"
                      >
                        <Picker.Item label="All Types" value="All" />
                        {transmissions.map((trans) => (
                          <Picker.Item key={trans} label={trans} value={trans} />
                        ))}
                      </Picker>
                    </View>

                    {/* Capacity Filter */}
                    <Text style={styles.filterLabel}>Seats</Text>
                    <View style={styles.filterInput}>
                      <Picker
                        selectedValue={minCapacity}
                        style={styles.picker}
                        onValueChange={(itemValue) => setMinCapacity(itemValue)}
                        dropdownIconColor="#BDC7D8"
                      >
                        <Picker.Item label="Any" value="" />
                        {Array.from({length: 9}, (_, i) => i + 4).map((seats) => (
                          <Picker.Item key={seats} label={`${seats} seats`} value={seats.toString()} />
                        ))}
                      </Picker>
                    </View>

                    {/* Rent Range Filter */}
                    <Text style={styles.filterLabel}>Rent Range</Text>
                    <View style={styles.rangeContainer}>
                      <TextInput
                        style={styles.rangeInput}
                        placeholder="Min"
                        placeholderTextColor="#BDC7D8"
                        keyboardType="numeric"
                        value={minRent}
                        onChangeText={setMinRent}
                      />
                      <Text style={styles.rangeSeparator}>-</Text>
                      <TextInput
                        style={styles.rangeInput}
                        placeholder="Max"
                        placeholderTextColor="#BDC7D8"
                        keyboardType="numeric"
                        value={maxRent}
                        onChangeText={setMaxRent}
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
                          setSearchQuery('');
                        }}
                      >
                        <Text style={styles.modalButtonText}>Apply Filters</Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              </View>
            </Modal>
            {cars.length > 0 ? (
              <FlatList
                data={isFiltered ? filteredCars : cars}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl 
                    refreshing={refreshing} 
                    onRefresh={onRefresh}
                    colors={["#4DA6FF"]}
                    tintColor="#4DA6FF"
                  />
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.card}
                    onPress={() => {
                      router.push({ 
                        pathname: '/screens/EditCar/[carId]', 
                        params: { carId: item._id } 
                      });
                    }}
                  >
                    <Image 
                      source={{ uri: item.carImageUrls[0] }} 
                      style={styles.carImage} 
                      resizeMode="cover"
                    />
                    <View style={styles.cardOverlay}>
                      <View style={styles.rentBadge}>
                        <Text style={styles.rentText}>PKR{item.rent}/day</Text>
                      </View>
                    </View>
                    
                    <View style={styles.cardContent}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.carModel}>{item.model}</Text>
                        <Text style={styles.carManufacturer}>{item.manufacturer}</Text>
                      </View>
                      
                      <View style={styles.cardDetails}>
                        <View style={styles.detailItem}>
                          {renderIcon("car", "#4DA6FF")}
                          <Text style={styles.detailText}>{item.transmission}</Text>
                        </View>
                        
                        <View style={styles.detailItem}>
                          {renderIcon("users", "#4DA6FF")}
                          <Text style={styles.detailText}>{item.capacity} seats</Text>
                        </View>
                        
                        <View style={styles.detailItem}>
                          {renderIcon("route", "#4DA6FF")}
                          <Text style={styles.detailText}>{item.trips} trips</Text>
                        </View>
                      </View>
                      
                      <View style={styles.cardFooter}>
                        <TouchableOpacity 
                          style={styles.editButton}
                          onPress={() => {
                            router.push({ 
                              pathname: '/screens/EditCar/[carId]', 
                              params: { carId: item._id } 
                            });
                          }}
                        >
                          <Text style={styles.buttonText}>Edit Details</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={styles.emptyContainer}>
                {renderIcon("car-alt", "#4DA6FF")}
                <Text style={styles.emptyText}>No vehicles in your fleet yet</Text>
                <TouchableOpacity 
                  style={styles.addFirstButton}
                  onPress={() => router.push('/screens/addCarScreen')}
                >
                  <Text style={styles.addFirstButtonText}>Add Your First Vehicle</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
    </RentalAppLayout>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#001F3F", 
    padding: 16
  },
  loaderContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  loadingText: { 
    marginTop: 12, 
    color: "#fff", 
    fontSize: 16,
    fontWeight: "500"
  },
  
  // Summary Cards Styles
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionsCard: {
    backgroundColor: "#0E3D61",
  },
  revenueCard: {
    backgroundColor: "#0A5C36",
  },
  vehiclesCard: {
    backgroundColor: "#614A0A",
  },
  summaryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
  },
  summaryLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  // Search and Filter Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A2647',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
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
  // Section Header Styles
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4DA6FF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#FFF",
    fontWeight: "600",
    marginRight: 6,
    fontSize: 14,
  },
  
  // Card Styles
  card: {
    backgroundColor: "#0A2647",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  carImage: {
    width: "100%",
    height: 180,
  },
  cardOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 12,
  },
  rentBadge: {
    backgroundColor: "#4DA6FF",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  rentText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    marginBottom: 12,
  },
  carModel: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  carManufacturer: {
    fontSize: 16,
    color: "#BDC7D8",
    marginTop: 2,
  },
  cardDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  icon: {
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#FFF",
  },
  cardFooter: {
    marginTop: 8,
    alignItems: "flex-end",
  },
  editButton: {
    backgroundColor: "rgba(77, 166, 255, 0.2)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4DA6FF",
  },
  buttonText: {
    color: "#4DA6FF",
    fontWeight: "600",
    fontSize: 14,
  },
  
  // Empty State Styles
  emptyContainer: { 
    flex: 1,
    justifyContent: "center", 
    alignItems: "center", 
    paddingVertical: 60 
  },
  emptyText: { 
    color: "rgba(255, 255, 255, 0.7)", 
    fontSize: 16,
    marginVertical: 12,
  },
  addFirstButton: {
    backgroundColor: "#4DA6FF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  addFirstButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
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
});

export default CarScreen;