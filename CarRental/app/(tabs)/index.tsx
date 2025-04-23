import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, ScrollView, Image, TouchableOpacity, 
  StyleSheet, ActivityIndicator, Modal, Pressable, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppLayout from '../screens/AppLayout';
import { loadCity } from '@/utils/storageUtil';
import { AppConstants } from '@/constants/appConstants';
import { router } from 'expo-router';
import { useLikedVehicles } from '@/components/layout/LikedVehicleContext';
import DateTimePicker from '@react-native-community/datetimepicker';

type CarProps = {
  _id: string;
  manufacturer: string;
  model: string;
  rent: number;
  capacity: number;
  transmission: string;
  carImageUrls: string[];
  companyName: string;
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
  isAvailable: boolean;
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
  const [minRent, setMinRent] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const { likedVehicles, toggleLike } = useLikedVehicles();

  useEffect(() => {
    fetchManufacturers();
    fetchVehicles();
  }, []);

  const fetchManufacturers = async () => {
    try {
      const response = await fetch(`${AppConstants.LOCAL_URL}/vehicles/getManufacturers`);
      if (response.status === 500) {
        throw new Error('Failed to fetch manufacturers');
      }
      const data: string[] = await response.json();
      setManufacturers(['All', ...data]);
    } catch (err: any) {
      console.error('Error fetching manufacturers:', err.message);
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
      setSelectedCity(storedCity);
  
      const url = `${AppConstants.LOCAL_URL}/vehicles/getVehicle?city=${storedCity}`;
      console.log('Fetching vehicles from:', url);
  
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) {
          console.log("No Vehicles found for the city.");
          setVehicles([]);
          setAllVehicles([]);
          return;
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      const vehiclesWithCompany = data.map((car: any) => ({
        ...car,
        companyName: car.company?.companyName || "Unknown Company",
      }));
  
      setVehicles(vehiclesWithCompany);
      setAllVehicles(vehiclesWithCompany); // Store all vehicles for filtering
    } catch (err: any) {
      setError(err.message);
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
      console.log("Navigation executed successfully");
    } catch (error) {
      console.error(" Navigation error:", error);
    }
  };

  const handleManufacturerSelect = (manufacturer: string) => {
    setSelectedManufacturer(manufacturer);
    applyFilters(manufacturer, selectedCity, minRent, maxRent, selectedDay, selectedTime);
  };

  const applyFilters = (
    manufacturer: string,
    city: string,
    min: string,
    max: string,
    day: string,
    time: string
  ) => {
    let filtered = allVehicles;

    // Filter by manufacturer
    if (manufacturer !== 'All') {
      filtered = filtered.filter(car => 
        car.manufacturer.toLowerCase() === manufacturer.toLowerCase()
      );
    }

    // Filter by city
    if (city) {
      filtered = filtered.filter(car => 
        car.cities.some(c => c.name.toLowerCase() === city.toLowerCase())
      );
    }

    // Filter by rent range
    if (min) {
      filtered = filtered.filter(car => car.rent >= parseInt(min));
    }
    if (max) {
      filtered = filtered.filter(car => car.rent <= parseInt(max));
    }

    // Filter by availability day
    if (day) {
      filtered = filtered.filter(car => 
        car.availability.days.includes(day)
      );
    }

    // Filter by availability time
    if (time) {
      filtered = filtered.filter(car => {
        const [startHour, startMin] = car.availability.startTime.split(':').map(Number);
        const [endHour, endMin] = car.availability.endTime.split(':').map(Number);
        const [selectedHour, selectedMin] = time.split(':').map(Number);
        
        const startTimeInMinutes = startHour * 60 + startMin;
        const endTimeInMinutes = endHour * 60 + endMin;
        const selectedTimeInMinutes = selectedHour * 60 + selectedMin;
        
        return selectedTimeInMinutes >= startTimeInMinutes && 
               selectedTimeInMinutes <= endTimeInMinutes;
      });
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(car => 
        car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setVehicles(filtered);
  };

  const resetFilters = () => {
    setSelectedManufacturer('All');
    setMinRent('');
    setMaxRent('');
    setSelectedDay('');
    setSelectedTime('');
    setVehicles(allVehicles);
    setSearchQuery('');
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[currentDate.getDay()];
    setSelectedDay(dayName);
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || new Date();
    setShowTimePicker(Platform.OS === 'ios');
    
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    setSelectedTime(timeString);
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
              onChangeText={(text) => {
                setSearchQuery(text);
                applyFilters(selectedManufacturer, selectedCity, minRent, maxRent, selectedDay, selectedTime);
              }}
            />
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="filter" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.manufacturersContainer}>
          {manufacturers.map((manufacturer, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.manufacturerButton,
                selectedManufacturer === manufacturer && styles.selectedManufacturerButton,
              ]}
              onPress={() => handleManufacturerSelect(manufacturer)}
            >
              <Text
                style={[
                  styles.manufacturerText,
                  selectedManufacturer === manufacturer && styles.selectedManufacturerText,
                ]}
              >
                {manufacturer}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading && <ActivityIndicator size="large" color="white" />}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <ScrollView showsVerticalScrollIndicator={false}>
          {vehicles.length > 0 ? (
            vehicles.map((car) => (
              <View key={car._id} style={styles.card}>
                <Image source={{ uri: car.carImageUrls[0] }} style={styles.image} />

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
                  <Text style={styles.carCompany}>  {car.companyName}</Text>
                </View>
                
                <TouchableOpacity style={styles.bookNowButton} onPress={() => handleBookNow(car)}>
                  <Text style={styles.bookNowText}>Book Now: Rs.{car.rent}/day</Text>
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
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Filter Vehicles</Text>
              
              <Text style={styles.filterLabel}>City</Text>
              <View style={styles.filterInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Select city"
                  value={selectedCity}
                  onChangeText={setSelectedCity}
                />
              </View>
              
              <Text style={styles.filterLabel}>Rent Range</Text>
              <View style={styles.rentRangeContainer}>
                <TextInput
                  style={[styles.input, styles.rentInput]}
                  placeholder="Min"
                  keyboardType="numeric"
                  value={minRent}
                  onChangeText={setMinRent}
                />
                <Text style={styles.rangeSeparator}>-</Text>
                <TextInput
                  style={[styles.input, styles.rentInput]}
                  placeholder="Max"
                  keyboardType="numeric"
                  value={maxRent}
                  onChangeText={setMaxRent}
                />
              </View>
              
              <Text style={styles.filterLabel}>Available Date</Text>
              <TouchableOpacity 
                style={styles.filterInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.input}>
                  {selectedDay || 'Select day'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}
              
              <Text style={styles.filterLabel}>Available Time</Text>
              <TouchableOpacity 
                style={styles.filterInput}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.input}>
                  {selectedTime || 'Select time'}
                </Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={date}
                  mode="time"
                  display="default"
                  onChange={onTimeChange}
                />
              )}
              
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.resetButton]}
                  onPress={resetFilters}
                >
                  <Text style={styles.modalButtonText}>Reset</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.applyButton]}
                  onPress={() => {
                    applyFilters(
                      selectedManufacturer,
                      selectedCity,
                      minRent,
                      maxRent,
                      selectedDay,
                      selectedTime
                    );
                    setShowFilters(false);
                  }}
                >
                  <Text style={styles.modalButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
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
    fontSize: 18,
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
    justifyContent: 'flex-start',
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
});

export default ExploreScreen;