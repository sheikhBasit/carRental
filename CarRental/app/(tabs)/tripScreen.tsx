import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from "react-native";
import { Button } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import AppLayout from "../screens/AppLayout";
import { getStoredUserId } from "@/utils/storageUtil";
import { AppConstants } from "@/constants/appConstants";
import { apiFetch } from '@/utils/api';

type BookingStatus = 'confirmed' | 'completed' | 'canceled' | 'ongoing';

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
  bookingData: BookingData;
};

const getStatusColor = (status: BookingStatus) => {
  switch(status) {
    case 'confirmed': return styles.statusConfirmed;
    case 'completed': return styles.statusCompleted;
    case 'canceled': return styles.statuscanceled;
    case 'ongoing': return styles.statusOngoing;
    default: return {};
  }
};

const TripScreen = () => {
  const [confirmedCars, setConfirmedCars] = useState<CarProps[]>([]);
  const [completedCars, setCompletedCars] = useState<CarProps[]>([]);
  const [canceledCars, setcanceledCars] = useState<CarProps[]>([]);
  const [ongoingCars, setOngoingCars] = useState<CarProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<BookingStatus>("confirmed");
  const { refresh } = useLocalSearchParams<{ refresh: string }>();

  console.log("[TripScreen] Initial state:", {
    confirmedCars: confirmedCars.length,
    completedCars: completedCars.length,
    canceledCars: canceledCars.length,
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
      const userId = await getStoredUserId();
      if (!userId) {
        console.log("[TripScreen] User ID not found in storage");
        setLoading(false);
        return;
      }
      const result = await apiFetch(`/bookings/userBookings?userId=${userId}&status=${status}`,{},undefined,  'user');
      if (Array.isArray(result)) {
        const formattedCars = result.map((booking: any) => {
          const vehicle = booking.idVehicle || {};
          const company = booking.company || {};
          return {
            id: booking._id || "N/A",
            name: `${vehicle.manufacturer || "Unknown"} ${vehicle.model || ""}`.trim(),
            image: vehicle.carImageUrls && vehicle.carImageUrls.length > 0 ? vehicle.carImageUrls[0] : "https://via.placeholder.com/150",
            price: vehicle.rent || "N/A",
            fromDate: booking.from || "N/A",
            toDate: booking.to || "N/A",
            rentalCompany: company.companyName || "Unknown",
            capacity: vehicle.capacity || "N/A",
            status: booking.status,
            bookingData: booking,
          };
        });
        if (status === "confirmed") setConfirmedCars(formattedCars);
        if (status === "completed") setCompletedCars(formattedCars);
        if (status === "canceled") setcanceledCars(formattedCars);
        if (status === "ongoing") setOngoingCars(formattedCars);
      } else {
        if (status === "confirmed") setConfirmedCars([]);
        if (status === "completed") setCompletedCars([]);
        if (status === "canceled") setcanceledCars([]);
        if (status === "ongoing") setOngoingCars([]);
      }
    } catch (error) {
      console.log(`[TripScreen] Error fetching ${status} bookings:`, error);
      if (status === "confirmed") setConfirmedCars([]);
      if (status === "completed") setCompletedCars([]);
      if (status === "canceled") setcanceledCars([]);
      if (status === "ongoing") setOngoingCars([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    console.log("[TripScreen] Manual refresh triggered");
    setRefreshing(true);
    fetchBookings(activeTab);
  };

  useEffect(() => {
    console.log("[TripScreen] Active tab changed to:", activeTab);
    setLoading(true);
    fetchBookings(activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (refresh === 'true') {
      console.log("[TripScreen] Refresh triggered");
      setRefreshing(true);
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
          {activeTab === "canceled" && "No canceled trips available."}
          {activeTab === "ongoing" && "No ongoing trips available."}
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
    canceledCars: canceledCars.length,
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
            <Text style={styles.tabText}>Upcoming</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "ongoing" && styles.activeTab]}
            onPress={() => {
              console.log("[TripScreen] Switching to ongoing tab");
              setActiveTab("ongoing");
            }}
          >
            <Text style={styles.tabText}>Ongoing</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "completed" && styles.activeTab]}
            onPress={() => {
              console.log("[TripScreen] Switching to completed tab");
              setActiveTab("completed");
            }}
          >
            <Text style={styles.tabText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "canceled" && styles.activeTab]}
            onPress={() => {
              console.log("[TripScreen] Switching to canceled tab");
              setActiveTab("canceled");
            }}
          >
            <Text style={styles.tabText}>Canceled</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#FFF" />
        ) : (
          <FlatList
            data={
              activeTab === "confirmed" ? confirmedCars :
              activeTab === "ongoing" ? ongoingCars :
              activeTab === "completed" ? completedCars :
              activeTab === "canceled" ? canceledCars :
              []
            }
            keyExtractor={(item) => item.id}
            renderItem={renderCarItem}
            ListEmptyComponent={renderEmptyState}
            onEndReached={() => console.log("[TripScreen] Reached end of list")}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#007AFF"]}
                tintColor="#007AFF"
              />
            }
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
  statusOngoing: {
    color: '#ff9900',
    fontWeight: 'bold',
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
    color: "#00FF00",
  },
  statusCompleted: {
    color: "#808080",
  },
  statuscanceled: {
    color: "#FF0000",
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