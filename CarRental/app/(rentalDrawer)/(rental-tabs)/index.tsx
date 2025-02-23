import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import AppLayout from "../../screens/AppLayout"; 
import RentalAppLayout from "@/app/screens/rentalAppLayout";
type HomeScreenNavigationProp = DrawerNavigationProp<any>;

const RentalHomeScreen = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  // Dummy Data for Cars with Booking Details
  const [cars, setCars] = useState([
    {
      id: "1",
      name: "Tesla Model S",
      image: "https://www.google.com/imgres?q=cars&imgurl=https%3A%2F%2Flookaside.fbsbx.com%2Flookaside%2Fcrawler%2Fmedia%2F%3Fmedia_id%3D100063859190322&imgrefurl=https%3A%2F%2Fwww.facebook.com%2FLuxuryCarsRentalsAndTours%2F&docid=ESraJKb687-fSM&tbnid=BJ4_0n76HLJYBM&vet=12ahUKEwjx3N6-ydSLAxWbzDgGHfy6CrMQM3oECBsQAA..i&w=718&h=727&hcb=2&ved=2ahUKEwjx3N6-ydSLAxWbzDgGHfy6CrMQM3oECBsQAA",
      price: "$80/day",
      fromDate: "2024-03-10",
      toDate: "2024-03-15",
      rentalCompany: "Tesla Rentals",
      capacity: 5, // Number of seats
    },
    {
      id: "2",
      name: "BMW i8",
      image: "https://www.google.com/imgres?q=cars&imgurl=https%3A%2F%2Flookaside.fbsbx.com%2Flookaside%2Fcrawler%2Fmedia%2F%3Fmedia_id%3D100063859190322&imgrefurl=https%3A%2F%2Fwww.facebook.com%2FLuxuryCarsRentalsAndTours%2F&docid=ESraJKb687-fSM&tbnid=BJ4_0n76HLJYBM&vet=12ahUKEwjx3N6-ydSLAxWbzDgGHfy6CrMQM3oECBsQAA..i&w=718&h=727&hcb=2&ved=2ahUKEwjx3N6-ydSLAxWbzDgGHfy6CrMQM3oECBsQAA",
      price: "$100/day",
      fromDate: "2024-04-01",
      toDate: "2024-04-07",
      rentalCompany: "Luxury Wheels",
      capacity: 2,
    },
    {
      id: "3",
      name: "Mercedes Benz G-Wagon",
      image: "https://www.google.com/imgres?q=cars&imgurl=https%3A%2F%2Flookaside.fbsbx.com%2Flookaside%2Fcrawler%2Fmedia%2F%3Fmedia_id%3D100063859190322&imgrefurl=https%3A%2F%2Fwww.facebook.com%2FLuxuryCarsRentalsAndTours%2F&docid=ESraJKb687-fSM&tbnid=BJ4_0n76HLJYBM&vet=12ahUKEwjx3N6-ydSLAxWbzDgGHfy6CrMQM3oECBsQAA..i&w=718&h=727&hcb=2&ved=2ahUKEwjx3N6-ydSLAxWbzDgGHfy6CrMQM3oECBsQAA",
      price: "$150/day",
      fromDate: "2024-05-15",
      toDate: "2024-05-20",
      rentalCompany: "Elite Rentals",
      capacity: 7,
    },
  ]);

  return (
    <RentalAppLayout title="Dashboard">    <View style={styles.container}>
      {/* Car List */}
      {cars.length > 0 ? (
        <FlatList
          data={cars}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.carImage} />
              <View style={styles.cardContent}>
                <Text style={styles.carName}>{item.name}</Text>
                <Text style={styles.carPrice}>{item.price}</Text>

                {/* Booking Details */}
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Rental Company:</Text>
                  <Text style={styles.value}>{item.rentalCompany}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Capacity:</Text>
                  <Text style={styles.value}>{item.capacity} seats</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Booking Dates:</Text>
                  <Text style={styles.value}>
                    {item.fromDate} → {item.toDate}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      ) : (
        /* Empty State */
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Currently there are no cars added</Text>
        </View>
      )}
    </View>
    </RentalAppLayout>

  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#003366", padding: 20 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  title: { fontSize: 20, fontWeight: "bold", color: "#FFF", flex: 1, marginLeft: 10 },
  newCarText: { fontSize: 14, color: "#ADD8E6", fontWeight: "600" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "rgba(255, 255, 255, 0.5)", fontSize: 16 },

  /* Car Card Styles */
  card: {
    backgroundColor: "#1E5A82",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 15,
  },
  carImage: {
    width: "100%",
    height: 150,
  },
  cardContent: {
    padding: 15,
  },
  carName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  carPrice: {
    fontSize: 16,
    color: "#ADD8E6",
    marginTop: 5,
  },

  /* Booking Details */
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  label: {
    fontSize: 14,
    color: "#ADD8E6",
    fontWeight: "600",
  },
  value: {
    fontSize: 14,
    color: "#FFF",
  },
});

export default RentalHomeScreen;
