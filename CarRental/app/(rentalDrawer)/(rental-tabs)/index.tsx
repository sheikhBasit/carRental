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
import RentalAppLayout from "@/app/screens/rentalAppLayout";
import { AppConstants } from "@/constants/appConstants";
import { loadCompanyId } from "@/utils/storageUtil";
import { useNotifications } from "@/utils/useNotification"; // Import the hook

// Define the Vehicle type
type Vehicle = {
  manufacturer: string;
  model: string;
  carImageUrl: string;
  transmission: string;
  rent: number;
};

// Define the Booking type
type Booking = {
  _id: string;
  status: string;
  idVehicle?: Vehicle | null;
  from: string;
  to: string;
  user: string;
  isConfirmed?: boolean; // Add a new field to track confirmation status
};

type HomeScreenNavigationProp = DrawerNavigationProp<any>;

const RentalHomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Use the notification hook
  const { requestNotificationPermissions, scheduleNotification } = useNotifications();

  // Fetch bookings by company ID
  const fetchCompanyBookings = async (companyId: string) => {
    try {
      setLoading(true); // Show loading before fetching
      const response = await fetch(
        `${AppConstants.LOCAL_URL}/bookings/companyBookings?company=${companyId}&status=pending`
      );
      if (!response.ok) {
        if (response.status === 404) {
          console.log("No bookings found.");
          setBookings([]); // Set bookings to an empty array
          return;
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setBookings(data.map((booking: Booking) => ({ ...booking, isConfirmed: false }))); // Initialize isConfirmed as false
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false); // Hide loading after fetching
    }
  };

  // Handle Pull-to-Refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    if (companyId) {
      await fetchCompanyBookings(companyId);
    }
    setRefreshing(false);
  };

  // Fetch company ID and bookings on mount
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

    // Request notification permissions
    requestNotificationPermissions();
  }, []);

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      // Update the booking status to "confirmed" on the backend
      const response = await fetch(`${AppConstants.LOCAL_URL}/bookings/updateBooking/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "confirmed" }), // Update the status to "confirmed"
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      // Update the local state to reflect the confirmed status
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === bookingId ? { ...booking, isConfirmed: true } : booking
        )
      );
  
      // Schedule a notification for confirmation
      await scheduleNotification("Booking Confirmed", "Your booking has been confirmed.", 1);
  
      Alert.alert("Success", "Booking confirmed successfully!");
    } catch (error) {
      console.error("Error confirming booking:", error);
      Alert.alert("Error", "Failed to confirm booking. Please try again.");
    }
  };

  // Handle Decline Booking
  const handleDeclineBooking = async (bookingId: string) => {
    try {
      // Update the booking status to "cancelled" on the backend
      const response = await fetch(`${AppConstants.LOCAL_URL}/bookings/updateBooking/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }), // Update the status to "cancelled"
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      // Remove the declined booking from the local state
      setBookings((prevBookings) =>
        prevBookings.filter((booking) => booking._id !== bookingId)
      );
  
      // Schedule a notification for decline
      await scheduleNotification("Booking Declined", "Your booking has been declined.", 1);
  
      Alert.alert("Success", "Booking declined successfully!");
    } catch (error) {
      console.error("Error declining booking:", error);
      Alert.alert("Error", "Failed to decline booking. Please try again.");
    }
  };

  return (
    <RentalAppLayout title="Dashboard">
      <View style={styles.container}>
        {/* Loading Indicator */}
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
                {/* <Text style={styles.bookingText}>Customer: {item.user}</Text> */}
                <Text style={styles.bookingText}>Status: {item.status}</Text>
                <Text style={styles.bookingText}>Start Date: {item.from}</Text>
                <Text style={styles.bookingText}>End Date: {item.to}</Text>

                {/* Vehicle Info inside Booking */}
                {item.idVehicle ? (
                  <>
                    <Text style={styles.bookingText}>
                      Vehicle: {item.idVehicle.manufacturer} {item.idVehicle.model}
                    </Text>
                    <Text style={styles.bookingText}>Transmission: {item.idVehicle.transmission}</Text>
                    <Text style={styles.bookingText}>Rent: ${item.idVehicle.rent}/day</Text>
                    <Image
                      source={{ uri: item.idVehicle.carImageUrl }}
                      style={styles.bookingCarImage}
                    />
                  </>
                ) : (
                  <Text style={styles.warningText}>No vehicle assigned to this booking</Text>
                )}

                {/* Confirm and Decline Buttons */}
                {!item.isConfirmed && ( // Only show buttons if the booking is not confirmed
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
                )}
              </View>
            )}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No Request for bookings</Text>
          </View>
        )}
      </View>
    </RentalAppLayout>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#003366", padding: 20 ,marginBottom:30},

  /* Loading */
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#FFF", fontSize: 16, marginTop: 10 },

  /* Empty State */
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "rgba(255, 255, 255, 0.5)", fontSize: 16 },

  /* Booking Card */
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

  /* Buttons */
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
    backgroundColor: "#4CAF50", // Green
  },
  declineButton: {
    backgroundColor: "#F44336", // Red
  },
  buttonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default RentalHomeScreen;