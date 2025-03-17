import React, { useState, useEffect, useMemo } from "react";
import {
  View, Text, Image, StyleSheet, Button, Platform, ScrollView, Alert, TextInput, Switch, TouchableOpacity
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { AppConstants } from "@/constants/appConstants";
import { getStoredUserId } from "@/utils/storageUtil";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useNotifications } from "@/utils/useNotification"; // Import the hook

const API_URL = `${AppConstants.LOCAL_URL}/bookings/postBooking`;

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

const BookNowScreen = () => {
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const car = useMemo(() => params.car ? JSON.parse(params.car as string) : null, [params.car]);
  console.log(car);

  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [intercity, setIntercity] = useState(false);
  const [cityName, setCityName] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use the notification hook
  const { requestNotificationPermissions, scheduleNotification } = useNotifications();

  useEffect(() => {
    let isMounted = true;
    if (!car?.company._id) return;
    console.log("Car company", car.company._id);
    console.log("Car image Url", car.carImageUrl);

    const fetchDrivers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${AppConstants.LOCAL_URL}/drivers/company?company=${car.company._id}`);
        const result = await response.json();

        if (response.ok && isMounted) {
          setDrivers(result.drivers || []);
          console.log('dsa', drivers);
        } else if (isMounted) {
          setError("Failed to fetch drivers.");
        }
      } catch (error) {
        if (isMounted) {
          setError("Error fetching drivers. Please try again.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDrivers();
    return () => { isMounted = false; };
  }, [car?.company]);

  // Request notification permissions on mount
  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  const handleFromDateChange = (event: any, selectedDate?: Date) => {
    setShowFromPicker(false);
    if (selectedDate) {
      const localDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      );
      console.log(localDate);
      setFromDate(localDate);
    }
  };

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  };

  const handleToDateChange = (event: any, selectedDate?: Date) => {
    setShowToPicker(false);
    if (selectedDate) {
      const localDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      );
      console.log(localDate);
      setToDate(localDate);
    }
  };

  const handleDriverSelect = (driverId: string) => {
    if (selectedDriver === driverId) {
      // Deselect the driver if already selected
      setSelectedDriver("");
    } else {
      // Select the new driver
      setSelectedDriver(driverId);
    }
  };

  const handleConfirmBooking = async () => {
    if (!car) {
      Alert.alert("Error", "Car details are missing!");
      return;
    }

    const userId = await getStoredUserId();
    const formattedFromDate = formatDate(fromDate);
    const formattedToDate = formatDate(toDate);
    console.log(formattedFromDate);

    const bookingData = {
      idVehicle: car._id,
      user: userId,
      company: car.company._id || null,
      driver: selectedDriver || null,
      from: formattedFromDate,
      to: formattedToDate,
      intercity,
      cityName: intercity ? "" : cityName,
      status: "pending",
    };

    console.log("Sending Booking Data:", bookingData);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();
      console.log("Booking Response:", result);

      if (response.ok) {
        // Schedule a notification for successful booking
        await scheduleNotification("Booking Confirmed", "Your booking has been confirmed.", 1);
        Alert.alert("Success", "Booking Confirmed!");
      } else {
        Alert.alert("Error", result.error || "Booking failed!");
      }
    } catch (error) {
      console.error("Booking Error:", error);
      Alert.alert("Error", "Failed to confirm booking. Try again.");
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
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#FFF" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Image source={{ uri: car.carImageUrl }} style={styles.image} />
        <Text style={styles.carName}>{car.manufacturer} {car.model}</Text>
        <Text style={styles.carPrice}>${car.rent}/day</Text>

        {/* Date Pickers */}
        <Button title="Select From Date" onPress={() => setShowFromPicker(true)} />
        {showFromPicker && (
          <DateTimePicker
            value={fromDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleFromDateChange}
          />
        )}
        <TextInput style={styles.input} value={formatDate(fromDate)} editable={false} />

        <Button title="Select To Date" onPress={() => setShowToPicker(true)} />
        {showToPicker && (
          <DateTimePicker
            value={toDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleToDateChange}
          />
        )}
        <TextInput style={styles.input} value={formatDate(toDate)} editable={false} />

        {/* Intercity Switch */}
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Intercity:</Text>
          <Switch value={intercity} onValueChange={setIntercity} />
        </View>

        {!intercity && (
          <TextInput style={styles.input} placeholder="City Name" placeholderTextColor="#ADD8E6" value={cityName} onChangeText={setCityName} />
        )}

        {loading ? <Text style={styles.loadingText}>Fetching drivers...</Text> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Driver Selection */}
        {drivers.length > 0 ? (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {drivers.map((driver) => (
                <DriverCard
                  key={driver._id}
                  driver={driver}
                  isSelected={selectedDriver === driver._id}
                  onSelect={handleDriverSelect} // Use the updated function
                />
              ))}
            </ScrollView>
            {selectedDriver && (
              <Text style={styles.selectedText}>Selected Driver: {drivers.find(d => d._id === selectedDriver)?.name}</Text>
            )}
          </>
        ) : (
          <Text style={styles.noDriversText}>No drivers available.</Text>
        )}

        <Button title="Confirm Booking" onPress={handleConfirmBooking} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#003366",
    padding: 20,
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
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
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    color: "#ADD8E6",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    padding: 10,
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
  selectedText: {
    fontSize: 16,
    color: "#ADD8E6",
    marginTop: 10,
    marginBottom: 10,
  },
});

export default BookNowScreen;