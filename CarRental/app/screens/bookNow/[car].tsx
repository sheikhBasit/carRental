import React, { useState, useEffect, useMemo } from "react";
import {
  View, Text, Image, StyleSheet, Platform, ScrollView, Alert, TextInput, Switch, TouchableOpacity
} from "react-native";
import { StripeProvider } from '@stripe/stripe-react-native';
import { useLocalSearchParams, useNavigation, router } from "expo-router";
import { AppConstants } from "@/constants/appConstants";
import { getStoredUserId } from "@/utils/storageUtil";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const API_URL = `${AppConstants.LOCAL_URL}/bookings/postBooking`;
const STRIPE_PUBLIC_KEY = "your_stripe_public_key"; // Replace with your Stripe public key

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
import { usePaymentSheet } from "@stripe/stripe-react-native";

const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();

const initializePaymentSheet = async (onSuccess: () => void): Promise<void> => {
  try {
    const response = await fetch(`${AppConstants.LOCAL_URL}/stripe/create-payment-intent`);
    const { clientSecret } = await response.json();

    const { error } = await initPaymentSheet({
      paymentIntentClientSecret: clientSecret, // Corrected placement
      merchantDisplayName: "Your Business Name",
    });

    if (error) {
      console.error("Error initializing PaymentSheet:", error);
      Alert.alert("Payment Error", "Failed to initialize payment.");
      return;
    }

    const { error: presentError } = await presentPaymentSheet();
    if (presentError) {
      console.error("Error presenting PaymentSheet:", presentError);
      Alert.alert("Payment Error", "Payment was not completed.");
      return;
    }

    onSuccess();
  } catch (error) {
    console.error("Payment initialization failed:", error);
    Alert.alert("Payment Error", "An unexpected error occurred.");
  }
};

interface Driver {
  _id: string;
  name: string;
  profileimg: string;
  license: string;
  phNo: string;
  age: number;
  experience: number;
  cnic: string;
}

interface Comment {
  _id: string;
  userId: {
    _id: string;
    username: string;
    profilePic: string;
  };
  message: string;
  rating: number;
  timestamp: Date;
}

// DriverCard Component
const DriverCard = ({ driver, isSelected, onSelect }: { driver: Driver; isSelected: boolean; onSelect: (id: string) => void }) => {
  return (
    <TouchableOpacity
      style={[styles.driverCard, isSelected && styles.selectedDriverCard]}
      onPress={() => onSelect(driver._id)}
    >
      <Image source={{ uri: driver.profileimg }} style={styles.driverImage} />
      <Text style={styles.driverName}>{driver.name}</Text>
      <Text style={styles.driverDetails}>Age: {driver.age}</Text>
      <Text style={styles.driverDetails}>Experience: {driver.experience} years</Text>
    </TouchableOpacity>
  );
};

