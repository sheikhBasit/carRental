import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, FlatList, ActivityIndicator } from "react-native";
import { Button } from "react-native-paper";
import { router } from "expo-router";
import AppLayout from "../../screens/AppLayout";
import { getStoredUserId } from "@/utils/storageUtil";
import { AppConstants } from "@/constants/appConstants";

type CarProps = {
  id: string;
  name: string;
  image: string;
  price: string;
  fromDate: string;
  toDate: string;
  rentalCompany: string;
  capacity: number;
};

const TripScreen = () => {
  const [cars, setCars] = useState<CarProps[]>([]);
  const [loading, setLoading] = useState(true);

  const handleHomeNavigation = () => {
    router.push("/explore");
  };

  const fetchCompletedBookings = async () => {
    try {
      setLoading(true);
      const userId = await getStoredUserId(); // Fetch userId using utility function
      if (!userId) {
        console.error("User ID not found in storage");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${AppConstants.LOCAL_URL}/bookings/userBookings?userId=${userId}&status=completed`
      );
      if (!response.ok) {
        if (response.status === 404) {
          console.log("No bookings found for the user.");
          setCars([]); // Set cars to an empty array
          return;
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid response format");
      }

      // Format data to match CarProps
      const formattedCars = data.map((booking: any) => {
        const vehicle = booking.idVehicle || {};
        const company = booking.company || {};

        return {
          id: booking._id,
          name: `${vehicle.manufacturer || "Unknown"} ${vehicle.model || ""}`.trim(),
          image: vehicle.carImageUrl || "https://via.placeholder.com/150",
          price: vehicle.rent || "N/A",
          fromDate: booking.from || "N/A",
          toDate: booking.to || "N/A",
          rentalCompany: company.companyName || "Unknown",
          capacity: vehicle.capacity || "N/A",
        };
      });

      setCars(formattedCars);
    } catch (error) {
      console.error("Error fetching completed bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedBookings();
  }, []);

  return (
    <AppLayout title="Your Trips">
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#FFF" />
        ) : cars.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No completed trips available.</Text>
            <Button mode="contained" onPress={handleHomeNavigation} style={styles.backButton}>
              Book New Car
            </Button>
          </View>
        ) : (
          <FlatList
            data={cars}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Image source={{ uri: item.image }} style={styles.carImage} />
                <View style={styles.cardContent}>
                  <Text style={styles.carName}>{item.name}</Text>
                  <Text style={styles.carPrice}>${item.price} per day</Text>

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
        )}
      </View>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003366",
    padding: 10,
  },
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
  backButton: {
    marginVertical: 20,
    alignSelf: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "white",
    marginBottom: 10,
  },
});

export default TripScreen;
