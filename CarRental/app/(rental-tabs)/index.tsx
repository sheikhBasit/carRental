import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import RentalAppLayout from "@/app/screens/rentalAppLayout";
import { AppConstants } from "@/constants/appConstants";
import { loadCompanyId } from "@/utils/storageUtil";
import { useRouter } from "expo-router";

type Vehicle = {
  _id: string;
  carImageUrls: string[];
  manufacturer: string;
  rentalCompany: string;
  rent: number;
  model: string;
  transmission: string;
  capacity: number;
  trips: number;
};

type HomeScreenNavigationProp = DrawerNavigationProp<any>;

const CarScreen = () => {
  const router = useRouter();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [cars, setCars] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const fetchCompanyVehicles = async (companyId: string) => {
    try {
      const response = await fetch(`${AppConstants.LOCAL_URL}/vehicles/company?company=${companyId}`);
      const data = await response.json();

      if (response.ok) {
        console.log("Vehicles:", data.vehicles);
        setCars(data.vehicles as Vehicle[]);
      } else {
        console.error("Error:", data.error);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCompanyId = async () => {
      const storedUserId = await loadCompanyId();
      if (storedUserId) {
        setCompanyId(storedUserId);
        fetchCompanyVehicles(storedUserId);
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
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Loading Cars...</Text>
          </View>
        ) : cars.length > 0 ? (
          <FlatList
            data={cars}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => {
                  console.log("Car ID:", item._id);
                  console.log("Car Image URL:", item.carImageUrls);
                  
                  router.push({ pathname: '/screens/EditCar/[carId]', params: { carId: item._id } 
                  })
                console.log("Car ID:", item._id);
                
                }
                
                }
              >
                <Image source={{ uri: item.carImageUrls[0] }} style={styles.carImage} />
                <View style={styles.cardContent}>
                  <Text style={styles.carModel}>{item.model}</Text> 
                  <Text style={styles.carManufacturer}>{item.manufacturer}</Text>

                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Transmission:</Text>
                    <Text style={styles.value}>{item.transmission}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Capacity:</Text>
                    <Text style={styles.value}>{item.capacity} seats</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Trips:</Text>
                    <Text style={styles.value}>{item.trips} completed</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Currently, there are no cars available</Text>
          </View>
        )}
      </View>
    </RentalAppLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#003366", padding: 20 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#fff", fontSize: 16 },

  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "rgba(255, 255, 255, 0.5)", fontSize: 16 },

  card: {
    backgroundColor: "#1E5A82",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 15,
  },
  carImage: {
    width: "100%",
    height: 150,
  },
  cardContent: {
    padding: 15,
  },
  carModel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  carManufacturer: {
    fontSize: 16,
    color: "#ADD8E6",
    marginBottom: 5,
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
});

export default CarScreen;
