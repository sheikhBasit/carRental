import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AppLayout from '../../screens/AppLayout';

type CarProps = {
  id: number;
  name: string;
  price: string;
  fuel: string;
  transmission: string;
  seats: string;
  rating?: number;
  image: any;
};

type RootStackParamList = {
  CarDetailScreen: { car: CarProps };
};

const cars: CarProps[] = [
  {
    id: 1,
    name: 'Toyota Altis',
    price: '4,599/day',
    fuel: 'Petrol',
    transmission: 'Automatic',
    seats: '5 Seats',
    image: require('../../../assets/images/background.png'),
  },
  {
    id: 2,
    name: 'Corolla GLi',
    price: '3,599/day',
    fuel: 'Petrol',
    transmission: 'Automatic',
    seats: '5 Seats',
    rating: 4.5,
    image: require('../../../assets/images/background.png'),
  },
  {
    id: 3,
    name: 'Honda Civic',
    price: '4,999/day',
    fuel: 'Petrol',
    transmission: 'Automatic',
    seats: '5 Seats',
    image: require('../../../assets/images/background.png'),
  },
  {
    id: 4,
    name: 'Suzuki Swift',
    price: '3,999/day',
    fuel: 'Petrol',
    transmission: 'Automatic',
    seats: '5 Seats',
    image: require('../../../assets/images/background.png'),
  },
];

const manufacturers = ['All', 'Toyota', 'Honda', 'Suzuki', 'Others'];

const ExploreScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState('All');
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'CarDetailScreen'>>();

  const handleBookNow = (car: CarProps) => {
    console.log('Navigating with car:', car);
    navigation.navigate('CarDetailScreen', { car });
  };

  const handleManufacturerSelect = (manufacturer: string) => {
    setSelectedManufacturer(manufacturer);
  };

  const filteredCars = cars.filter((car) => {
    const matchesSearchQuery =
      car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.price.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesManufacturer =
      selectedManufacturer === 'All' || car.name.toLowerCase().includes(selectedManufacturer.toLowerCase());

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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.manufacturersContainer}
        >
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

        {/* Car Listings */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredCars.length > 0 ? (
            filteredCars.map((car) => (
              <View key={car.id} style={styles.card}>
                <Image source={car.image} style={styles.image} />
                {car.rating && (
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>{car.rating}</Text>
                  </View>
                )}
                <Text style={styles.carName}>{car.name}</Text>
                <Text style={styles.carPrice}>{car.price}</Text>
                <TouchableOpacity
                  style={styles.bookNowButton}
                  onPress={() => handleBookNow(car)}
                >
                  <Text style={styles.bookNowText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noResults}>No cars found</Text>
          )}
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
    marginBottom: 15,
  },
  manufacturerButton: {
    marginRight: 5, // Reduced spacing between buttons
    paddingHorizontal: 10, // Add padding for better touch area
    paddingVertical: 5, // Add padding for better touch area
   
  },
  selectedManufacturerButton: {
    // Highlight color for selected manufacturer
  },
  manufacturerText: {
    color: 'white',
    fontSize: 16,
  },
  selectedManufacturerText: {
    fontWeight: 'bold', // Highlight text for selected manufacturer
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  ratingContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
  },
  ratingText: {
    color: 'white',
    fontWeight: 'bold',
  },
  carName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  carPrice: {
    fontSize: 16,
    color: 'gray',
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
});

export default ExploreScreen;