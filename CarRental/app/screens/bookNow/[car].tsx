import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View, Text, Image, StyleSheet, Platform, ScrollView, Alert, TextInput, Switch, TouchableOpacity
} from "react-native";
import { StripeProvider } from '@stripe/stripe-react-native';
import { useLocalSearchParams, useNavigation, router } from "expo-router";
import { AppConstants } from "@/constants/appConstants";
import { getStoredUserId } from "@/utils/storageUtil";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator } from 'react-native';
import { useStripe, usePaymentSheet } from '@stripe/stripe-react-native';

const API_URL = `${AppConstants.LOCAL_URL}/bookings/postBooking`;
const STRIPE_PUBLIC_KEY = "pk_test_51RCixfPOwJcw4TunDpaIvFjYc3FWO69gD7ivHSBQKgR4vPWWzhIy0oqfvnilYSe3dlkdwQCvGMUvikRPAWw1BKYX00NnJmVGqW";

const formatDate = (date: Date) => {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
};

const formatTime = (time: Date) => {
  return `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`;
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
  baseDailyRate: number;
  baseHourlyRate: number;
  availability?: {
    days: string[];
    startTime: string;
    endTime: string;
  };
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

const CustomImage = ({ uri, style }: { uri: string; style: any }) => {
  const [error, setError] = useState(false);
  
  if (error) {
    return (
      <View style={[style, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A1A' }]}>
        <Ionicons name="car-sport" size={50} color="#ADD8E6" />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      onError={() => setError(true)}
      resizeMode="cover"
    />
  );
};

const DriverCard = ({ driver, isSelected, onSelect }: { driver: Driver; isSelected: boolean; onSelect: (id: string) => void }) => {
  return (
    <TouchableOpacity
      style={[styles.driverCard, isSelected && styles.selectedDriverCard]}
      onPress={() => onSelect(driver._id)}
    >
      <View style={styles.driverImageContainer}>
      <Image source={{ uri: driver.profileimg }} style={styles.driverImage} />
        <View style={styles.driverRating}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>4.5</Text>
        </View>
      </View>
      <View style={styles.driverInfo}>
      <Text style={styles.driverName}>{driver.name}</Text>
        <View style={styles.driverDetailsRow}>
          <Ionicons name="person" size={14} color="#ADD8E6" />
      <Text style={styles.driverDetails}>Age: {driver.age}</Text>
        </View>
        <View style={styles.driverDetailsRow}>
          <Ionicons name="time" size={14} color="#ADD8E6" />
          <Text style={styles.driverDetails}>Exp: {driver.experience} years</Text>
        </View>
        <View style={styles.driverDetailsRow}>
          <Ionicons name="call" size={14} color="#ADD8E6" />
          <Text style={styles.driverDetails}>{driver.phNo}</Text>
        </View>
      </View>
      <View style={styles.rateContainer}>
        <Text style={styles.rateLabel}>Rates:</Text>
        <View style={styles.rateRow}>
          <Ionicons name="calendar" size={14} color="#ADD8E6" />
          <Text style={styles.rateValue}>Daily: Rs.{driver.baseDailyRate}</Text>
        </View>
        <View style={styles.rateRow}>
          <Ionicons name="time" size={14} color="#ADD8E6" />
          <Text style={styles.rateValue}>Hourly: Rs.{driver.baseHourlyRate}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

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

const calculateDays = (fromDate: Date, toDate: Date): number => {
  const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays); // Return at least 1 day
};

const calculateHours = (fromDate: Date, toDate: Date, fromTime: Date, toTime: Date): number => {
  // If it's the same day, calculate hours directly
  if (fromDate.toDateString() === toDate.toDateString()) {
    const diffTime = Math.abs(toTime.getTime() - fromTime.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60));
  }

  // For different days, calculate total hours
  const startDateTime = new Date(fromDate);
  startDateTime.setHours(fromTime.getHours(), fromTime.getMinutes(), 0, 0);

  const endDateTime = new Date(toDate);
  endDateTime.setHours(toTime.getHours(), toTime.getMinutes(), 0, 0);

  const diffTime = Math.abs(endDateTime.getTime() - startDateTime.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60));
};

interface PaymentFormProps {
  vehicleAmount: number;
  driverAmount: number;
  totalAmount: number;
  onSuccess: () => void;
  car: {
    _id: string;
    manufacturer: string;
    model: string;
    rent: number;
    company: {
      _id: string;
    };
  };
  days: number;
  selectedDriver: string;
  intercity: boolean;
  cityName: string;
  fromDate: Date;
  toDate: Date;
  fromTime: Date;
  toTime: Date;
  setLastBookingId: (id: string) => void;
  drivers: Driver[];
}

const calculateDriverRates = (driver: any, fromDate: Date, toDate: Date, fromTime: Date, toTime: Date) => {
  const totalDays = calculateDays(fromDate, toDate);
  const totalHours = calculateHours(fromDate, toDate, fromTime, toTime);
  
  console.log('Driver rate calculation:', {
    totalDays,
    totalHours,
    baseDailyRate: driver.baseDailyRate,
    baseHourlyRate: driver.baseHourlyRate
  });

  // Calculate daily rate
  const dailyRate = driver.baseDailyRate * totalDays;
  
  // Calculate hourly rate
  const hourlyRate = driver.baseHourlyRate * totalHours;
  
  // Return both rates and total
  return {
    dailyRate,
    hourlyRate,
    totalDriverCost: dailyRate + hourlyRate
  };
};

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  vehicleAmount,
  driverAmount,
  totalAmount,
  onSuccess, 
  car, 
  days,
  selectedDriver,
  intercity,
  cityName,
  fromDate,
  toDate,
  fromTime,
  toTime,
  setLastBookingId,
  drivers
}) => {
  const [loading, setLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();
  const stripe = useStripe();

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      // 1. Create booking with pending status
      const bookingResponse = await fetch(`${AppConstants.LOCAL_URL}/bookings/postBooking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idVehicle: car._id,
          user: await getStoredUserId(),
          company: car.company._id || null,
          driver: selectedDriver || null,
          from: formatDate(fromDate),
          to: formatDate(toDate),
          intercity,
          toTime: formatTime(toTime),
          fromTime: formatTime(fromTime),
          cityName: intercity ? "" : cityName,
          status: "pending",
          totalAmount: totalAmount,
        }),
      });
  
      const bookingResult = await bookingResponse.json();
      
      if (!bookingResponse.ok) {
        throw new Error(bookingResult.error || "Failed to create booking");
      }
  
      const bookingId = bookingResult.booking._id;
      setLastBookingId(bookingId);

      // 2. Create payment intent
      const paymentResponse = await fetch(`${AppConstants.LOCAL_URL}/stripe/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: Math.round(totalAmount),
          currency: 'pkr'
        }),
      });
  
      if (!paymentResponse.ok) {
        throw new Error(`HTTP error! status: ${paymentResponse.status}`);
      }
      
      const { clientSecret, ephemeralKey, customer, paymentIntentId } = await paymentResponse.json();
  
      // 3. Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "Drive Fleet",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: clientSecret,
        allowsDelayedPaymentMethods: true,
      });
  
      if (initError) {
        throw initError;
      }
  
      // 4. Present payment sheet
      const { error: paymentError } = await presentPaymentSheet();
      
      if (paymentError) {
        if (paymentError.code === 'Canceled') {
          console.log('User canceled payment');
          // Delete the pending booking if payment is canceled
          await fetch(`${AppConstants.LOCAL_URL}/bookings/delete/${bookingId}`, {
            method: 'DELETE',
          });
          return;
        } else {
          throw paymentError;
        }
      } else {

        // 5. Store transaction
        const transactionResponse = await fetch(`${AppConstants.LOCAL_URL}/transaction/post`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactionId: paymentIntentId,
            bookingId: bookingId,
            amount: totalAmount,
            paymentStatus: 'completed',
            paymentMethod: 'card'
          })
        });
  
        if (!transactionResponse.ok) {
          throw new Error('Failed to store transaction');
        }

        // 6. Confirm booking after successful transaction


        
        const confirmResponse = await fetch(`${AppConstants.LOCAL_URL}/bookings/confirm/${bookingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId,
            paymentIntentId
          })
        });
  
        const confirmResult = await confirmResponse.json();
        
        if (!confirmResponse.ok) {
          throw new Error(confirmResult.error || 'Failed to confirm booking');
        }

        Alert.alert('Success', 'Payment completed and booking confirmed!');
        onSuccess();
      }
    } catch (error) {
      let errorMessage = 'Payment failed';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      console.log("Payment error:", errorMessage);
      Alert.alert('Payment Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.paymentModal}>
      <Text style={styles.paymentTitle}>Payment Details</Text>
      
      <View style={styles.amountBreakdown}>
        <Text style={styles.amountTitle}>Booking Summary</Text>
        
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Vehicle Amount:</Text>
          <Text style={styles.amountValue}>Rs.{vehicleAmount}</Text>
        </View>
        
        {selectedDriver && (
          <>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Driver Amount:</Text>
              <Text style={styles.amountValue}>Rs.{driverAmount}</Text>
            </View>
            
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Driver Daily Rate:</Text>
              <Text style={styles.amountValue}>Rs.{calculateDriverRates(drivers.find(d => d._id === selectedDriver), fromDate, toDate, fromTime, toTime).dailyRate}</Text>
            </View>
            
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Driver Hourly Rate:</Text>
              <Text style={styles.amountValue}>Rs.{calculateDriverRates(drivers.find(d => d._id === selectedDriver), fromDate, toDate, fromTime, toTime).hourlyRate}</Text>
            </View>
          </>
        )}

        <View style={styles.totalAmountRow}>
          <Text style={styles.totalAmountLabel}>Total Amount:</Text>
          <Text style={styles.totalAmountValue}>Rs.{totalAmount}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.payButton}
        onPress={handlePayment}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.payButtonText}>Pay Now</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const getDayOfWeek = (date: Date): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

const isTimeInRange = (time: string, startTime: string, endTime: string): boolean => {
  const [hours, minutes] = time.split(':').map(Number);
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);

  const timeInMinutes = hours * 60 + minutes;
  const startInMinutes = startHours * 60 + startMinutes;
  const endInMinutes = endHours * 60 + endMinutes;

  return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes;
};

const checkVehicleAvailability = (vehicle: any, fromDate: Date, toDate: Date, fromTime: string, toTime: string): boolean => {
  if (!vehicle.availability) return true; // If no availability set, assume always available

  const currentDate = new Date(fromDate);
  while (currentDate <= toDate) {
    const dayOfWeek = getDayOfWeek(currentDate);
    
    // Check if the day is in available days
    if (!vehicle.availability.days.includes(dayOfWeek)) {
      return false;
    }

    // Check if time is within available hours
    if (currentDate.getTime() === fromDate.getTime()) {
      if (!isTimeInRange(fromTime, vehicle.availability.startTime, vehicle.availability.endTime)) {
        return false;
      }
    }
    if (currentDate.getTime() === toDate.getTime()) {
      if (!isTimeInRange(toTime, vehicle.availability.startTime, vehicle.availability.endTime)) {
        return false;
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }
  return true;
};

const checkDriverAvailability = (driver: any, fromDate: Date, toDate: Date, fromTime: string, toTime: string): boolean => {
  if (!driver.availability) return true; // If no availability set, assume always available

  const currentDate = new Date(fromDate);
  while (currentDate <= toDate) {
    const dayOfWeek = getDayOfWeek(currentDate);
    
    // Check if the day is in available days
    if (!driver.availability.days.includes(dayOfWeek)) {
      return false;
    }

    // Check if time is within available hours
    if (currentDate.getTime() === fromDate.getTime()) {
      if (!isTimeInRange(fromTime, driver.availability.startTime, driver.availability.endTime)) {
        return false;
      }
    }
    if (currentDate.getTime() === toDate.getTime()) {
      if (!isTimeInRange(toTime, driver.availability.startTime, driver.availability.endTime)) {
        return false;
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }
  return true;
};

const getAvailableDates = (availability: any) => {
  if (!availability) return [];
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const availableDays = availability.days;
  
  return days.filter(day => availableDays.includes(day));
};

const isDateAvailable = (date: Date, availability: any) => {
  if (!availability) return true;
  
  const dayOfWeek = getDayOfWeek(date);
  return availability.days.includes(dayOfWeek);
};

const getAvailableDrivers = (drivers: Driver[], fromDate: Date, toDate: Date, fromTime: string, toTime: string) => {
  console.log("Checking driver availability with params:", {
    driversCount: drivers.length,
    fromDate: fromDate.toISOString(),
    toDate: toDate.toISOString(),
    fromTime,
    toTime
  });

  return drivers.filter(driver => {
    console.log("Checking driver:", driver._id);
    if (!driver.availability) {
      console.log("Driver has no availability set:", driver._id);
      return true;
    }
    
    const currentDate = new Date(fromDate);
    while (currentDate <= toDate) {
      if (!isDateAvailable(currentDate, driver.availability)) {
        console.log("Driver not available on date:", {
          driverId: driver._id,
          date: currentDate.toISOString()
        });
        return false;
      }
      
      // Check time availability for start and end dates
      if (currentDate.getTime() === fromDate.getTime()) {
        if (!isTimeInRange(fromTime, driver.availability.startTime, driver.availability.endTime)) {
          console.log("Driver not available at start time:", {
            driverId: driver._id,
            fromTime,
            availableStart: driver.availability.startTime,
            availableEnd: driver.availability.endTime
          });
          return false;
        }
      }
      if (currentDate.getTime() === toDate.getTime()) {
        if (!isTimeInRange(toTime, driver.availability.startTime, driver.availability.endTime)) {
          console.log("Driver not available at end time:", {
            driverId: driver._id,
            toTime,
            availableStart: driver.availability.startTime,
            availableEnd: driver.availability.endTime
          });
          return false;
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    console.log("Driver is available:", driver._id);
    return true;
  });
};

const isDateBlackedOut = (date: Date, blackoutDates: Date[]): boolean => {
  if (!blackoutDates || blackoutDates.length === 0) return false;
  
  const dateString = date.toISOString().split('T')[0];
  return blackoutDates.some(blackoutDate => 
    blackoutDate.toISOString().split('T')[0] === dateString
  );
};

const checkAllDaysAvailable = (fromDate: Date, toDate: Date, availableDays: string[]): boolean => {
  const currentDate = new Date(fromDate);
  while (currentDate <= toDate) {
    const dayOfWeek = getDayOfWeek(currentDate);
    if (!availableDays.includes(dayOfWeek)) {
      return false;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return true;
};

const BookNowScreen = () => {
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const car = useMemo(() => params.car ? JSON.parse(params.car as string) : null, [params.car]);
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  
  // Initialize dates with current date and time
  const now = new Date();
  const [fromDate, setFromDate] = useState(now);
  const [toDate, setToDate] = useState(now);
  const [fromTime, setFromTime] = useState(now);
  const [toTime, setToTime] = useState(now);
  
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
  const [lastBookingId, setLastBookingId] = useState<string | null>(null);
  const carImages = Array.isArray(car?.carImageUrls) ? car.carImageUrls : [];
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [vehicleAmount, setVehicleAmount] = useState(0);
  const [driverAmount, setDriverAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const calculateDaysDifference = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  };

  const days = calculateDaysDifference(fromDate, toDate);

  useEffect(() => {
    if (!car?.company?._id) {
      console.log("No company ID found in car data:", car);
      return;
    }

    const fetchDrivers = async () => {
      console.log("Starting to fetch drivers for company:", car.company._id);
      setLoading(true);
      setError(null);

      try {
        console.log("Making API call to:", `${AppConstants.LOCAL_URL}/drivers/company?company=${car.company._id}`);
        const response = await fetch(`${AppConstants.LOCAL_URL}/drivers/company?company=${car.company._id}`);
        console.log("Drivers API response status:", response.status);
        
        const result = await response.json();
        console.log("Raw drivers response:", result);

        if (response.ok) {
          if (result.data && Array.isArray(result.data)) {
            console.log("Setting drivers:", result.data);
            setDrivers(result.data);
          } else {
            console.log("No drivers found in response data");
            setDrivers([]);
          }
        } else {
          console.error("Failed to fetch drivers:", result.error);
          setError("Failed to fetch drivers.");
        }
      } catch (error) {
        console.error("Error in fetchDrivers:", error);
        setError("Error fetching drivers. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        console.log('Fetching comments for vehicle:', car._id);
        const response = await fetch(`${AppConstants.LOCAL_URL}/comment/${car._id}`);
        console.log('Comments API response status:', response.status);
        
        const result = await response.json();
        console.log('Raw comments response:', result);
        
        if (response.ok) {
          console.log('Setting comments:', result || []);
          setComments(result || []);
        } else {
          // console.error('Failed to fetch comments:', result.error);
        }
      } catch (error) {
        // console.error('Error in fetchComments:', error);
      }
    };

    fetchDrivers();
    fetchComments();
  }, [car?.company?._id, car?._id]);

  useEffect(() => {
    console.log("Drivers state updated:", drivers);
    if (drivers.length > 0) {
      console.log("Filtering available drivers with dates:", {
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
        fromTime: formatTime(fromTime),
        toTime: formatTime(toTime)
      });
      
      const filteredDrivers = getAvailableDrivers(
        drivers,
        fromDate,
        toDate,
        formatTime(fromTime),
        formatTime(toTime)
      );
      console.log("Filtered available drivers:", filteredDrivers);
      setAvailableDrivers(filteredDrivers);
    } else {
      console.log("No drivers to filter");
      setAvailableDrivers([]);
    }
  }, [drivers, fromDate, toDate, fromTime, toTime]);

  useEffect(() => {
    const days = calculateDays(fromDate, toDate);
    const hours = calculateHours(fromDate, toDate, fromTime, toTime);
    
    console.log('Calculating amounts:', {
      days,
      hours,
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString(),
      fromTime: formatTime(fromTime),
      toTime: formatTime(toTime),
      carRent: car.rent,
      selectedDriver
    });

    const newVehicleAmount = days * car.rent;
    console.log('Vehicle amount:', newVehicleAmount);
    setVehicleAmount(newVehicleAmount);
    
    let newDriverAmount = 0;
    if (selectedDriver) {
      const driver = drivers.find(d => d._id === selectedDriver);
      if (driver) {
        const driverCosts = calculateDriverRates(
          driver,
          fromDate,
          toDate,
          fromTime,
          toTime
        );
        console.log('Driver costs:', driverCosts);
        newDriverAmount = driverCosts.totalDriverCost;
      }
    }
    console.log('Driver amount:', newDriverAmount);
    setDriverAmount(newDriverAmount);

    const newTotalAmount = newVehicleAmount + newDriverAmount;
    console.log('Total amount:', newTotalAmount);
    setTotalAmount(newTotalAmount);
  }, [fromDate, toDate, fromTime, toTime, selectedDriver, car.rent]);

  const handleFromDateChange = (event: any, selectedDate?: Date) => {
    setShowFromPicker(false);
    if (selectedDate) {
      // Check if date is blacked out
      if (isDateBlackedOut(selectedDate, car.blackoutDates || [])) {
        Alert.alert(
          "Date Not Available",
          "This date is blacked out. Please select a different date."
        );
        return;
      }
      
      // Check if date is in available days
      const dayOfWeek = getDayOfWeek(selectedDate);
      if (!car.availability?.days.includes(dayOfWeek)) {
        Alert.alert(
          "Date Not Available",
          `The vehicle is not available on ${dayOfWeek}. Available days: ${car.availability?.days.join(', ')}`
        );
        return;
      }
      
      setFromDate(selectedDate);
      if (toDate < selectedDate) {
        setToDate(selectedDate);
      } else {
        // Check if all days between selected date and toDate are available
        if (!checkAllDaysAvailable(selectedDate, toDate, car.availability.days)) {
          Alert.alert(
            "Invalid Date Range",
            "Some days in the selected range are not available. Please adjust your dates."
          );
          setFromDate(selectedDate);
          setToDate(selectedDate);
          return;
        }
      }
    }
  };

  const handleToDateChange = (event: any, selectedDate?: Date) => {
    setShowToPicker(false);
    if (selectedDate) {
      // Check if date is blacked out
      if (isDateBlackedOut(selectedDate, car.blackoutDates || [])) {
        Alert.alert(
          "Date Not Available",
          "This date is blacked out. Please select a different date."
        );
        return;
      }
      
      // Check if date is in available days
      const dayOfWeek = getDayOfWeek(selectedDate);
      if (!car.availability?.days.includes(dayOfWeek)) {
        Alert.alert(
          "Date Not Available",
          `The vehicle is not available on ${dayOfWeek}. Available days: ${car.availability?.days.join(', ')}`
        );
        return;
      }
      
      // Check if all days between fromDate and selected date are available
      if (!checkAllDaysAvailable(fromDate, selectedDate, car.availability.days)) {
        Alert.alert(
          "Invalid Date Range",
          "Some days in the selected range are not available. Please adjust your dates."
        );
        return;
      }
      
      setToDate(selectedDate);
    }
  };

  const handleFromTimeChange = (event: any, selectedTime?: Date) => {
    setShowFromTimePicker(false);
    if (selectedTime) {
      const now = new Date();
      const selected = new Date(selectedTime);
      
      if (fromDate.toDateString() === now.toDateString()) {
        // If it's today's date, ensure time is not in the past
        const currentTime = new Date();
        currentTime.setHours(now.getHours(), now.getMinutes(), 0, 0);
        selected.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
        
        if (selected < currentTime) {
          Alert.alert("Invalid Time", "Please select a time after the current time.");
          return;
        }
      }

      // Check if time is within vehicle's available hours
      const formattedTime = formatTime(selectedTime);
      if (!isTimeInRange(formattedTime, car.availability.startTime, car.availability.endTime)) {
        Alert.alert(
          "Time Not Available",
          `The vehicle is only available between ${car.availability.startTime} and ${car.availability.endTime}.`
        );
        return;
      }
      
      setFromTime(selectedTime);
      
      // If the toTime is before the new fromTime and it's the same day, update it
      if (toDate.toDateString() === fromDate.toDateString()) {
        const fromTimeInMinutes = selectedTime.getHours() * 60 + selectedTime.getMinutes();
        const toTimeInMinutes = toTime.getHours() * 60 + toTime.getMinutes();
        const timeDifference = toTimeInMinutes - fromTimeInMinutes;
        
        if (timeDifference < 30) {
          // Add 30 minutes to the selected time for the end time
          const newToTime = new Date(selectedTime);
          newToTime.setMinutes(newToTime.getMinutes() + 30);
          setToTime(newToTime);
        }
      }
    }
  };

  const handleToTimeChange = (event: any, selectedTime?: Date) => {
    setShowToTimePicker(false);
    if (selectedTime) {
      const now = new Date();
      const selected = new Date(selectedTime);
      
      if (toDate.toDateString() === now.toDateString()) {
        // If it's today's date, ensure time is not in the past
        const currentTime = new Date();
        currentTime.setHours(now.getHours(), now.getMinutes(), 0, 0);
        selected.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
        
        if (selected < currentTime) {
          Alert.alert("Invalid Time", "Please select a time after the current time.");
          return;
        }
      }
      
      // Check if time is within vehicle's available hours
      const formattedTime = formatTime(selectedTime);
      if (!isTimeInRange(formattedTime, car.availability.startTime, car.availability.endTime)) {
        Alert.alert(
          "Time Not Available",
          `The vehicle is only available between ${car.availability.startTime} and ${car.availability.endTime}.`
        );
        return;
      }
      
      // If it's the same day as fromDate, ensure time is at least 30 minutes after fromTime
      if (toDate.toDateString() === fromDate.toDateString()) {
        const fromTimeInMinutes = fromTime.getHours() * 60 + fromTime.getMinutes();
        const toTimeInMinutes = selectedTime.getHours() * 60 + selectedTime.getMinutes();
        const timeDifference = toTimeInMinutes - fromTimeInMinutes;
        
        if (timeDifference < 30) {
          Alert.alert(
            "Invalid Time",
            "End time must be at least 30 minutes after start time for same-day bookings."
          );
          return;
        }
      }
      
      setToTime(selectedTime);
    }
  };

  const validateDates = () => {
    const now = new Date();
    const from = new Date(fromDate);
    from.setHours(fromTime.getHours(), fromTime.getMinutes(), 0, 0);
    const to = new Date(toDate);
    to.setHours(toTime.getHours(), toTime.getMinutes(), 0, 0);
    
    // Check if start date is today or in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(fromDate);
    startDate.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
      Alert.alert("Error", "Start date must be today or a future date");
      return false;
    }
    
    if (to < from) {
      Alert.alert("Error", "End date and time must be after start date and time");
      return false;
    }
    
    return true;
  };

  const handleConfirmBooking = async () => {
    try {
      // Check if all days in the booking period are available
      if (!checkAllDaysAvailable(fromDate, toDate, car.availability.days)) {
        Alert.alert(
          "Invalid Booking Period",
          "Some days in the selected period are not available. Please adjust your dates."
        );
        return;
      }

      // Check if dates are the same and time gap is less than 30 minutes
      if (fromDate.toDateString() === toDate.toDateString()) {
        const fromTimeInMinutes = fromTime.getHours() * 60 + fromTime.getMinutes();
        const toTimeInMinutes = toTime.getHours() * 60 + toTime.getMinutes();
        const timeDifference = toTimeInMinutes - fromTimeInMinutes;
        
        if (timeDifference < 30) {
          Alert.alert(
            "Invalid Time Selection",
            "For same-day bookings, the time difference must be at least 30 minutes."
          );
          return;
        }
      }

      // Check vehicle availability
      if (!checkVehicleAvailability(car, fromDate, toDate, formatTime(fromTime), formatTime(toTime))) {
        Alert.alert(
          "Vehicle Not Available",
          "The vehicle is not available for the selected dates and times. Please check the vehicle's availability schedule."
        );
        return;
      }

      // If driver is selected, check driver availability
      if (selectedDriver) {
        const driver = drivers.find(d => d._id === selectedDriver);
        if (driver && !checkDriverAvailability(driver, fromDate, toDate, formatTime(fromTime), formatTime(toTime))) {
          Alert.alert(
            "Driver Not Available",
            "The selected driver is not available for the chosen dates and times. Please select a different driver or time."
          );
          return;
        }
      }

      // Proceed with booking if both vehicle and driver are available
      if (validateDates()) {
        setShowPaymentForm(true);
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      Alert.alert("Error", "There was an error checking availability. Please try again.");
    }
  };
  
  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    // Navigate back or show success message
    Alert.alert(
      "Booking Confirmed",
      "Your booking has been confirmed successfully!",
      [
        {
          text: "OK",
          onPress: () => navigation.goBack()
        }
      ]
    );
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
      console.log("Navigation error:", error);
    }
  };

  const handleDriverSelect = (driverId: string) => {
    console.log('Driver selection changed:', {
      previousDriver: selectedDriver,
      newDriver: driverId,
      isSelected: selectedDriver === driverId
    });
    
    if (selectedDriver === driverId) {
      setSelectedDriver("");
      console.log('Driver deselected');
    } else {
      setSelectedDriver(driverId);
      console.log('Driver selected:', driverId);
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
      <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#FFF" />
      </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Now</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.carImageSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
          {carImages.length > 0 ? (
            carImages.map((url: string, index: number) => (
              <CustomImage key={index} uri={url} style={styles.image} />
            ))
          ) : (
            <Image 
              source={require('../../../assets/images/signup.png')} 
              style={styles.image}
              resizeMode="cover"
            />
          )}
        </ScrollView>
        </View>

        <View style={styles.carInfoSection}>
        <Text style={styles.carName}>{car.manufacturer} {car.model}</Text>
          <View style={styles.carDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="car" size={16} color="#ADD8E6" />
              <Text style={styles.carDetailText}>Trips: {car.trips}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="business" size={16} color="#ADD8E6" />
              <Text style={styles.carDetailText}>{car.company?.companyName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="location" size={16} color="#ADD8E6" />
              <Text style={styles.carDetailText}>{car.company?.address} {car.company?.city}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="call" size={16} color="#ADD8E6" />
              <Text style={styles.carDetailText}>{car.company?.phNum}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={16} color="#ADD8E6" />
              <Text style={styles.carDetailText}>Available Days: {car.availability?.days.join(', ')}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time" size={16} color="#ADD8E6" />
              <Text style={styles.carDetailText}>Available Times: {car.availability?.startTime} - {car.availability?.endTime}</Text>
            </View>
            {car.blackoutDates && car.blackoutDates.length > 0 && (
              <View style={styles.detailRow}>
                <Ionicons name="alert-circle" size={16} color="#FF6B6B" />
                <Text style={styles.blackoutText}>
                  Blackout Dates: {car.blackoutDates.map((date: string | Date) => 
                    new Date(date).toLocaleDateString()
                  ).join(', ')}
                </Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Ionicons name="cash" size={16} color="#ADD8E6" />
              <Text style={styles.carDetailText}>Rent: Rs.{car.rent}/day</Text>
            </View>
          </View>
        </View>

        <View style={styles.bookingSection}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
        <View style={styles.datePickerRow}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>From Date</Text>
              <TouchableOpacity style={styles.dateInput} onPress={() => setShowFromPicker(true)}>
                <Text style={styles.dateText}>{formatDate(fromDate)}</Text>
                <Ionicons name="calendar" size={20} color="#ADD8E6" />
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
              <TouchableOpacity style={styles.dateInput} onPress={() => setShowFromTimePicker(true)}>
                <Text style={styles.dateText}>{formatTime(fromTime)}</Text>
                <Ionicons name="time" size={20} color="#ADD8E6" />
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
              <TouchableOpacity style={styles.dateInput} onPress={() => setShowToPicker(true)}>
                <Text style={styles.dateText}>{formatDate(toDate)}</Text>
                <Ionicons name="calendar" size={20} color="#ADD8E6" />
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
              <TouchableOpacity style={styles.dateInput} onPress={() => setShowToTimePicker(true)}>
                <Text style={styles.dateText}>{formatTime(toTime)}</Text>
                <Ionicons name="time" size={20} color="#ADD8E6" />
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

          <View style={styles.intercitySection}>
        <View style={styles.switchContainer}>
              <Text style={styles.label}>Intercity Booking</Text>
              <Switch 
                value={intercity} 
                onValueChange={setIntercity}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={intercity ? '#ADD8E6' : '#f4f3f4'}
              />
        </View>
        {!intercity && (
          <TextInput
                style={styles.cityInput}
                placeholder="Enter City Name"
            placeholderTextColor="#ADD8E6"
            value={cityName}
            onChangeText={setCityName}
          />
        )}
          </View>
        </View>

        <View style={styles.driverSection}>
          <Text style={styles.sectionTitle}>Select Driver</Text>
          <Text style={styles.availabilityText}>
            Available Days: {getAvailableDates(car.availability).join(', ')}
          </Text>
          {availableDrivers.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {availableDrivers.map((driver) => (
              <DriverCard
                key={driver._id}
                driver={driver}
                isSelected={selectedDriver === driver._id}
                onSelect={handleDriverSelect}
              />
            ))}
          </ScrollView>
        ) : (
            <Text style={styles.noDriversText}>No drivers available for the selected dates.</Text>
        )}
        </View>

        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Reviews</Text>
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
            <Text style={styles.noCommentsText}>No reviews yet.</Text>
        )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmBooking}
          disabled={isSubmitting}
        >
          <Ionicons name="checkmark-circle" size={24} color="#FFF" />
          <Text style={styles.confirmButtonText}>
            Confirm Booking: Rs.{totalAmount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.chatButton} onPress={handleChatWithCompany}>
          <Ionicons name="chatbubbles" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {showPaymentForm && (
        <View style={styles.paymentModalOverlay}>
          <View style={styles.paymentModalContainer}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowPaymentForm(false)}
            >
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
            
            <PaymentForm 
              vehicleAmount={vehicleAmount}
              driverAmount={driverAmount}
              totalAmount={totalAmount}
  onSuccess={handlePaymentSuccess}
  car={{
    _id: car._id,
    manufacturer: car.manufacturer,
    model: car.model,
    rent: car.rent,
    company: car.company
  }}
  days={days}
  selectedDriver={selectedDriver}
  intercity={intercity}
  cityName={cityName}
  fromDate={fromDate}
  toDate={toDate}
  fromTime={fromTime}
  toTime={toTime}
              setLastBookingId={setLastBookingId}
              drivers={drivers}
/>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003366",
  },
  header: {
    marginTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1E5A82',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 15,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  carImageSection: {
    marginBottom: 20,
  },
  imageScrollView: {
    marginTop: 10,
  },
  image: {
    width: 300,
    height: 200,
    borderRadius: 12,
    marginHorizontal: 10,
  },
  carInfoSection: {
    padding: 15,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginHorizontal: 10,
    marginBottom: 20,
  },
  carName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 15,
  },
  carDetails: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  carDetailText: {
    fontSize: 14,
    color: "#ADD8E6",
  },
  bookingSection: {
    padding: 15,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginHorizontal: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 15,
  },
  datePickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
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
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: "#1E5A82",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ADD8E6",
  },
  dateText: {
    color: "#FFF",
    fontSize: 14,
  },
  intercitySection: {
    marginTop: 15,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cityInput: {
    backgroundColor: "#1E5A82",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ADD8E6",
    color: "#FFF",
  },
  driverSection: {
    padding: 15,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginHorizontal: 10,
    marginBottom: 20,
  },
  reviewsSection: {
    padding: 15,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginHorizontal: 10,
    marginBottom: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderTopColor: '#1E5A82',
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginRight: 10,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  chatButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    width: 50,
    alignItems: 'center',
  },
  paymentModal: {
    width: '100%',
    padding: 20,
  },
  payButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  payButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: '#1E5A82',
    marginVertical: 10,
  },
  availabilityText: {
    color: '#ADD8E6',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  amountBreakdown: {
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 10,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#1E5A82',
  },
  amountTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  amountLabel: {
    color: '#ADD8E6',
    fontSize: 16,
  },
  amountValue: {
    color: '#FFF',
    fontSize: 16,
  },
  totalAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1E5A82',
  },
  totalAmountLabel: {
    color: '#ADD8E6',
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmountValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  paymentModalContainer: {
    backgroundColor: '#1A1A1A',
    width: '90%',
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E5A82',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  paymentTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    marginRight: 10,
  },
  
  noDriversText: {
    fontSize: 16,
    color: "red",
    marginTop: 10,
    textAlign: "center",
    marginBottom: 10,
  },
  commentCard: {
    width: 200,
    marginRight: 10,
    backgroundColor: "#1A1A1A",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1E5A82",
  },
  commentUserImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
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
  driverCard: {
    margin: 10,
    backgroundColor: "#1A1A1A",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E5A82",
    width: 280,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedDriverCard: {
    borderColor: "#ADD8E6",
    borderWidth: 2,
    backgroundColor: "#1E5A82",
  },
  driverImageContainer: {
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  driverImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#ADD8E6",
  },
  driverRating: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#FFD700',
    marginLeft: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  driverInfo: {
    marginBottom: 10,
  },
  driverName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 8,
  },
  driverDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  driverDetails: {
    fontSize: 14,
    color: "#ADD8E6",
    marginLeft: 8,
  },
  rateContainer: {
    backgroundColor: '#1E5A82',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  rateLabel: {
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  rateValue: {
    color: '#ADD8E6',
    fontSize: 12,
    marginLeft: 8,
  },
  blackoutText: {
    fontSize: 14,
    color: "#FF6B6B",
    marginLeft: 8,
  },
});

const BookNowScreenWithStripe = () => (
  <StripeProvider
    publishableKey={STRIPE_PUBLIC_KEY}
    urlScheme="your-app-scheme"
    merchantIdentifier="merchant.com.your-app"
  >
    <BookNowScreen />
  </StripeProvider>
);

export default BookNowScreenWithStripe;