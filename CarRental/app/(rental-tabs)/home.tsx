import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import RentalAppLayout from "@/app/screens/rentalAppLayout";
import { AppConstants } from "@/constants/appConstants";
import { loadCompanyId } from "@/utils/storageUtil";

type Vehicle = {
  manufacturer: string;
  model: string;
  carImageUrls: string[];
  transmission: string;
  rent: number;
};

type Booking = {
  _id: string;
  status: string;
  idVehicle?: Vehicle | null;
  from: string;
  to: string;
  user: string;
  fromTime: string;
  toTime: string;
};

type HomeScreenNavigationProp = DrawerNavigationProp<any>;
const Tab = createMaterialTopTabNavigator();

const PendingBookingsTab = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const fetchCompanyBookings = async (companyId: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${AppConstants.LOCAL_URL}/bookings/companyBookings?company=${companyId}&status=pending`
      );
      if (!response.ok) {
        if (response.status === 404) {
          console.log("No bookings found.");
          setBookings([]);
          return;
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (companyId) {
      await fetchCompanyBookings(companyId);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    const fetchCompanyId = async () => {
      const storedCompanyId = await loadCompanyId();
      if (storedCompanyId) {
        setCompanyId(storedCompanyId);
        fetchCompanyBookings(storedCompanyId);
      } else {
        console.error("Company ID not found in storage");
        setLoading(false);
      }
    };

    fetchCompanyId();
  }, []);

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`${AppConstants.LOCAL_URL}/bookings/updateBooking/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "confirmed" }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setBookings((prevBookings) =>
        prevBookings.filter((booking) => booking._id !== bookingId)
      );

      Alert.alert("Success", "Booking confirmed successfully!");
    } catch (error) {
      console.error("Error confirming booking:", error);
      Alert.alert("Error", "Failed to confirm booking. Please try again.");
    }
  };

  const handleDeclineBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`${AppConstants.LOCAL_URL}/bookings/updateBooking/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setBookings((prevBookings) =>
        prevBookings.filter((booking) => booking._id !== bookingId)
      );

      Alert.alert("Success", "Booking declined successfully!");
    } catch (error) {
      console.error("Error declining booking:", error);
      Alert.alert("Error", "Failed to decline booking. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Fetching Bookings...</Text>
        </View>
      ) : bookings.length > 0 ? (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#FFFFFF"]}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.bookingCard}>
              <Text style={styles.bookingText}>Booking ID: {item._id}</Text>
              <Text style={styles.bookingText}>Status: {item.status}</Text>
              <Text style={styles.bookingText}>
  Start Date & Time: {item.fromTime ? item.fromTime.split("T")[1].split(".")[0] : "N/A"} {item.from}
</Text>
<Text style={styles.bookingText}>
  End Date & Time: {item.toTime ? item.toTime.split("T")[1].split(".")[0] : "N/A"} {item.to}
</Text>

              {item.idVehicle ? (
                <>
                  <Text style={styles.bookingText}>
                    Vehicle: {item.idVehicle.manufacturer} {item.idVehicle.model}
                  </Text>
                  <Text style={styles.bookingText}>Transmission: {item.idVehicle.transmission}</Text>
                  <Text style={styles.bookingText}>Rent: ${item.idVehicle.rent}/day</Text>
                  <Image
                    source={{ uri: item.idVehicle.carImageUrls[0] }}
                    style={styles.bookingCarImage}
                  />
                </>
              ) : (
                <Text style={styles.warningText}>No vehicle assigned to this booking</Text>
              )}

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={() => handleConfirmBooking(item._id)}
                >
                  <Text style={styles.buttonText}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.declineButton]}
                  onPress={() => handleDeclineBooking(item._id)}
                >
                  <Text style={styles.buttonText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No Request for bookings</Text>
        </View>
      )}
    </View>
  );
};

const ActiveBookingsTab = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCompanyBookings = async (companyId: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${AppConstants.LOCAL_URL}/bookings/companyBookings?company=${companyId}&status=confirmed`
      );
      if (!response.ok) {
        if (response.status === 404) {
          console.log("No bookings found.");
          setBookings([]);
          return;
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (companyId) {
      await fetchCompanyBookings(companyId);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    const fetchCompanyId = async () => {
      const storedCompanyId = await loadCompanyId();
      if (storedCompanyId) {
        setCompanyId(storedCompanyId);
        fetchCompanyBookings(storedCompanyId);
      } else {
        console.error("Company ID not found in storage");
        setLoading(false);
      }
    };

    fetchCompanyId();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Fetching Bookings...</Text>
        </View>
      ) : bookings.length > 0 ? (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#FFFFFF"]}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.bookingCard}>
              <Text style={styles.bookingText}>Booking ID: {item._id}</Text>
              <Text style={styles.bookingText}>Customer: {item.user}</Text>
              <Text style={styles.bookingText}>Status: {item.status}</Text>
              <Text style={styles.bookingText}>
  Start Date & Time: {item.fromTime ? item.fromTime.split("T")[1]?.split(".")[0] : "N/A"} {item.from}
</Text>
<Text style={styles.bookingText}>
  End Date & Time: {item.toTime ? item.toTime.split("T")[1]?.split(".")[0] : "N/A"} {item.to}
</Text>

              {item.idVehicle ? (
                <>
                  <Text style={styles.bookingText}>
                    Vehicle: {item.idVehicle.manufacturer} {item.idVehicle.model}
                  </Text>
                  <Text style={styles.bookingText}>Transmission: {item.idVehicle.transmission}</Text>
                  <Text style={styles.bookingText}>Rent: ${item.idVehicle.rent}/day</Text>
                  <Image
                    source={{ uri: item.idVehicle.carImageUrls[0] }}
                    style={styles.bookingCarImage}
                  />
                </>
              ) : (
                <Text style={styles.warningText}>No vehicle assigned to this booking</Text>
              )}
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No active bookings for the company</Text>
        </View>
      )}
    </View>
  );
};

const RentalHomeScreen = () => {
  return (
    <RentalAppLayout title="Dashboard">
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#FFF",
          tabBarInactiveTintColor: "rgba(255, 255, 255, 0.5)",
          tabBarStyle: { backgroundColor: "#003366" },
          tabBarIndicatorStyle: { backgroundColor: "#FFF" },
        }}
      >
        <Tab.Screen name="Pending" component={PendingBookingsTab} />
        <Tab.Screen name="Active" component={ActiveBookingsTab} />
      </Tab.Navigator>
    </RentalAppLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#003366", padding: 20, marginBottom: 30 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#FFF", fontSize: 16, marginTop: 10 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "rgba(255, 255, 255, 0.5)", fontSize: 16 },
  bookingCard: {
    backgroundColor: "#1E5A82",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  bookingText: {
    fontSize: 14,
    color: "#FFF",
    marginBottom: 5,
  },
  warningText: {
    fontSize: 14,
    color: "#FFD700",
    marginTop: 5,
  },
  bookingCarImage: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
  },
  declineButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default RentalHomeScreen;