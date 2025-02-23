import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import AppLayout from './AppLayout';

type CarProps = {
  name: string;
  image: any;
  price: string;
  fuel: string;
  transmission: string;
  seats: string; // Ensure this matches the type in RootStackParamList
  rating?: number;
};

type RootStackParamList = {
  CarDetailScreen: { car: CarProps }; // Ensure this matches the route name
};

const CarDetailScreen = () => {
        const route = useRoute<RouteProp<RootStackParamList, 'CarDetailScreen'>>();
        console.log('Route params:', route.params);
        const { car } = route.params;
        
  return (
    <AppLayout title={car.name}>
      <View style={styles.container}>
        <Image source={car.image} style={styles.image} />
        <Text style={styles.name}>{car.name}</Text>
        <Text style={styles.price}>{car.price}</Text>
        <Text style={styles.details}>Fuel Type: {car.fuel}</Text>
        <Text style={styles.details}>Transmission: {car.transmission}</Text>
        <Text style={styles.details}>Seats: {car.seats}</Text>
        {car.rating && <Text style={styles.rating}>⭐ {car.rating} Stars</Text>}
      </View>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  price: {
    fontSize: 20,
    color: 'gray',
  },
  details: {
    fontSize: 18,
    marginTop: 5,
  },
  rating: {
    fontSize: 18,
    color: 'gold',
    marginTop: 10,
  },
});

export default CarDetailScreen;