import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import RentalAppLayout from "@/app/screens/rentalAppLayout";
import { AppConstants } from "@/constants/appConstants";
import { loadCompanyId } from "@/utils/storageUtil";

type Vehicle = {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
};

const formatDisplayDate = (dateString: string): string => {
  if (!dateString) return "N/A";
  
  // Try ISO format first (like createdAt/updatedAt)
  const isoDate = new Date(dateString);
  if (!isNaN(isoDate.getTime())) {
    return isoDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Handle custom format (like "1532das")
  if (dateString.length >= 8) {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    
    // Validate numeric values
    if (!isNaN(Number(year)) && !isNaN(Number(month)) && !isNaN(Number(day))) {
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    }
  }

  // Fallback to raw value if can't parse
  return dateString;
};

const calculateDays = (fromDate: string, toDate: string): number => {
  // Handle exact same date case immediately
  if (fromDate === toDate) {
    return 1; // Same day rental
  }

  // Try to parse dates
  let startDate, endDate;
  
  // Try ISO format first
  startDate = new Date(fromDate);
  endDate = new Date(toDate);
  
  // If the dates aren't valid, try to extract numeric part from the beginning
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    // Extract numeric prefix from the date strings
    const fromNumericMatch = fromDate.match(/^\d+/);
    const toNumericMatch = toDate.match(/^\d+/);
    
    if (fromNumericMatch && toNumericMatch) {
      const fromNumeric = fromNumericMatch[0];
      const toNumeric = toNumericMatch[0];
      
      // If both date strings have at least 8 digits, try to parse as YYYYMMDD
      if (fromNumeric.length >= 8 && toNumeric.length >= 8) {
        const fromYear = fromNumeric.substring(0, 4);
        const fromMonth = fromNumeric.substring(4, 6);
        const fromDay = fromNumeric.substring(6, 8);
        
        const toYear = toNumeric.substring(0, 4);
        const toMonth = toNumeric.substring(4, 6);
        const toDay = toNumeric.substring(6, 8);
        
        startDate = new Date(Number(fromYear), Number(fromMonth) - 1, Number(fromDay));
        endDate = new Date(Number(toYear), Number(toMonth) - 1, Number(toDay));
      }
    }
  }
  
  // If we still don't have valid dates, return 1 as default (assume same day rental)
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.warn("Could not parse dates properly:", fromDate, toDate);
    return 1; // Default to 1 day if dates can't be parsed
  }
  
  // Calculate the difference in milliseconds
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  // Convert to days (add 1 because the rental includes both the start and end dates)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  return diffDays;
};

const RentalHomeScreen = () => {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const fetchCompanyBookings = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${AppConstants.LOCAL_URL}/bookings/companyBookings?company=${id}&status=confirmed`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          setBookings([]);
          return;
        }
        throw new Error(`Failed to load bookings (Status: ${response.status})`);
      }
      
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      Alert.alert("Error", "Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (companyId) await fetchCompanyBookings(companyId);
    setRefreshing(false);
  };

  const handleBookingPress = (booking: Booking) => {
    router.push({
      pathname: "/screens/BookingDetail/[booking]",
      params: { 
        booking: JSON.stringify(booking),
        id: booking._id 
      }
    });
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const storedCompanyId = await loadCompanyId();
        if (!storedCompanyId) {
          throw new Error("Company ID not found");
        }
        setCompanyId(storedCompanyId);
        await fetchCompanyBookings(storedCompanyId);
      } catch (error) {
        console.error("Initialization error:", error);
        setLoading(false);
      }
    };

    initialize();
  }, []);

  return (
    <RentalAppLayout title="Confirmed Bookings">
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Loading Bookings...</Text>
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
                tintColor="#FFFFFF"
              />
            }
            renderItem={({ item }) => {
              const durationDays = calculateDays(item.from, item.to);
              
              return (
                <TouchableOpacity 
                  style={styles.bookingCard}
                  onPress={() => handleBookingPress(item)}
                >
                  <Text style={styles.bookingHeader}>Booking #{item._id.substring(0, 8)}</Text>
                  
                  <View style={styles.dateContainer}>
                    <View style={styles.dateColumn}>
                      <Text style={styles.dateLabel}>From</Text>
                      <Text style={styles.dateValue}>{formatDisplayDate(item.from)}</Text>
                      <Text style={styles.timeValue}>{item.fromTime || 'N/A'}</Text>
                    </View>
                    
                    <View style={styles.dateColumn}>
                      <Text style={styles.dateLabel}>To</Text>
                      <Text style={styles.dateValue}>{formatDisplayDate(item.to)}</Text>
                      <Text style={styles.timeValue}>{item.toTime || 'N/A'}</Text>
                    </View>
                  </View>

                  <View style={styles.durationContainer}>
                    <Text style={styles.durationLabel}>
                      Duration: <Text style={styles.durationValue}>{durationDays} {durationDays === 1 ? 'day' : 'days'}</Text>
                    </Text>
                  </View>

                  {item.idVehicle ? (
                    <>
                      <View style={styles.vehicleInfo}>
                        <Image
                          source={{ uri: item.idVehicle.carImageUrls[0] || 'https://via.placeholder.com/150' }}
                          style={styles.vehicleImage}
                        />
                        <View style={styles.vehicleDetails}>
                          <Text style={styles.vehicleText}>
                            {item.idVehicle.manufacturer} {item.idVehicle.model}
                          </Text>
                          <Text style={styles.vehicleSubtext}>
                            {item.idVehicle.transmission} • ${item.idVehicle.rent}/day
                          </Text>
                          <Text style={styles.totalRentText}>
                            Total: ${(item.idVehicle.rent * durationDays).toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    </>
                  ) : (
                    <Text style={styles.warningText}>No vehicle assigned</Text>
                  )}

                  <Text style={styles.footerText}>
                    Booked on {formatDisplayDate(item.createdAt)}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No confirmed bookings found</Text>
          </View>
        )}
      </View>
    </RentalAppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003366",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#FFFFFF",
    fontSize: 16,
    opacity: 0.8,
  },
  bookingCard: {
    backgroundColor: "#1E5A82",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  bookingHeader: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dateColumn: {
    flex: 1,
  },
  dateLabel: {
    color: "#FFFFFF",
    opacity: 0.8,
    fontSize: 14,
    marginBottom: 4,
  },
  dateValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  timeValue: {
    color: "#FFFFFF",
    fontSize: 14,
    opacity: 0.8,
  },
  durationContainer: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: 12,
  },
  durationLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
  durationValue: {
    fontWeight: "bold",
    color: "#FFD700",
  },
  vehicleInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  vehicleImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  vehicleSubtext: {
    color: "#FFFFFF",
    opacity: 0.8,
    fontSize: 14,
    marginBottom: 4,
  },
  totalRentText: {
    color: "#FFD700",
    fontWeight: "bold",
    fontSize: 15,
  },
  warningText: {
    color: "#FFD700",
    fontStyle: "italic",
    marginVertical: 8,
  },
  footerText: {
    color: "#FFFFFF",
    opacity: 0.7,
    fontSize: 12,
    marginTop: 8,
  },
});

export default RentalHomeScreen;