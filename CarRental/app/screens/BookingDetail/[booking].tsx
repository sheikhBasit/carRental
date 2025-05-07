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
  TextInput,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { apiFetch } from '@/utils/api';

interface Booking {
  _id: string;
  idVehicle?: {
    manufacturer?: string;
    model?: string;
    carImageUrls?: string[];
    rent?: number;
    status?: string;
    features?: string[];
    maintenanceLogs?: any[];
    dynamicPricing?: any;
    discount?: number;
  };
  company?: {
    companyName?: string;
    address?: string;
    city?: string;
    phNum?: string;
    adminNotes?: string;
    bookingChannel?: string;
  };
  from?: string;
  to?: string;
  fromTime?: string;
  toTime?: string;
  totalPrice?: number;
  status?: string;
  priceDetails?: any;
  paymentReference?: string;
  cancellationReason?: string;
  feedback?: any;
  damageReport?: any;
  isDeleted?: boolean;
  promoCode?: string;
  handoverAt?: string;
  returnedAt?: string;
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

const BookingDetailsScreen = ({ userType = 'user' }: { userType?: 'user' | 'company' }) => {
  const navigation = useNavigation();
  const { booking: bookingString, id } = useLocalSearchParams<{ booking: string; id: string }>();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // --- FEEDBACK, DAMAGE REPORT, TERMS ACCEPTANCE, ELIGIBILITY LOGIC ---
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [showDamageForm, setShowDamageForm] = useState(false);
  const [damageDescription, setDamageDescription] = useState("");
  const [damageImages, setDamageImages] = useState<string[]>([]);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [eligibilityError, setEligibilityError] = useState<string | null>(null);

  // --- Delivery/Return Reminder Logic ---
  const [reminder, setReminder] = useState<string | null>(null);

  const confirmHandover = async () => {
    if (!booking?._id) return;
    
    try {
      const updatedBooking = await apiFetch(`/bookings/updateBooking/${booking._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          status: 'ongoing',
          handoverAt: new Date().toISOString() 
        })
      },undefined,userType);
      setBooking(updatedBooking);
      Alert.alert("Handover Confirmed", "Your rental period has now started.");
    } catch (err) {
      Alert.alert('Error', 'Failed to confirm handover');
    }
  };

  const checkBookingStatus = async () => {
    if (!booking?._id) return;
    
    try {
      const updatedBooking = await apiFetch(`/bookings/getBookingById/${booking._id}`,{},undefined,userType);
      setBooking(updatedBooking);
    } catch (err) {
      console.error("Error checking booking status:", err);
    }
  };

  useEffect(() => {
    if (!booking) return;
    const now = new Date();
    const fromTime = booking.fromTime ? new Date(booking.fromTime) : null;
    const toTime = booking.toTime ? new Date(booking.toTime) : null;
    let reminderMsg = null;
    if (booking.status === 'confirmed' && fromTime) {
      const diff = (fromTime.getTime() - now.getTime()) / (60 * 1000);
      if (diff > 0 && diff <= 30) {
        reminderMsg = `Your vehicle will be delivered at ${fromTime.toLocaleString()}`;
      }
    }
    if (booking.status === 'ongoing' && toTime) {
      const diff = (toTime.getTime() - now.getTime()) / (60 * 1000);
      if (diff > 0 && diff <= 30) {
        reminderMsg = `Your vehicle is due for return at ${toTime.toLocaleString()}`;
      }
      if (diff < 0) {
        reminderMsg = `Your vehicle return is overdue! Please return as soon as possible.`;
      }
    }
    setReminder(reminderMsg);
  }, [booking]);

  // Poll for status changes (or use WebSockets)
  useEffect(() => {
    if (booking?._id && booking.status !== 'completed' && booking.status !== 'cancelled') {
      const interval = setInterval(checkBookingStatus, 300000); // Check every 5 minutes
      return () => clearInterval(interval);
    }
  }, [booking?._id]);

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
          const bookingData = await apiFetch(`/bookings/getBookingById/${id}`,{},undefined, userType);
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
        const data = await apiFetch(`/transaction/booking/${bookingId}`, {}, undefined, userType);
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

  // Show feedback form if booking is completed and no feedback exists
  useEffect(() => {
    if (booking && booking.status === 'completed') {
      setShowFeedbackForm(true);
    } else {
      setShowFeedbackForm(false);
    }
  }, [booking]);

  // Eligibility check (age, CNIC, license, vehicle status)
  useEffect(() => {
    if (!booking) return;
    // Example: Assume user info is fetched elsewhere and available globally
    const user = { age: 22, cnicVerified: true, licenseVerified: true }; // TODO: Replace with real user data
    if (user.age < 21) {
      setEligibilityError('You must be 21+ to book a vehicle.');
    } else if (!user.cnicVerified || !user.licenseVerified) {
      setEligibilityError('CNIC and License must be verified to book.');
    } else if (booking.idVehicle && booking.idVehicle.status !== 'available') {
      setEligibilityError('This vehicle is not available for booking.');
    } else {
      setEligibilityError(null);
    }
  }, [booking]);

  const handleCancelBooking = async () => {
    if (!booking?._id) return;

    setIsCancelling(true);
    try {
      const updatedBooking = await apiFetch(`/bookings/updateBooking/${booking._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'canceled' })
      },undefined,userType);
      setBooking(updatedBooking);
      Alert.alert(
        "Booking canceled",
        "Your booking has been successfully canceled.",
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
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to cancel booking');
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

  const submitFeedback = async () => {
    try {
      // TODO: API endpoint for feedback
      // await fetch('/feedback', { method: 'POST', body: JSON.stringify({ ... }) })
      setShowFeedbackForm(false);
      Alert.alert('Feedback submitted!');
    } catch (e) {
      Alert.alert('Failed to submit feedback.');
    }
  };

  const submitDamage = async () => {
    try {
      // TODO: API endpoint for damage report
      // await fetch('/damagereport', { method: 'POST', body: JSON.stringify({ ... }) })
      setShowDamageForm(false);
      Alert.alert('Damage report submitted!');
    } catch (e) {
      Alert.alert('Failed to submit damage report.');
    }
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
        {reminder && (
          <View style={{ backgroundColor: '#ffe6b3', padding: 12, borderRadius: 8, margin: 10 }}>
            <Text style={{ color: '#b36b00', fontWeight: 'bold', fontSize: 16 }}>{reminder}</Text>
          </View>
        )}
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
              <Text style={styles.value}> {booking.company.phNum}</Text>
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
              booking.status === "canceled" && styles.statusCancelled,
            ]}
          >
            {booking.status ? booking.status.toUpperCase() : 'UNKNOWN'}
          </Text>
        </View>

        {/* Handover confirmation button */}
        {booking.status === 'confirmed' && booking.fromTime && new Date(booking.fromTime) < new Date() && (
  <TouchableOpacity style={styles.button} onPress={confirmHandover}>
    <Text style={styles.buttonText}>Confirm Vehicle Received</Text>
  </TouchableOpacity>
)}

        {eligibilityError && (
          <Text style={{ color: 'red', margin: 8 }}>{eligibilityError}</Text>
        )}
        {booking && (
          <>
            {/* Buffer Time */}
            <Text style={styles.sectionTitle}>Buffer Time</Text>
            <Text style={styles.value}>There is a 2-hour buffer before/after your booking.</Text>
            {/* Cancellation Policy */}
            <Text style={styles.sectionTitle}>Cancellation Policy</Text>
            <Text style={styles.value}>Cancellations allowed up to 24 hours before booking starts.</Text>
            {/* Terms Acceptance (if not confirmed) */}
            {booking.status !== 'confirmed' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
                <TouchableOpacity onPress={() => setAcceptTerms(!acceptTerms)} style={{ marginRight: 8 }}>
                  <View style={{ width: 24, height: 24, borderWidth: 1, borderColor: '#003366', backgroundColor: acceptTerms ? '#003366' : '#FFF', justifyContent: 'center', alignItems: 'center' }}>
                    {acceptTerms && <Ionicons name="checkmark" size={18} color="#FFF" />}
                  </View>
                </TouchableOpacity>
                <Text>I accept the Terms and Conditions</Text>
              </View>
            )}
            {/* Feedback Form */}
            {showFeedbackForm && (
              <View style={{ marginVertical: 16, padding: 8, backgroundColor: '#f8f8ff', borderRadius: 8 }}>
                <Text style={styles.sectionTitle}>Feedback</Text>
                <Text>Rating:</Text>
                <View style={{ flexDirection: 'row', marginVertical: 4 }}>
                  {[1,2,3,4,5].map(val => (
                    <TouchableOpacity key={val} onPress={() => setFeedbackRating(val)}>
                      <Ionicons name={val <= feedbackRating ? 'star' : 'star-outline'} size={24} color="#f4b400" />
                    </TouchableOpacity>
                  ))}
                </View>
                <Text>Comment:</Text>
                <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 4, marginVertical: 4 }}>
                  <TextInput
                    style={{ minHeight: 40, padding: 4 }}
                    value={feedbackComment}
                    onChangeText={setFeedbackComment}
                    editable
                    multiline
                  />
                </View>
                <TouchableOpacity style={styles.button} onPress={submitFeedback}>
                  <Text style={styles.buttonText}>Submit Feedback</Text>
                </TouchableOpacity>
              </View>
            )}
            {/* Damage Report Form */}
            {showDamageForm && (
              <View style={{ marginVertical: 16, padding: 8, backgroundColor: '#fff0f0', borderRadius: 8 }}>
                <Text style={styles.sectionTitle}>Damage Report</Text>
                <Text>Description:</Text>
                <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 4, marginVertical: 4 }}>
                  <TextInput
                    style={{ minHeight: 40, padding: 4 }}
                    onChangeText={setDamageDescription}
                    editable
                    multiline
                  >{damageDescription}
                  </TextInput>
                </View>
                {/* TODO: Add image picker for damageImages */}
                <TouchableOpacity style={styles.button} onPress={submitDamage}>
                  <Text style={styles.buttonText}>Submit Damage Report</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
        {booking.status !== 'canceled' && (
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
    marginVertical: 10,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
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