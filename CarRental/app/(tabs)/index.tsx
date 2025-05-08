import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, ScrollView, Image, TouchableOpacity, 
  StyleSheet, ActivityIndicator, Modal, Pressable, Platform, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppLayout from '../screens/AppLayout';
import { loadCity } from '@/utils/storageUtil';
import { AppConstants } from '@/constants/appConstants';
import { router } from 'expo-router';
import { useLikedVehicles } from '@/components/layout/LikedVehicleContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { apiFetch } from '@/utils/api';
  
type CarProps = {
  _id: string;
  manufacturer: string;
  model: string;
  rent: number;
  capacity: number;
  transmission: string;
  carImageUrls: string[];
  company: {
    _id: string;
    companyName: string;
  };
  trips: number;
  numberPlate: string;
  cities: {
    name: string;
    additionalFee: number;
  }[];
  availability: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  bookings?: string[]; // Optional array of booking IDs
  vehicleType?: string;
  year?: number;
  features?: string[];
  fuelType?: string;
  blackoutDates?: string[];
};

const ExploreScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState('All');
  const [vehicles, setVehicles] = useState<CarProps[]>([]);
  const [allVehicles, setAllVehicles] = useState<CarProps[]>([]); // Store all vehicles for filtering
  const [manufacturers, setManufacturers] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [userCity, setUserCity] = useState('');

  const [minRent, setMinRent] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedModel, setSelectedModel] = useState('All');
  const [selectedVehicleType, setSelectedVehicleType] = useState('All');
  const [minYear, setMinYear] = useState('');
  const [maxYear, setMaxYear] = useState('');

  const [minCapacity, setMinCapacity] = useState('');
  const [selectedTransmission, setSelectedTransmission] = useState('All');
  const [selectedFuelType, setSelectedFuelType] = useState('All');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [showToTimePicker, setShowToTimePicker] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);

  const { likedVehicles, toggleLike } = useLikedVehicles();

  useEffect(() => {
    fetchManufacturers();
    fetchVehicles();
  }, []);

  const fetchManufacturers = async () => {
    try {

      const data: string[] = await apiFetch(`/vehicles/getManufacturers`,{},undefined,  'user');
      console.log('Manufacturers API response:', data);
      setManufacturers(['All', ...data]);
    } catch (err: any) {
      console.log('Error fetching manufacturers:', err.message);
    }
  };

  const fetchVehicles = async () => {
    try {
      const storedCity = await loadCity();
      if (!storedCity) {
        setError('City not found. Please select a city.');
        setLoading(false);
        return;
      }
      setUserCity(storedCity);
      setSelectedCity(storedCity);

      const responseData = await apiFetch(`/vehicles/getCityVehicle?city=${storedCity}`,{},undefined,  'user');
      console.log('Raw response data:', responseData);
      if (!responseData.data || !Array.isArray(responseData.data)) {
        console.log('Response data is not in the expected format:', responseData);
        setVehicles([]);
        setAllVehicles([]);
        setLoading(false);
        return;
      }
      setVehicles(responseData.data);
      setAllVehicles(responseData.data);
      console.log('Fetched vehicles:', responseData.data);
    } catch (err: any) {
      console.log('Error fetching vehicles:', err);
      setError(err.message || 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (car: CarProps) => {
    try {
    
      router.push({
        pathname: "/screens/bookNow/[car]",
        params: {
          car: JSON.stringify(car),
        },
      });
    } catch (error) {
      console.log("Navigation error:", error);
      Alert.alert('Error', 'Failed to navigate to booking page. Please try again.');
    }
  };

  const handleManufacturerSelect = (manufacturer: string) => {
    setSelectedManufacturer(manufacturer);
    setSelectedModel('All');
    // Only apply manufacturer filter, not city filter
    applyFilters(manufacturer, 'All', minRent, maxRent);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    // Only apply search filter, don't reset other filters
    const filtered = allVehicles.filter(v => {
      const query = text.toLowerCase().trim();
      if (!query) return true;
      
      return (
        v.manufacturer.toLowerCase().includes(query) ||
        v.model.toLowerCase().includes(query) ||
        v.company?.companyName?.toLowerCase().includes(query) ||
        v.vehicleType?.toLowerCase().includes(query) ||
        v.cities.some(c => c.name.toLowerCase().includes(query))
      );
    });
    setVehicles(filtered);
    setIsFiltered(text.trim().length > 0);
  };

  const resetFilters = () => {
    setSelectedManufacturer('All');
    setSelectedModel('All');
    setMinYear('');
    setMaxYear('');
    setSelectedVehicleType('All');
    setMinCapacity('');
    setSelectedTransmission('All');
    setSelectedFuelType('All');
    setSelectedFeatures([]);
    setMinRent('');
    setMaxRent('');
    setSelectedCity(userCity);
    setSearchQuery('');
    setIsFiltered(false);
    setVehicles(allVehicles);
  };

  const getAvailableCities = () => {
    const cities = new Set<string>();
    allVehicles.forEach(vehicle => {
      vehicle.cities.forEach(city => {
        cities.add(city.name);
      });
    });
    return Array.from(cities);
  };
  const availableCities = getAvailableCities();

  const getModelsForManufacturer = () => {
    if (selectedManufacturer === 'All') {
      const allModels = allVehicles.map(v => v.model);
      return ['All', ...Array.from(new Set(allModels))];
    }
    const filtered = allVehicles.filter(v => v.manufacturer === selectedManufacturer);
    const models = filtered.map(v => v.model);
    return ['All', ...Array.from(new Set(models))];
  };
  const models = getModelsForManufacturer();

  const getVehicleTypes = () => {
    const types = allVehicles.map(v => v.vehicleType).filter(Boolean);
    return ['All', ...Array.from(new Set(types))];
  };
  const vehicleTypes = getVehicleTypes();

  const getYears = () => {
    const years = allVehicles.map(v => v.year).filter((y): y is number => typeof y === 'number');
    return ['All', ...Array.from(new Set(years)).sort((a = 0, b = 0) => b - a).map(String)];
  };
  const years = getYears();

  const getAllFeatures = () => {
    const features = allVehicles.flatMap(v => v.features || []);
    return Array.from(new Set(features));
  };
  const allFeatures = getAllFeatures();

  const applyFilters = (
    manufacturer = selectedManufacturer,
    city = selectedCity,
    minRentVal = minRent,
    maxRentVal = maxRent
  ) => {
    console.log('Applying filters with:', {
      city,
      manufacturer,
      minRentVal,
      maxRentVal,
      minYear,
      maxYear,
      minCapacity,
      selectedFeatures,
      selectedFuelType,
      selectedModel,
      selectedTransmission,
      selectedVehicleType,
      searchQuery
    });
  
    let filtered = [...allVehicles];
    
    // Check if any filter is active
    const hasActiveFilters = Boolean(
      (manufacturer && manufacturer !== 'All') ||
      (city && city !== 'All' && city !== userCity) ||
      (minRentVal && minRentVal !== '') ||
      (maxRentVal && maxRentVal !== '') ||
      (minYear && minYear !== 'All') ||
      (maxYear && maxYear !== 'All') ||
      (minCapacity && minCapacity !== '') ||
      (selectedTransmission && selectedTransmission !== 'All') ||
      (selectedFuelType && selectedFuelType !== 'All') ||
      (selectedFeatures.length > 0) ||
      (selectedModel && selectedModel !== 'All') ||
      (selectedVehicleType && selectedVehicleType !== 'All') ||
      searchQuery.trim().length > 0
    );
    
    setIsFiltered(hasActiveFilters);
    
    // Apply search filter first
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(v => 
        v.manufacturer.toLowerCase().includes(query) ||
        v.model.toLowerCase().includes(query) ||
        v.company?.companyName?.toLowerCase().includes(query) ||
        v.vehicleType?.toLowerCase().includes(query) ||
        v.cities.some(c => c.name.toLowerCase().includes(query))
      );
    }
    
    // Then apply other filters
    if (manufacturer && manufacturer !== 'All') {
      filtered = filtered.filter(v => 
        v.manufacturer.toLowerCase() === manufacturer.toLowerCase()
      );
    }
  
    if (selectedModel && selectedModel !== 'All') {
      filtered = filtered.filter(v => 
        v.model.toLowerCase() === selectedModel.toLowerCase()
      );
    }
  
    if (selectedVehicleType && selectedVehicleType !== 'All') {
      filtered = filtered.filter(v => 
        v.vehicleType?.toLowerCase() === selectedVehicleType.toLowerCase()
      );
    }
  
    if (minYear && minYear !== 'All') {
      filtered = filtered.filter(v => (v.year ?? 0) >= parseInt(minYear));
    }
  
    if (maxYear && maxYear !== 'All') {
      filtered = filtered.filter(v => (v.year ?? 0) <= parseInt(maxYear));
    }
  
    if (minCapacity) {
      filtered = filtered.filter(v => v.capacity >= parseInt(minCapacity));
    }
  
    if (selectedTransmission && selectedTransmission !== 'All') {
      filtered = filtered.filter(v => 
        v.transmission.toLowerCase() === selectedTransmission.toLowerCase()
      );
    }
  
    if (selectedFuelType && selectedFuelType !== 'All') {
      filtered = filtered.filter(v => 
        v.fuelType?.toLowerCase() === selectedFuelType.toLowerCase()
      );
    }
  
    if (selectedFeatures.length > 0) {
      filtered = filtered.filter(v => 
        selectedFeatures.every(f => 
          v.features?.some(vf => vf.toLowerCase() === f.toLowerCase())
        )
      );
    }
  
    // Apply city filter if it's different from user's city
    if (city && city !== 'All' && city !== userCity) {
      filtered = filtered.filter(v => 
        v.cities.some(c => 
          c.name.toLowerCase().includes(city.toLowerCase())
        )
      );
    }
  
    if (minRentVal) {
      filtered = filtered.filter(v => v.rent >= parseInt(minRentVal));
    }
  
    if (maxRentVal) {
      filtered = filtered.filter(v => v.rent <= parseInt(maxRentVal));
    }
  
    console.log('Final filtered vehicles:', filtered);
    setVehicles(filtered);
  };
  return (
    <AppLayout title="Find the Perfect Car">
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="gray" />
            <TextInput
              placeholder="Search for cars..."
              style={styles.searchInput}
              value={searchQuery}
              onFocus={() => {
                resetFilters();
              }}
              onChangeText={handleSearch}
            />
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="filter" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator size="large" color="white" />}
        {/* {error ? <Text style={styles.errorText}>{error}</Text> : null} */}

        <ScrollView showsVerticalScrollIndicator={false}>
          {vehicles.length > 0 ? (
            vehicles.map((car) => (
              <View key={car._id} style={styles.card}>
                <Image 
                  source={{ uri: car.carImageUrls?.[0] || 'default_image_uri' }} 
                  style={styles.image}
                  onError={(e) => console.log('Failed to load image:', e.nativeEvent.error)}
                />
                <View style={styles.likeContainer}>
                  <Text style={styles.carName}>{car.manufacturer} {car.model}</Text>
                  <TouchableOpacity onPress={() => toggleLike(car._id)}>
                    <Ionicons 
                      name={likedVehicles.includes(car._id) ? "heart" : "heart-outline"} 
                      size={24} 
                      color={likedVehicles.includes(car._id) ? "red" : "white"} 
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <Ionicons name="speedometer" size={16} color="#ADD8E6" />
                    <Text style={styles.detailText}>{car.transmission} Transmission</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="flash" size={16} color="#ADD8E6" />
                    <Text style={styles.detailText}>Petrol</Text>
                  </View>
                </View>
                
                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <Ionicons name="people" size={16} color="#ADD8E6" />
                    <Text style={styles.detailText}>{car.capacity} Seats</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="car" size={16} color="#ADD8E6" />
                    <Text style={styles.detailText}>{car.trips} Trips</Text>
                  </View>
                </View>
                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <Ionicons name="time" size={16} color="#ADD8E6" />
                    <Text style={styles.detailText}>
                      Available: {car.availability.days.join(', ')} {car.availability.startTime}-{car.availability.endTime}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <Ionicons name="location" size={16} color="#ADD8E6" />
                    <Text style={styles.detailText}>
                      Cities: {car.cities.map(c => c.name).join(', ')}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="business" size={20} color="#ADD8E6" />
                  <Text style={styles.carCompany}>{car.company?.companyName || "Unknown Company"}</Text>
                </View>
                
                <TouchableOpacity 
                  style={[
                    styles.bookNowButton,
                    ]} 
                  onPress={() => handleBookNow(car)}
                >
                  <Text style={styles.bookNowText}>
                  Book Now: Rs.{car.rent}/day
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.noResultsContainer}>
              <Image source={require('../../assets/images/explore.jpg')} style={styles.image} />
              <Text style={styles.noResults}>No cars found</Text>
              <TouchableOpacity onPress={resetFilters}>
                <Text style={styles.resetFiltersText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.empty}></View>
        </ScrollView>

        {/* Filter Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showFilters}
          onRequestClose={() => setShowFilters(false)}
        >
          <View style={styles.modalContainer}>
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalTitle}>Filter Vehicles</Text>
              {/* Manufacturer Dropdown */}
              <Text style={styles.filterLabel}>Manufacturer</Text>
              <View style={styles.filterInput}>
                <Picker
                  selectedValue={selectedManufacturer}
                  onValueChange={(itemValue) => setSelectedManufacturer(itemValue)}
                >
                  {manufacturers.map((mfg, index) => (
                    <Picker.Item key={index} label={mfg} value={mfg} />
                  ))}
                </Picker>
              </View>
              {/* Model Dropdown */}
              <Text style={styles.filterLabel}>Model</Text>
              <View style={styles.filterInput}>
                <Picker
                  selectedValue={selectedModel}
                  onValueChange={(itemValue) => setSelectedModel(itemValue)}
                >
                  {models.map((model, index) => (
                    <Picker.Item key={index} label={model} value={model} />
                  ))}
                </Picker>
              </View>
              {/* Year Range */}
              <Text style={styles.filterLabel}>Year Range</Text>
              <View style={styles.rangeContainer}>
                <Picker
                  selectedValue={minYear}
                  onValueChange={(itemValue) => setMinYear(itemValue)}
                  style={{ flex: 1 }}
                >
                  {years.map((year, index) => (
                    <Picker.Item key={index} label={year} value={year} />
                  ))}
                </Picker>
                <Text style={styles.rangeSeparator}>-</Text>
                <Picker
                  selectedValue={maxYear}
                  onValueChange={(itemValue) => setMaxYear(itemValue)}
                  style={{ flex: 1 }}
                >
                  {years.map((year, index) => (
                    <Picker.Item key={index} label={year} value={year} />
                  ))}
                </Picker>
              </View>
              {/* Vehicle Type */}
              <Text style={styles.filterLabel}>Vehicle Type</Text>
              <View style={styles.filterInput}>
                <Picker
                  selectedValue={selectedVehicleType}
                  onValueChange={(itemValue) => setSelectedVehicleType(itemValue)}
                >
                  {vehicleTypes.map((type, index) => (
                    <Picker.Item key={index} label={type} value={type} />
                  ))}
                </Picker>
              </View>
              {/* Capacity */}
              <Text style={styles.filterLabel}>Seats</Text>
              <View style={styles.filterInput}>
                <Picker
                  selectedValue={minCapacity}
                  style={styles.picker}
                  onValueChange={(itemValue) => setMinCapacity(itemValue)}
                  dropdownIconColor="#ADD8E6"
                >
                  <Picker.Item label="Any" value="" />
                  {Array.from({length: 9}, (_, i) => i + 4).map((seats) => (
                    <Picker.Item key={seats} label={`${seats} seats`} value={seats.toString()} />
                  ))}
                </Picker>
              </View>
              {/* Transmission */}
              <Text style={styles.filterLabel}>Transmission</Text>
              <View style={styles.filterInput}>
                <Picker
                  selectedValue={selectedTransmission}
                  onValueChange={(itemValue) => setSelectedTransmission(itemValue)}
                >
                  <Picker.Item label="All" value="All" />
                  <Picker.Item label="Automatic" value="Auto" />
                  <Picker.Item label="Manual" value="Manual" />
                </Picker>
              </View>
              {/* Fuel Type */}
              <Text style={styles.filterLabel}>Fuel Type</Text>
              <View style={styles.filterInput}>
                <Picker
                  selectedValue={selectedFuelType}
                  onValueChange={(itemValue) => setSelectedFuelType(itemValue)}
                >
                  <Picker.Item label="All" value="All" />
                  <Picker.Item label="Petrol" value="Petrol" />
                  <Picker.Item label="Diesel" value="Diesel" />
                  <Picker.Item label="Electric" value="Electric" />
                  <Picker.Item label="Hybrid" value="Hybrid" />
                </Picker>
              </View>
              {/* Features */}
              <Text style={styles.filterLabel}>Features</Text>
              <View style={styles.featuresContainer}>
                {allFeatures.map(feature => (
              <TouchableOpacity 
                    key={feature}
                    style={[
                      styles.featureButton,
                      selectedFeatures.includes(feature) && styles.selectedFeatureButton
                    ]}
                    onPress={() => {
                      if (selectedFeatures.includes(feature)) {
                        setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
                      } else {
                        setSelectedFeatures([...selectedFeatures, feature]);
                      }
                    }}
                  >
                    <Text style={[
                      styles.featureText,
                      selectedFeatures.includes(feature) && styles.selectedFeatureText
                    ]}>
                      {feature}
                </Text>
              </TouchableOpacity>
                ))}
              </View>
              {/* From Date */}
              <Text style={styles.filterLabel}>From Date</Text>
              <TouchableOpacity style={styles.filterInput} onPress={() => setShowFromDatePicker(true)}>
                <Text style={styles.input}>{fromDate ? fromDate.toLocaleDateString() : 'Select from date'}</Text>
              </TouchableOpacity>
              {showFromDatePicker && (
                <DateTimePicker
                  value={fromDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowFromDatePicker(false);
                    if (selectedDate) setFromDate(selectedDate);
                  }}
                />
              )}
              {/* To Date */}
              <Text style={styles.filterLabel}>To Date</Text>
              <TouchableOpacity style={styles.filterInput} onPress={() => setShowToDatePicker(true)}>
                <Text style={styles.input}>{toDate ? toDate.toLocaleDateString() : 'Select to date'}</Text>
              </TouchableOpacity>
              {showToDatePicker && (
                <DateTimePicker
                  value={toDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowToDatePicker(false);
                    if (selectedDate) setToDate(selectedDate);
                  }}
                />
              )}
              {/* From Time */}
              <Text style={styles.filterLabel}>From Time</Text>
              <TouchableOpacity style={styles.filterInput} onPress={() => setShowFromTimePicker(true)}>
                <Text style={styles.input}>{fromTime || 'Select from time'}</Text>
              </TouchableOpacity>
              {showFromTimePicker && (
                <DateTimePicker
                  value={fromTime ? new Date(`1970-01-01T${fromTime}:00`) : new Date()}
                  mode="time"
                  display="default"
                  onChange={(event, selectedTime) => {
                    setShowFromTimePicker(false);
                    if (selectedTime) {
                      const hours = selectedTime.getHours().toString().padStart(2, '0');
                      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
                      setFromTime(`${hours}:${minutes}`);
                    }
                  }}
                />
              )}
              {/* To Time */}
              <Text style={styles.filterLabel}>To Time</Text>
              <TouchableOpacity style={styles.filterInput} onPress={() => setShowToTimePicker(true)}>
                <Text style={styles.input}>{toTime || 'Select to time'}</Text>
              </TouchableOpacity>
              {showToTimePicker && (
                <DateTimePicker
                  value={toTime ? new Date(`1970-01-01T${toTime}:00`) : new Date()}
                  mode="time"
                  display="default"
                  onChange={(event, selectedTime) => {
                    setShowToTimePicker(false);
                    if (selectedTime) {
                      const hours = selectedTime.getHours().toString().padStart(2, '0');
                      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
                      setToTime(`${hours}:${minutes}`);
                    }
                  }}
                />
              )}
              {/* Rent Range */}
              <Text style={styles.filterLabel}>Rent Range</Text>
              <View style={styles.rangeContainer}>
                <TextInput
                  style={[styles.input, styles.rangeInput]}
                  placeholder="Min"
                  keyboardType="numeric"
                  value={minRent}
                  onChangeText={setMinRent}
                />
                <Text style={styles.rangeSeparator}>-</Text>
                <TextInput
                  style={[styles.input, styles.rangeInput]}
                  placeholder="Max"
                  keyboardType="numeric"
                  value={maxRent}
                  onChangeText={setMaxRent}
                />
              </View>
              {/* City Filter */}
              <Text style={styles.filterLabel}>City</Text>
              <View style={styles.filterInput}>
                <Picker
                  selectedValue={selectedCity}
                  onValueChange={(itemValue) => setSelectedCity(itemValue)}
                >
                  {availableCities.map((city, index) => (
                    <Picker.Item key={index} label={city} value={city} />
                  ))}
                </Picker>
              </View>
              {/* Action Buttons */}
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
        </Modal>
      </View>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003366',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 40,
    paddingHorizontal: 10,
  },
  filterButton: {
    marginLeft: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#1E5A82',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  empty: {
    height: 100,
  },
  card: {
    backgroundColor: '#1E5A82',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  likeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  carName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ADD8E6',
  },
  bookNowButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  bookNowText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  manufacturersContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  manufacturerButton: {
    marginRight: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'white',
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedManufacturerButton: {
    backgroundColor: '#007AFF',
    borderColor: 'blue',
  },
  manufacturerText: {
    color: 'white',
    fontSize: 16,
  },
  selectedManufacturerText: {
    fontWeight: 'bold',
    color: 'white',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 10,
  },
  carCompany: {
    fontSize: 18,
    color: '#ADD8E6',
    fontWeight: 'bold',
    marginVertical: 2,
    marginLeft: 5,
  },
  disabledButton: {
    backgroundColor: 'gray',
    opacity: 0.6,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  detailText: {
    fontSize: 14,
    color: '#ADD8E6',
    marginLeft: 5,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResults: {
    textAlign: 'center',
    fontSize: 24,
    color: 'white',
    marginTop: 20,
    fontWeight: 'bold', 
  },
  resetFiltersText: {
    color: '#007AFF',
    fontSize: 18,
    marginTop: 10,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    
  },
  modalContent: {
    backgroundColor: '#003366',
    borderRadius: 10,
    padding: 20,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterLabel: {
    color: '#ADD8E6',
    marginBottom: 5,
    fontSize: 16,
  },
  filterInput: {
    backgroundColor: '#1E5A82',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  input: {
    color: 'white',
    fontSize: 16,
  },
  rentRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  rentInput: {
    flex: 1,
    backgroundColor: '#1E5A82',
    borderRadius: 5,
    padding: 10,
  },
  rangeSeparator: {
    color: 'white',
    marginHorizontal: 10,
    fontSize: 16,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 80,
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  resetButton: {
    backgroundColor: '#FF3B30',
  },
  applyButton: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  rangeInput: {
    flex: 1,
    backgroundColor: '#1E5A82',
    borderRadius: 5,
    padding: 10,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  featureButton: {
    padding: 8,
    margin: 4,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ADD8E6',
  },
  selectedFeatureButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  featureText: {
    color: '#ADD8E6',
  },
  selectedFeatureText: {
    color: 'white',
    fontWeight: 'bold',
  },
  picker: {
    flex: 1,
    backgroundColor: '#1E5A82',
    borderRadius: 5,
    padding: 10,
  },
});

export default ExploreScreen;