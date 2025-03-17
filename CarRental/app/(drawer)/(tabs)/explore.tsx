import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, ScrollView, Image, TouchableOpacity, 
  StyleSheet, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppLayout from '../../screens/AppLayout';
import { loadCity } from '@/utils/storageUtil';
import { AppConstants } from '@/constants/appConstants';
import { router } from 'expo-router';

type CarProps = {
  _id: string;
  manufacturer: string;
  model: string;
  rent: number;
  capacity: number;
  transmission: string;
  carImageUrl: string;
  companyName: string;
};

const ExploreScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState('All');
  const [vehicles, setVehicles] = useState<CarProps[]>([]);
  const [manufacturers, setManufacturers] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  
      const url = `${AppConstants.LOCAL_URL}/vehicles/getVehicle?city=${storedCity}`;
      console.log('Fetching vehicles from:', url);
  
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) {
          console.log("No Vehicles found for the city.");
          setVehicles([]);
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
  };

  const filteredCars = vehicles.filter((car) => {
    const matchesSearchQuery =
      car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesManufacturer =
      selectedManufacturer === 'All' || car.manufacturer.toLowerCase() === selectedManufacturer.toLowerCase();

    return matchesSearchQuery && matchesManufacturer;
  });

  return (
    <AppLayout title="Explore">
      <View style={styles.container}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="gray" />
          <TextInput
            placeholder="Search for cars..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Scrollable Manufacturers Section */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}  style={styles.manufacturersContainer}   keyboardShouldPersistTaps="handled">
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

        {/* Loading & Error Handling */}
        {loading && <ActivityIndicator size="large" color="white" />}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Car Listings */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredCars.length > 0 ? (
            filteredCars.map((car) => (
              <View key={car._id} style={styles.card}>
                <Image source={{ uri: car.carImageUrl }} style={styles.image} />
                <Text style={styles.carName}>{car.manufacturer} {car.model}</Text>
                <Text style={styles.carCompany}>Company: {car.companyName}</Text>
                <Text style={styles.carPrice}>${car.rent}/day</Text>
                <Text style={styles.carDetails}>{car.capacity} Seats | {car.transmission} Transmission</Text>
                <TouchableOpacity style={styles.bookNowButton} onPress={() => handleBookNow(car)}>
                  <Text style={styles.bookNowText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noResults}>No cars found</Text>
          )}
          <View style={styles.containerBottom}>

          </View>
        </ScrollView>
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
  containerBottom: {
    flex: 1,
    backgroundColor: '#003366',
    paddingHorizontal: 10,
    paddingTop: 80,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  manufacturersContainer: {
    flexDirection: 'row',
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
    marginBottom:10
  },
  selectedManufacturerButton: {
    backgroundColor: 'blue',
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
  card: {
    backgroundColor: '#1E5A82',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    marginTop:5
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  carName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
    color: '#ADD8E6',
  },
  carCompany: {
    fontSize: 14,
    color: '#ADD8E6',
    fontWeight: 'bold',
    marginVertical: 2,
  },
  carPrice: {
    fontSize: 16,
    color: '#ADD8E6',
  },
  carDetails: {
    fontSize: 14,
    color: '#ADD8E6',
  },
  bookNowButton: {
    backgroundColor: 'blue',
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
  noResults: {
    textAlign: 'center',
    fontSize: 18,
    color: 'white',
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ExploreScreen;
