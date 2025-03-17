import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, FlatList, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import RentalAppLayout from "@/app/screens/rentalAppLayout";
import { AppConstants } from "@/constants/appConstants";
import { loadCompanyId } from "@/utils/storageUtil";

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
  startDate: string;
  endDate: string;
  customerName: string;
};

type HomeScreenNavigationProp = DrawerNavigationProp<any>;

const ActiveBookingsScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Fetch bookings by company ID
  const fetchCompanyBookings = async (companyId: string) => {
    try {
      setLoading(true); // Show loading before fetching
      const response = await fetch(
        `${AppConstants.LOCAL_URL}/bookings/companyBookings?company=${companyId}&status=confirmed`
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
      console.log(data);
      console.log(response.ok);

      // Map the fetched data to the Booking type
      const mappedBookings = data.map((booking: any) => ({
        _id: booking._id,
        status: booking.status,
        idVehicle: booking.idVehicle,
        startDate: booking.from,
        endDate: booking.to,
        customerName: booking.user, // Assuming user is the customer name
      }));

      setBookings(mappedBookings); // Update the bookings state with the fetched data
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false); // Hide loading after fetching
    }
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
  }, []);

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
            renderItem={({ item }) => (
              <View style={styles.bookingCard}>
                <Text style={styles.bookingText}>Booking ID: {item._id}</Text>
                <Text style={styles.bookingText}>Customer: {item.customerName}</Text>
                <Text style={styles.bookingText}>Status: {item.status}</Text>
                <Text style={styles.bookingText}>Start Date: {item.startDate}</Text>
                <Text style={styles.bookingText}>End Date: {item.endDate}</Text>

                {/* Vehicle Info inside Booking */}
                {item.idVehicle ? (
                  <>
                    <Text style={styles.bookingText}>
                      Vehicle: {item.idVehicle.manufacturer} {item.idVehicle.model}
                    </Text>
                    <Text style={styles.bookingText}>Transmission: {item.idVehicle.transmission}</Text>
                    <Text style={styles.bookingText}>Rent: ${item.idVehicle.rent}/day</Text>
                    <Image source={{ uri: item.idVehicle.carImageUrl }} style={styles.bookingCarImage} />
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
    </RentalAppLayout>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#003366", padding: 20 ,marginBottom:40},
  
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
});

export default ActiveBookingsScreen;