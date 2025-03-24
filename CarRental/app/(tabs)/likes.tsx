import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, Image, TouchableOpacity, 
  StyleSheet, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppConstants } from '@/constants/appConstants';
import { router } from 'expo-router';
import AppLayout from '../screens/AppLayout';
import { useLikedVehicles } from '@/components/layout/LikedVehicleContext'; // Ensure this path is correct

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

const LikedVehiclesScreen = () => {
  const [loading, setLoading] = useState(true);
  const [likedCars, setLikedCars] = useState<CarProps[]>([]);

  // Use the toggleLike function and likedVehicles state from the context
  const { likedVehicles, toggleLike } = useLikedVehicles();

  useEffect(() => {
    fetchLikedVehicles();
  }, [likedVehicles]); // Re-fetch liked vehicles when likedVehicles changes

  const fetchLikedVehicles = async () => {
    try {
      if (likedVehicles.length === 0) {
        setLikedCars([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${AppConstants.LOCAL_URL}/vehicles/getLikedVehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleIds: likedVehicles }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch liked vehicles');
      }

      const data: CarProps[] = await response.json();
      setLikedCars(data);
    } catch (error: any) {
      console.error('Error fetching liked vehicles:', error.message);
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
      console.error("Navigation error:", error);
    }
  };

  const navigateToExplore = () => {
    router.push("/");
  };

  return (
    <AppLayout title="Liked Vehicles">
      
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="white" />
        ) : likedCars.length > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {likedCars.map((car) => (
              <View key={car._id} style={styles.card}>
                <Image source={{ uri: car.carImageUrl }} style={styles.image} />
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
                <Text style={styles.carCompany}>Company: {car.companyName}</Text>
                <Text style={styles.carPrice}>${car.rent}/day</Text>
                <Text style={styles.carDetails}>{car.capacity} Seats | {car.transmission} Transmission</Text>
                <TouchableOpacity style={styles.bookNowButton} onPress={() => handleBookNow(car)}>
                  <Text style={styles.bookNowText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        ) : (
<View style={styles.noResultsContainer}>
      <Image source={require('../../assets/images/like.jpg')} style={styles.image} />
      
      {/* Added Icon */}
      
      <Text style={styles.noResultsText}>Can't find vehicle of your taste</Text>
      <Ionicons name="sad-outline" size={48} color="#FFF"  />
    <Text style={styles.noresultsText}>No worries</Text>
      
      <TouchableOpacity style={styles.exploreButton} onPress={navigateToExplore}>
        <Text style={styles.exploreButtonText}>Explore More Vehicles</Text>
      </TouchableOpacity>
    </View>
        )}
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
  card: {
    backgroundColor: '#1E5A82',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    marginTop: 5,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  likeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 18,
    color: 'white',
    marginTop: 20,
    marginBottom: 20,
    fontWeight: 'bold',

  },
  noresultsText: {
    fontSize: 18,
    color: 'white',
     marginBottom: 20,
    fontWeight: 'bold',
  },
  exploreButton: {
    backgroundColor: 'rgba(72, 156, 240, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  exploreButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default LikedVehiclesScreen;