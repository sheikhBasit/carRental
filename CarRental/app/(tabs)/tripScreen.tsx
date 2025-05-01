import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { Button } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import AppLayout from "../screens/AppLayout";
import { getStoredUserId } from "@/utils/storageUtil";
import { AppConstants } from "@/constants/appConstants";

type BookingStatus = 'confirmed' | 'completed' | 'cancelled';

type BookingData = {
  _id: string;
  idVehicle?: {
    manufacturer?: string;
    model?: string;
    carImageUrls?: string[];
    rent?: number;
    capacity?: number;
  };
  company?: {
    companyName?: string;
  };
  from?: string;
  to?: string;
  status?: BookingStatus;
};

type CarProps = {
  id: string;
  name: string;
  image: string;
  price: string;
  fromDate: string;
  toDate: string;
  rentalCompany: string;
  capacity: number;
  status: BookingStatus;
  bookingData: BookingData; // Now properly typed
};

const getStatusColor = (status: BookingStatus) => {
  switch(status) {
    case 'confirmed': return styles.statusConfirmed;
    case 'completed': return styles.statusCompleted;
    case 'cancelled': return styles.statusCancelled;
    default: return {};
  }
};

const TripScreen = () => {
  const [confirmedCars, setConfirmedCars] = useState<CarProps[]>([]);
  const [completedCars, setCompletedCars] = useState<CarProps[]>([]);
  const [cancelledCars, setCancelledCars] = useState<CarProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<BookingStatus>("confirmed");
  const { refresh } = useLocalSearchParams<{ refresh: string }>();

  console.log("[TripScreen] Initial state:", {
    confirmedCars: confirmedCars.length,
    completedCars: completedCars.length,
    cancelledCars: cancelledCars.length,
    loading,
    activeTab,
    refresh
  });

  const handleHomeNavigation = () => {
    console.log("[TripScreen] Navigating to home screen");
    router.push("/");
  };

  const fetchBookings = async (status: BookingStatus) => {
    try {
      console.log(`[TripScreen] Fetching ${status} bookings...`);
      setLoading(true);
      const userId = await getStoredUserId();
      
      if (!userId) {
        console.error("[TripScreen] User ID not found in storage");
        setLoading(false);
        return;
      }

      console.log(`[TripScreen] Fetching bookings for user ${userId} with status ${status}`);
      const response = await fetch(
        `${AppConstants.LOCAL_URL}/bookings/userBookings?userId=${userId}&status=${status}`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`[TripScreen] No ${status} bookings found for the user.`);
          switch(status) {
            case 'confirmed': setConfirmedCars([]); break;
            case 'completed': setCompletedCars([]); break;
            case 'cancelled': setCancelledCars([]); break;
          }
          return;
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`[TripScreen] Received ${status} bookings data:`, data);

      if (!Array.isArray(data)) {
        console.error("[TripScreen] Invalid response format:", data);
        throw new Error("Invalid response format");
      }

      const formattedCars: CarProps[] = data.map((booking: BookingData) => {
        const vehicle = booking.idVehicle || {};
        const company = booking.company || {};

        const formattedCar = {
          id: booking._id,
          name: `${vehicle.manufacturer || "Unknown"} ${vehicle.model || ""}`.trim(),
          image: vehicle.carImageUrls?.[0] || "https://via.placeholder.com/150",
          price: vehicle.rent ? `Rs.${vehicle.rent}` : "N/A",
          fromDate: booking.from || "N/A",
          toDate: booking.to || "N/A",
          rentalCompany: company.companyName || "Unknown",
          capacity: vehicle.capacity || 0,
          status: booking.status || "confirmed",
          bookingData: booking
        };

        console.log(`[TripScreen] Formatted car ${formattedCar.id}:`, formattedCar);
        return formattedCar;
      });

      console.log(`[TripScreen] Setting ${status} cars:`, formattedCars);
      switch(status) {
        case 'confirmed': setConfirmedCars(formattedCars); break;
        case 'completed': setCompletedCars(formattedCars); break;
        case 'cancelled': setCancelledCars(formattedCars); break;
      }
    } catch (error) {
      console.error(`[TripScreen] Error fetching ${status} bookings:`, error);
    } finally {
      console.log(`[TripScreen] Finished fetching ${status} bookings`);
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("[TripScreen] Active tab changed to:", activeTab);
    fetchBookings(activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (refresh === 'true') {
      console.log("[TripScreen] Refresh triggered");
      fetchBookings(activeTab);
    }
  }, [refresh, activeTab]);

  const handleCardPress = (booking: CarProps) => {
    console.log("[TripScreen] Card pressed for booking:", booking.id);
    router.push({
      pathname: "/screens/BookingDetail/[booking]",
      params: { booking: JSON.stringify(booking.bookingData) },
    });
  };

  const renderCarItem = ({ item }: { item: CarProps }) => {
    console.log(`[TripScreen] Rendering car item ${item.id}`);
    return (
      <TouchableOpacity onPress={() => handleCardPress(item)}>
        <View style={styles.card}>
          <Image source={{ uri: item.image }} style={styles.carImage} />
          <View style={styles.cardContent}>
            <Text style={styles.carName}>{item.name}</Text>
            <Text style={styles.carPrice}>{item.price} per day</Text>
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
              <Text style={[styles.value, getStatusColor(item.status)]}>
                {item.status}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    console.log("[TripScreen] Rendering empty state for tab:", activeTab);
    return (
      <View style={styles.emptyContainer}>
        <Image source={require('../../assets/images/trip.jpg')} style={styles.image} />
        <Text style={styles.emptyText}>
          {activeTab === "confirmed" && "No confirmed trips available."}
          {activeTab === "completed" && "No completed trips available."}
          {activeTab === "cancelled" && "No cancelled trips available."}
        </Text>
        <Button mode="contained" onPress={handleHomeNavigation} style={styles.backButton}>
          Book New Car
        </Button>
      </View>
    );
  };

  console.log("[TripScreen] Rendering with state:", {
    confirmedCars: confirmedCars.length,
    completedCars: completedCars.length,
    cancelledCars: cancelledCars.length,
    loading,
    activeTab
  });

  return (
    <AppLayout title="Your Trips">
      <View style={styles.container}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "confirmed" && styles.activeTab]}
            onPress={() => {
              console.log("[TripScreen] Switching to confirmed tab");
              setActiveTab("confirmed");
            }}
          >
            <Text style={styles.tabText}>Confirmed</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "completed" && styles.activeTab]}
            onPress={() => {
              console.log("[TripScreen] Switching to completed tab");
              setActiveTab("completed");
            }}
          >
            <Text style={styles.tabText}>Completed</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "cancelled" && styles.activeTab]}
            onPress={() => {
              console.log("[TripScreen] Switching to cancelled tab");
              setActiveTab("cancelled");
            }}
          >
            <Text style={styles.tabText}>Cancelled</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#FFF" />
        ) : (
          <FlatList
            data={
              activeTab === "confirmed" ? confirmedCars :
              activeTab === "completed" ? completedCars :
              cancelledCars
            }
            keyExtractor={(item) => item.id}
            renderItem={renderCarItem}
            ListEmptyComponent={renderEmptyState}
            onEndReached={() => console.log("[TripScreen] Reached end of list")}
            onEndReachedThreshold={0.5}
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
    marginBottom: 60,
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
    color: "#00FF00", // Green for confirmed
  },
  statusCompleted: {
    color: "#808080", // Gray for completed
  },
  statusCancelled: {
    color: "#FF0000", // Red for cancelled
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