// Image at top and then the fields filled with the fetched values and at the bottom there will be two buttons update and delete

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import RentalAppLayout from "@/app/screens/rentalAppLayout";
import { AppConstants } from "@/constants/appConstants";

// Define the navigation types
type RootStackParamList = {
  EditDriverScreen: { driverId: string };
};

type EditDriverScreenNavigationProp = StackNavigationProp<RootStackParamList, "EditDriverScreen">;
type EditDriverScreenRouteProp = RouteProp<RootStackParamList, "EditDriverScreen">;

// Define the driver type
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

const EditDriverScreen = () => {
  const navigation = useNavigation<EditDriverScreenNavigationProp>();
  const route = useRoute<EditDriverScreenRouteProp>();
  const { driverId } = route.params;

  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch Driver Details
  useEffect(() => {
    const fetchDriverDetails = async () => {
      try {
        const response = await fetch(`${AppConstants.LOCAL_URL}/drivers/${driverId}`);
        const data = await response.json();

        if (response.ok) {
          setDriver(data);
        } else {
          Alert.alert("Error", "Failed to fetch driver details.");
        }
      } catch (error) {
        console.error("Error fetching driver details:", error);
        Alert.alert("Error", "An error occurred while fetching the driver details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDriverDetails();
  }, [driverId]);

  // Update Driver Details
  const handleUpdate = async () => {
    if (!driver) return;

    setUpdating(true);
    try {
      const response = await fetch(`${AppConstants.LOCAL_URL}/drivers/${driverId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(driver),
      });

      if (response.ok) {
        Alert.alert("Success", "Driver details updated successfully!");
      } else {
        Alert.alert("Error", "Failed to update driver details.");
      }
    } catch (error) {
      console.error("Error updating driver:", error);
      Alert.alert("Error", "An error occurred while updating the driver.");
    } finally {
      setUpdating(false);
    }
  };

  // Delete Driver
  const handleDelete = async () => {
    Alert.alert("Confirm", "Are you sure you want to delete this driver?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeleting(true);
          try {
            const response = await fetch(`${AppConstants.LOCAL_URL}/drivers/${driverId}`, {
              method: "DELETE",
            });

            if (response.ok) {
              Alert.alert("Success", "Driver deleted successfully!");
              navigation.goBack();
            } else {
              Alert.alert("Error", "Failed to delete driver.");
            }
          } catch (error) {
            console.error("Error deleting driver:", error);
            Alert.alert("Error", "An error occurred while deleting the driver.");
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <RentalAppLayout title="Edit Driver">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#003366" />
        </View>
      </RentalAppLayout>
    );
  }

  if (!driver) {
    return (
      <RentalAppLayout title="Edit Driver">
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Driver not found.</Text>
        </View>
      </RentalAppLayout>
    );
  }

  return (
    <RentalAppLayout title="Edit Driver">
      <ScrollView style={styles.container}>
        <Image source={{ uri: driver.profileimg }} style={styles.driverImage} />

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={driver.name}
          onChangeText={(text) => setDriver({ ...driver, name: text })}
        />

        <Text style={styles.label}>License</Text>
        <TextInput
          style={styles.input}
          value={driver.license}
          onChangeText={(text) => setDriver({ ...driver, license: text })}
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={driver.phNo}
          onChangeText={(text) => setDriver({ ...driver, phNo: text })}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          value={driver.age.toString()}
          onChangeText={(text) => setDriver({ ...driver, age: parseInt(text) || 0 })}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Experience</Text>
        <TextInput
          style={styles.input}
          value={driver.experience.toString()}
          onChangeText={(text) => setDriver({ ...driver, experience: parseInt(text) || 0 })}
          keyboardType="numeric"
        />

        <Text style={styles.label}>CNIC</Text>
        <TextInput
          style={styles.input}
          value={driver.cnic}
          onChangeText={(text) => setDriver({ ...driver, cnic: text })}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.updateButton]}
            onPress={handleUpdate}
            disabled={updating}
          >
            <Text style={styles.buttonText}>{updating ? "Updating..." : "Update"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDelete}
            disabled={deleting}
          >
            <Text style={styles.buttonText}>{deleting ? "Deleting..." : "Delete"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </RentalAppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#003366",
    
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  driverImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom:30
  },
  button: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    borderRadius: 5,
  },
  updateButton: {
    backgroundColor: "#28a745",
    marginRight: 10,

  },
  deleteButton: {
    backgroundColor: "#dc3545",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
});

export default EditDriverScreen;
