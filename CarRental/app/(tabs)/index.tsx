import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, ScrollView, Image, TouchableOpacity, 
  StyleSheet, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppLayout from '../screens/AppLayout';
import { loadCity } from '@/utils/storageUtil';
import { AppConstants } from '@/constants/appConstants';
import { router } from 'expo-router';
import { useLikedVehicles } from '@/components/layout/LikedVehicleContext'; // Ensure this path is correct

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
};

const ExploreScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState('All');
  const [vehicles, setVehicles] = useState<CarProps[]>([]);
  const [manufacturers, setManufacturers] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Use the toggleLike function from the context
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
    <AppLayout title="Find the Perfect Car">

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
          {filteredCars.length > 0 ? (
            filteredCars.map((car) => (
              <View key={car._id} style={styles.card}>
                <Image source={{ uri: car.carImageUrls[0] }} style={styles.image} />
                {/* <ScrollView horizontal showsHorizontalScrollIndicator={false}>
  {Array.isArray(car.carImageUrls) &&
    car.carImageUrls.map((url: string, index: number) => (
      <Image key={index} source={{ uri: url }} style={styles.image} />
    ))}
</ScrollView> */}

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
            </View>
          )}

          <View style={styles.empty}></View>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 40,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  empty:{
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
  carPrice: {
    fontSize: 16,
    color: '#ADD8E6',
    alignContent: 'center',
    justifyContent: 'center',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ExploreScreen;