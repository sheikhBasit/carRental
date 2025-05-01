import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface Booking {
  _id: string;
  idVehicle?: {
    manufacturer?: string;
    model?: string;
    carImageUrls?: string[];
    rent?: number;
  };
  company?: {
    companyName?: string;
    address?: string;
    city?: string;
    phNum?: string;
  };
  from?: string;
  to?: string;
  fromTime?: string;
  toTime?: string;
  totalPrice?: number;
  status?: string;
}

interface Transaction {
  _id: string;
  transactionId: string;
  bookingId: string;
  amount: number;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
}

const BookingDetailsScreen = () => {
  const navigation = useNavigation();
  const { booking: bookingString, id } = useLocalSearchParams<{ booking: string; id: string }>();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Load booking and transaction data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load booking data
        if (bookingString) {
          try {
            const decodedString = decodeURIComponent(bookingString);
            const parsedBooking = JSON.parse(decodedString) as Booking;
            setBooking(parsedBooking);
            
            // Fetch transaction data after booking is loaded
            if (parsedBooking._id) {
              await fetchTransactionData(parsedBooking._id);
            }
            
            return;
          } catch (parseError) {
            console.log("Parsing error:", parseError);
          }
        }

        if (id) {
          const bookingResponse = await fetch(
            `https://car-rental-backend-black.vercel.app/bookings/getBookingById/${id}`
          );
          
          if (!bookingResponse.ok) {
            throw new Error("Failed to fetch booking details");
          }
          
          const bookingData = await bookingResponse.json();
          console.log("Booking API Response:", bookingData);
          setBooking(bookingData);
          
          // Fetch transaction data
          await fetchTransactionData(bookingData._id);
        } else if (!bookingString) {
          setError("No booking information provided");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    const fetchTransactionData = async (bookingId: string) => {
      try {
        const response = await fetch(
          `https://car-rental-backend-black.vercel.app/transaction/booking/${bookingId}`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch transaction details");
        }
        
        const data = await response.json();
        console.log("Transaction API Response:", data);
        if (data.success && data.transaction) {
          setTransaction(data.transaction);
        }
      } catch (err) {
        console.log("Error fetching transaction:", err);
      }
    };

    loadData();
  }, [bookingString, id]);

  const handleCancelBooking = async () => {
    if (!booking?._id) return;

    setIsCancelling(true);
    try {
      const response = await fetch(
        `https://car-rental-backend-black.vercel.app/bookings/updateBooking/${booking._id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'cancelled' })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to cancel booking. Status: ${response.status}`);
      }

      const updatedBooking = await response.json();
      setBooking(updatedBooking);
      
      Alert.alert(
        "Booking Cancelled",
        "Your booking has been successfully cancelled.",
        [
          { 
            text: "OK", 
            onPress: () => {
              // Navigate back to trips screen
              navigation.goBack();
            }
          }
        ]
      );
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to cancel booking",
        [
          { text: "OK" }
        ]
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const confirmCancel = () => {
    Alert.alert(
      "Confirm Cancellation",
      "Are you sure you want to cancel this booking?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: handleCancelBooking,
        },
      ]
    );
  };

  const handleError = () => {
    Alert.alert("Error", error || "Something went wrong", [
      { text: "Go Back", onPress: () => navigation.goBack() }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={handleError}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Booking details not available.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { width } = Dimensions.get("window");
  const imageWidth = width - 40;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#FFF" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>Booking Details</Text>
        
        <Text style={styles.sectionTitle}>Booking ID</Text>
        <Text style={styles.value}>{booking._id}</Text>

        {booking.idVehicle && (
          <>
            <Text style={styles.sectionTitle}>Vehicle</Text>
            <Text style={styles.value}>
              {booking.idVehicle.manufacturer} {booking.idVehicle.model}
            </Text>
          </>
        )}

        {booking.idVehicle?.carImageUrls && booking.idVehicle.carImageUrls.length > 0 && (
          <View style={styles.imageContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {booking.idVehicle.carImageUrls.map((url, index) => (
                <Image 
                  key={index} 
                  source={{ uri: url }} 
                  style={[styles.image, { width: imageWidth }]} 
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            <Text style={styles.imageIndicator}>
              Swipe to see {booking.idVehicle.carImageUrls.length} images
            </Text>
          </View>
        )}

        {booking.company && (
          <>
            <Text style={styles.sectionTitle}>Rental Company</Text>
            <Text style={styles.value}>{booking.company.companyName || 'Not specified'}</Text>
            {booking.company.address && booking.company.city && (
              <Text style={styles.value}>
                {booking.company.address}, {booking.company.city}
              </Text>
            )}
            {booking.company.phNum && (
              <Text style={styles.value}>📞 {booking.company.phNum}</Text>
            )}
          </>
        )}

        <Text style={styles.sectionTitle}>Booking Dates</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>From:</Text>
          <Text style={styles.value}>{booking.from || 'Not specified'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>To:</Text>
          <Text style={styles.value}>{booking.to || 'Not specified'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>From Time:</Text>
          <Text style={styles.value}>{booking.fromTime || 'Not specified'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>To Time:</Text>
          <Text style={styles.value}>{booking.toTime || 'Not specified'}</Text>
        </View>

        <Text style={styles.sectionTitle}>Payment Details</Text>
        {transaction ? (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Amount Paid:</Text>
              <Text style={styles.price}>Rs.{transaction.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Payment Status:</Text>
              <Text style={[styles.value, transaction.paymentStatus === 'completed' ? styles.statusConfirmed : styles.statusCancelled]}>
                {transaction.paymentStatus.toUpperCase()}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Payment Method:</Text>
              <Text style={styles.value}>{transaction.paymentMethod.toUpperCase()}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Transaction ID:</Text>
              <Text style={styles.value}>{transaction.transactionId}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.value}>No transaction details available</Text>
        )}

        <Text style={styles.sectionTitle}>Status</Text>
        <View style={styles.statusContainer}>
          <Text
            style={[
              styles.statusText,
              booking.status === "confirmed" && styles.statusConfirmed,
              booking.status === "ongoing" && styles.statusOngoing,
              booking.status === "completed" && styles.statusCompleted,
              booking.status === "cancelled" && styles.statusCancelled,
            ]}
          >
            {booking.status ? booking.status.toUpperCase() : 'UNKNOWN'}
          </Text>
        </View>

        {booking.status !== 'cancelled' && (
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={confirmCancel}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.cancelButtonText}>Cancel Booking</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003366",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#003366",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFF",
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#003366",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 100,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 20,
    textAlign: "center",
  },
  imageContainer: {
    marginVertical: 15,
  },
  image: {
    height: 200,
    borderRadius: 10,
    marginRight: 10,
  },
  imageIndicator: {
    color: "#ADD8E6",
    textAlign: "center",
    marginTop: 5,
    fontSize: 12,
  },
  errorText: {
    fontSize: 16,
    color: "#FF6B6B",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#0066CC",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  label: {
    fontSize: 16,
    color: "#ADD8E6",
    fontWeight: "600",
  },
  value: {
    fontSize: 16,
    color: "#FFF",
    marginVertical: 2,
  },
  price: {
    fontSize: 24,
    color: "#4CD964",
    fontWeight: "bold",
  },
  statusContainer: {
    marginTop: 5,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: "flex-start",
    overflow: "hidden",
    color: "#FFF",
    backgroundColor: "#666",
  },
  statusConfirmed: {
    backgroundColor: "#FF9500",
  },
  statusOngoing: {
    backgroundColor: "#4CD964",
  },
  statusCompleted: {
    backgroundColor: "#5AC8FA",
  },
  statusCancelled: {
    backgroundColor: "#FF3B30",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 20,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.2)",
    paddingBottom: 5,
  },
  cancelButton: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 8,
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default BookingDetailsScreen;