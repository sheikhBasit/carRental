import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { AppConstants } from "@/constants/appConstants";
import { Ionicons } from "@expo/vector-icons";

interface Booking {
  _id: string;
  idVehicle: {
    manufacturer: string;
    model: string;
    carImageUrls: string[];
    rent: number;
  };
  company: {
    companyName: string;
    address: string;
    city: string;
    phNum: string;
  };
  from: string;
  to: string;
  totalPrice: number;
  status: string;
}

const BookingDetailsScreen = () => {
  const navigation = useNavigation();
  const { booking: bookingString } = useLocalSearchParams<{ booking: string }>();
  const parsedBooking = JSON.parse(bookingString || "{}") as Booking;

  const [booking, setBooking] = useState<Booking | null>(parsedBooking);
  const [loading, setLoading] = useState(false); // Set to false since we already have the booking data
  const [error, setError] = useState<string | null>(null);

  // If you need to fetch booking details from the server, uncomment this useEffect
  /*
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${AppConstants.LOCAL_URL}/bookings/${parsedBooking._id}`);
        const result = await response.json();

        if (response.ok) {
          setBooking(result);
        } else {
          setError("Failed to fetch booking details.");
        }
      } catch (error) {
        setError("Error fetching booking details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [parsedBooking._id]);
  */

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Booking details not available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#FFF" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Booking ID */}
        <Text style={styles.sectionTitle}>Booking ID</Text>
        <Text style={styles.value}>{booking._id}</Text>

        {/* Rental Car Image */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
  {booking.idVehicle.carImageUrls.map((url, index) => (
    <Image key={index} source={{ uri: url }} style={styles.image} />
  ))}
</ScrollView>
        {/* Rental Company */}
        <Text style={styles.sectionTitle}>Rental Company</Text>
        <Text style={styles.value}>{booking.company.companyName}</Text>
        <Text style={styles.value}>{booking.company.address}, {booking.company.city}</Text>
        <Text style={styles.value}>📞 {booking.company.phNum}</Text>

        {/* Booking Dates */}
        <Text style={styles.sectionTitle}>Booking Dates</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>From:</Text>
          <Text style={styles.value}>{booking.from}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>To:</Text>
          <Text style={styles.value}>{booking.to}</Text>
        </View>

        {/* Total Price */}
        <Text style={styles.sectionTitle}>Total Price</Text>
        <Text style={styles.value}>${booking.totalPrice}</Text>

        {/* Booking Status */}
        <Text style={styles.sectionTitle}>Status</Text>
        <Text
          style={[
            styles.value,
            booking.status === "confirmed" && styles.statusConfirmed,
            booking.status === "ongoing" && styles.statusOngoing,
            booking.status === "completed" && styles.statusCompleted,
          ]}
        >
          {booking.status}
        </Text>
      </ScrollView>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003366",
    padding: 10,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 80, // Add padding to avoid overlap with the button row
  },
  image: {
    width: "100%",
    height: 200,
    marginTop: 50,
    borderRadius: 10,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    marginTop: 10,
    textAlign: "center",
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 20,
    marginBottom: 10,
  },
});

export default BookingDetailsScreen;