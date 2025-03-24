import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { Button } from "react-native-paper";
import { router } from "expo-router";
import AppLayout from "../screens/AppLayout";
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
  status: string; // Add status to the CarProps type
};

const TripScreen = () => {
  const [confirmedCars, setConfirmedCars] = useState<CarProps[]>([]);
  const [ongoingCars, setOngoingCars] = useState<CarProps[]>([]);
  const [completedCars, setCompletedCars] = useState<CarProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"confirmed" | "ongoing" | "completed">("confirmed");

  const handleHomeNavigation = () => {
    router.push("/");
  };

  const fetchBookings = async (status: "confirmed" | "ongoing" | "completed") => {
    try {
      setLoading(true);
      const userId = await getStoredUserId(); // Fetch userId using utility function
      if (!userId) {
        console.error("User ID not found in storage");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${AppConstants.LOCAL_URL}/bookings/userBookings?userId=${userId}&status=${status}`
      );
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`No ${status} bookings found for the user.`);
          if (status === "confirmed") setConfirmedCars([]);
          else if (status === "ongoing") setOngoingCars([]);
          else if (status === "completed") setCompletedCars([]);
          return;
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid response format");
      }
      const formattedBookings = data.map((booking: any) => {
        return {
          id: booking._id,
          name: `${booking.idVehicle?.manufacturer || "Unknown"} ${booking.idVehicle?.model || ""}`.trim(),
          image: booking.idVehicle?.carImageUrl || "https://via.placeholder.com/150",
          price: booking.idVehicle?.rent || "N/A",
          fromDate: booking.from || "N/A",
          toDate: booking.to || "N/A",
          rentalCompany: booking.company?.companyName || "Unknown",
          capacity: booking.idVehicle?.capacity || "N/A",
          status: booking.status || "N/A",
          from: booking.from,
          to: booking.to,
          totalPrice: booking.totalPrice,
          company: booking.company
        };
      });
      
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
          status: booking.status || "N/A", // Add status to the formatted data
        };
      });

      if (status === "confirmed") {
        setConfirmedCars(formattedCars);
      } else if (status === "ongoing") {
        setOngoingCars(formattedCars);
      } else if (status === "completed") {
        setCompletedCars(formattedCars);
      }
    } catch (error) {
      console.error(`Error fetching ${status} bookings:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(activeTab);
  }, [activeTab]);

  const handleCardPress = (booking: any) => {
    router.push({
      pathname: "/screens/BookingDetail/[booking]",
      params: { booking: JSON.stringify(booking) },
    });
  };
  

  const renderCarItem = ({ item }: { item: CarProps }) => (
    <TouchableOpacity onPress={() => handleCardPress(item)}>
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
          <View style={styles.infoRow}>
            <Text style={styles.label}>Status:</Text>
            <Text
              style={[
                styles.value,
                item.status === "confirmed" && styles.statusConfirmed,
                item.status === "ongoing" && styles.statusOngoing,
                item.status === "completed" && styles.statusCompleted,
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Image source={require('../../assets/images/trip.jpg')} style={styles.image} />
      <Text style={styles.emptyText}>
        {activeTab === "confirmed"
          ? "No confirmed trips available."
          : activeTab === "ongoing"
          ? "No ongoing trips available."
          : "No completed trips available."}
      </Text>
      <Button mode="contained" onPress={handleHomeNavigation} style={styles.backButton}>
        Book New Car
      </Button>
    </View>
  );

  return (
    <AppLayout title="Your Trips">
      <View style={styles.container}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "confirmed" && styles.activeTab]}
            onPress={() => setActiveTab("confirmed")}
          >
            <Text style={styles.tabText}>Confirmed Trips</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "ongoing" && styles.activeTab]}
            onPress={() => setActiveTab("ongoing")}
          >
            <Text style={styles.tabText}>Requested</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "completed" && styles.activeTab]}
            onPress={() => setActiveTab("completed")}
          >
            <Text style={styles.tabText}>Completed Trips</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#FFF" />
        ) : activeTab === "confirmed" && confirmedCars.length === 0 ? (
          renderEmptyState()
        ) : activeTab === "ongoing" && ongoingCars.length === 0 ? (
          renderEmptyState()
        ) : activeTab === "completed" && completedCars.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={
              activeTab === "confirmed"
                ? confirmedCars
                : activeTab === "ongoing"
                ? ongoingCars
                : completedCars
            }
            keyExtractor={(item) => item.id}
            renderItem={renderCarItem}
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
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  tabButton: {
    padding: 10,
    borderRadius: 5,
  },
  activeTab: {
    backgroundColor: "#007AFF",
  },
  tabText: {
    fontSize: 16,
    color: "#FFF",
  },
  card: {
    backgroundColor: "#1E5A82",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 15, // Add margin bottom here
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
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'contain',
    marginTop: 80,
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
  statusConfirmed: {
    color: "#FFA500", // Orange for confirmed
  },
  statusOngoing: {
    color: "#00FF00", // Green for ongoing
  },
  statusCompleted: {
    color: "#808080", // Gray for completed
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
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
});

export default TripScreen;