// CommentCard Component
const CommentCard = ({ comment }: { comment: Comment }) => {
  const stars = Array.from({ length: 5 }, (_, index) => (
    <Ionicons
      key={index}
      name={index < comment.rating ? "star" : "star-outline"}
      size={16}
      color={index < comment.rating ? "#FFD700" : "#ADD8E6"}
    />
  ));

  return (
    <View style={styles.commentCard}>
      <Image
        source={{ uri: comment.userId?.profilePic || "https://via.placeholder.com/50" }}
        style={styles.commentUserImage}
      />
      <View style={styles.commentContent}>
        <Text style={styles.commentUsername}>{comment.userId?.username || "Anonymous"}</Text>
        <View style={styles.commentRating}>{stars}</View>
        <Text style={styles.commentMessage}>{comment.message}</Text>
        <Text style={styles.commentTimestamp}>
          {new Date(comment.timestamp).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
};
interface PaymentFormProps {
  amount: number;
  onSuccess: () => void;
}

// PaymentForm Component
const PaymentForm: React.FC<PaymentFormProps> = ({ amount, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Here you would implement your payment gateway integration
      // For example, redirect to a payment URL or use a native payment SDK
      
      // Simulate payment success
      await new Promise(resolve => setTimeout(resolve, 1500));
      onSuccess();
    } catch (error) {
      Alert.alert("Payment Failed", "An error occurred while processing your payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.paymentModal}>
      <Text style={styles.paymentAmount}>Amount: Rs.{amount}</Text>
      <TouchableOpacity 
        style={styles.payButton} 
        onPress={handlePayment} 
        disabled={loading}
      >
        <Text style={styles.payButtonText}>
          {loading ? "Processing..." : "Confirm Payment"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const BookNowScreen = () => {
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const car = useMemo(() => params.car ? JSON.parse(params.car as string) : null, [params.car]);
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [fromTime, setFromTime] = useState(new Date());
  const [toTime, setToTime] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [showToTimePicker, setShowToTimePicker] = useState(false);
  const [intercity, setIntercity] = useState(false);
  const [cityName, setCityName] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const carImages = Array.isArray(car?.carImageUrls) ? car.carImageUrls : [];

  useEffect(() => {
    if (!car?.company?._id) return;
    console.log("Car Images:", car?.carImageUrls);

// Ensure `carImageUrls` is an array

    const fetchDrivers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${AppConstants.LOCAL_URL}/drivers/company?company=${car.company._id}`);
        const result = await response.json();

        if (response.ok) {
          setDrivers(result.drivers || []);
        } else {
          setError("Failed to fetch drivers.");
        }
      } catch (error) {
        setError("Error fetching drivers. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await fetch(`${AppConstants.LOCAL_URL}/comment/${car._id}`);
        const result = await response.json();
        if (response.ok) {
          setComments(result || []);
        } else {
          console.error("Failed to fetch comments:", result.error);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchDrivers();
    fetchComments();
  }, [car?.company?._id, car?._id]);
  const handleFromTimeChange = (event: any, selectedTime?: Date) => {
    setShowFromTimePicker(false);
    if (selectedTime) {
      setFromTime(selectedTime);
    }
  };

  const handleToTimeChange = (event: any, selectedTime?: Date) => {
    setShowToTimePicker(false);
    if (selectedTime) {
      setToTime(selectedTime);
    }
  };

  const handleFromDateChange = (event: any, selectedDate?: Date) => {
    setShowFromPicker(false);
    if (selectedDate) {
      setFromDate(selectedDate);
    }
  };

  const handleToDateChange = (event: any, selectedDate?: Date) => {
    setShowToPicker(false);
    if (selectedDate) {
      setToDate(selectedDate);
    }
  };


  const handleConfirmBooking = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (!car) {
        Alert.alert("Error", "Car details are missing!");
        return;
      }

      const userId = await getStoredUserId();
      const formattedFromDate = formatDate(fromDate);
      const formattedToDate = formatDate(toDate);
      const formattedFromTime = formatTime(fromTime);
      const formattedToTime = formatTime(toTime);

      const bookingData = {
        idVehicle: car._id,
        user: userId,
        company: car.company._id || null,
        driver: selectedDriver || null,
        from: formattedFromDate,
        to: formattedToDate,
        intercity,
        toTime: formattedToTime,
        fromTime: formattedFromTime,
        cityName: intercity ? "" : cityName,
        status: "pending",
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Booking Confirmed!");
      } else {
        Alert.alert("Error", result.error || "Booking failed!");
      }
    } catch (error) {
      console.error("Booking Error:", error);
      Alert.alert("Error", "Failed to confirm booking. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    handleConfirmBooking();
  };

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  };

  const formatTime = (time: Date) => {
    return `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`;
  };
  const handleChatWithCompany = async () => {
    try {
      const userId = await getStoredUserId();
      const receiverId = car.company._id;
      const companyName = car.company.companyName;

      router.push({
        pathname: "/screens/chat/[chat]",
        params: {
          chat: [userId, receiverId].sort().join("_"),
          userId,
          receiverId,
          companyName: companyName,
        },
      });
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };
  const handleDriverSelect = (driverId: string) => {
    if (selectedDriver === driverId) {
      setSelectedDriver("");
    } else {
      setSelectedDriver(driverId);
    }
  };

  if (!car) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Car details not available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#FFF" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
    
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {carImages.map((url: string, index: number) => (
  <Image key={index} source={{ uri: url }} style={styles.image} />
))}

</ScrollView>

        {/* <Image soyurce={{ uri: car.carImageUrls[0] }} style={styles.image} /> */}
        <Text style={styles.carName}>{car.manufacturer} {car.model}</Text>
        <Text style={styles.carPrice}>Trips: {car.trips}</Text>
        <Text style={styles.carPrice}>Company: {car.companyName}</Text>
        <Text style={styles.carPrice}>Location: {car.company.address} {car.company.city}</Text>
        <Text style={styles.carPrice}>Contact: {car.company.phNum}</Text>

        {/* Date and Time Pickers */}
        <View style={styles.datePickerRow}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>From Date</Text>
            <TouchableOpacity onPress={() => setShowFromPicker(true)}>
              <TextInput
                style={styles.input}
                value={formatDate(fromDate)}
                editable={false}
                placeholder="Select From Date"
                placeholderTextColor="#ADD8E6"
              />
            </TouchableOpacity>
            {showFromPicker && (
              <DateTimePicker
                value={fromDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleFromDateChange}
              />
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>and Time</Text>
            <TouchableOpacity onPress={() => setShowFromTimePicker(true)}>
              <TextInput
                style={styles.input}
                value={formatTime(fromTime)}
                editable={false}
                placeholder="Select From Time"
                placeholderTextColor="#ADD8E6"
              />
            </TouchableOpacity>
            {showFromTimePicker && (
              <DateTimePicker
                value={fromTime}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleFromTimeChange}
              />
            )}
          </View>
        </View>

        <View style={styles.datePickerRow}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>To Date</Text>
            <TouchableOpacity onPress={() => setShowToPicker(true)}>
              <TextInput
                style={styles.input}
                value={formatDate(toDate)}
                editable={false}
                placeholder="Select To Date"
                placeholderTextColor="#ADD8E6"
              />
            </TouchableOpacity>
            {showToPicker && (
              <DateTimePicker
                value={toDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleToDateChange}
              />
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>and Time</Text>
            <TouchableOpacity onPress={() => setShowToTimePicker(true)}>
              <TextInput
                style={styles.input}
                value={formatTime(toTime)}
                editable={false}
                placeholder="Select To Time"
                placeholderTextColor="#ADD8E6"
              />
            </TouchableOpacity>
            {showToTimePicker && (
              <DateTimePicker
                value={toTime}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleToTimeChange}
              />
            )}
          </View>
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Intercity:</Text>
          <Switch value={intercity} onValueChange={setIntercity} />
        </View>

        {!intercity && (
          <TextInput
            style={styles.cinput}
            placeholder="City Name"
            placeholderTextColor="#ADD8E6"
            value={cityName}
            onChangeText={setCityName}
          />
        )}

        <Text style={styles.sectionTitle}>Select your Driver</Text>
        {drivers.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {drivers.map((driver) => (
              <DriverCard
                key={driver._id}
                driver={driver}
                isSelected={selectedDriver === driver._id}
                onSelect={handleDriverSelect}
              />
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.noDriversText}>No drivers available.</Text>
        )}

        <Text style={styles.sectionTitle}>Rating and reviews</Text>
        {comments.length > 0 ? (
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {comments.map((comment) => (
                <CommentCard key={comment._id} comment={comment} />
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.seeAllReviewsButton}
              onPress={() => router.push({ pathname: "/screens/CommentsPage/[vehicleId]", params: { vehicleId: car._id } })}
            >
              <Text style={styles.seeAllReviewsButtonText}>SEE ALL REVIEWS</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.noCommentsText}>No comments yet.</Text>
        )}
      </ScrollView>

      {/* Fixed Button Row at the Bottom */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={() => setShowPaymentForm(true)}
          disabled={isSubmitting}
        >
          <Ionicons name="checkmark-circle" size={24} color="#FFF" />
          <Text style={styles.confirmButtonText}>Confirm Booking: Rs.{car.rent}/day</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.chatButton} onPress={handleChatWithCompany}>
          <Ionicons name="chatbubbles" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <View style={styles.paymentModal}>
          <Elements stripe={stripePromise}>
            <PaymentForm amount={car.rent} onSuccess={handlePaymentSuccess} />
          </Elements>
        </View>
      )}
    </View>
  );
};
// Styles
const styles = StyleSheet.create({
  datePickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  paymentModal: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1A1A1A",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: "#1E5A82",
  },
  paymentAmount: {
    color: "#FFF",
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  label: {
    fontSize: 14,
    color: "#ADD8E6",
    marginBottom: 5,
  },
  commentUserImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  seeAllReviewsButton: {
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
    alignItems: "flex-end",
  },
  seeAllReviewsButtonText: {
    color: "#FFF",
    fontSize: 14,
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 5,
  },
  commentUserIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#003366",
  },
  
  input: {
    width: "100%",
    padding: 10,
    backgroundColor: "#1A1A1A",
    color: "#FFF",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#1E5A82",
  },
  container: {
    flex: 1,
    backgroundColor: "#003366",
    padding: 10,
  },
  backButton: {
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
  carName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
  },
  carPrice: {
    fontSize: 18,
    color: "#ADD8E6",
    marginVertical: 5,
  },
  datePickerContainer: {
    flex: 1,
  },
  paymentForm: {
    padding: 20,
    backgroundColor: "#1A1A1A",
    borderRadius: 10,
    marginVertical: 10,
  },
  cardElement: {
    marginBottom: 20,
  },
  payButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  payButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E5A82',
    padding: 10,
    borderRadius: 5,
  },
  datePickerText: {
    color: '#FFF',
    marginLeft: 10,
  },
  hyphenSeparator: {
    color: '#FFF',
    fontSize: 20,
    marginHorizontal: 10,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 10,
  },
  
  cinput: {
    width: "100%",
    padding: 15,
    marginVertical: 5,
    backgroundColor: "#1A1A1A",
    color: "#FFF",
    borderRadius: 5,
  },
  noDriversText: {
    fontSize: 16,
    color: "red",
    marginTop: 10,
    textAlign: "center",
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 16,
    color: "#ADD8E6",
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
  driverCard: {
    width: 150,
    padding: 10,
    margin: 5,
    backgroundColor: "#1A1A1A",
    borderRadius: 10,
    marginBottom: 10,
    marginTop: 10,
    alignItems: "center",
  },
  selectedDriverCard: {
    borderColor: "#ADD8E6",
    borderWidth: 2,
    marginBottom: 10,
    marginTop: 10,
  },
  driverImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  driverName: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "bold",
  },
  driverDetails: {
    fontSize: 14,
    color: "#ADD8E6",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 20,
    marginBottom: 10,
  },
  commentCard: {
    width: 200, // Fixed width for horizontal scrolling
    marginRight: 10, // Add margin between cards
    backgroundColor: "#1A1A1A",
    padding: 10,
    borderRadius: 10,
  },
  commentContent: {
    flex: 1,
  },
  userInfoContent: {
    flex: 1, // Take up remaining space
  },
  commentUsername: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "bold",
  },
  commentRating: {
    flexDirection: "row",
    marginVertical: 5,
  },
  commentMessage: {
    fontSize: 14,
    color: "#ADD8E6",
  },
  commentTimestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  noCommentsText: {
    fontSize: 16,
    color: "#ADD8E6",
    textAlign: "center",
    marginTop: 10,
  },
  buttonRow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    backgroundColor: "#003366", // Match the page background color
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#1E5A82", // Optional: add a border for separation
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
  },
  confirmButtonText: {
    color: "#FFF",
    fontSize: 16,
    marginLeft: 10,
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
  },
  chatButtonText: {
    color: "#FFF",
    fontSize: 16,
    marginLeft: 10,
  },
});
export  default BookNowScreen;