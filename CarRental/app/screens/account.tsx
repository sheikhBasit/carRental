import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getStoredUserId, setStoredNotificationPreference, getStoredNotificationPreference } from "@/utils/storageUtil";
import { AppConstants } from "@/constants/appConstants";

const EditProfileScreen = () => {
  const router = useRouter();
  const [user, setUser] = useState({
    email: "ab745726@gmail.com",
    phoneNo: "",
  });
  const [loading, setLoading] = useState(true);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false); // State for the Switch

  useEffect(() => {
    fetchUserProfile();
    loadNotificationPreference();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userId = await getStoredUserId();
      if (!userId) {
        Alert.alert("Error", "User ID not found.");
        return;
      }

      const response = await fetch(`${AppConstants.LOCAL_URL}/users/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user profile.");
      }

      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      Alert.alert("Error", "Failed to fetch user profile.");
    } finally {
      setLoading(false);
    }
  };

  // Load the saved notification preference
  const loadNotificationPreference = async () => {
    try {
      const preference = await getStoredNotificationPreference();
      if (preference !== null) {
        setIsAgreed(preference === "true"); // Convert string to boolean
      }
    } catch (error) {
      console.error("Error loading notification preference:", error);
    }
  };

  const handleNotificationSettings = () => {
    setIsDialogVisible(true); // Show the dialog
  };

  const handleSwitchToggle = async (newValue:any) => {
    setIsAgreed(newValue); // Update the switch state
    try {
      // Save the notification preference to storage
      await setStoredNotificationPreference(newValue.toString()); // Convert boolean to string
      if (newValue) {
        Alert.alert("Success", "You will be notified about updates.");
      }
    } catch (error) {
      console.error("Error saving notification preference:", error);
    } finally {
      setIsDialogVisible(false); // Close the dialog
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  return (
    <View style={styles.mcontainer}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#FFF" />
      </TouchableOpacity>

      <ScrollView style={styles.container}>
        {/* Login Settings Section */}
        <Text style={styles.sectionTitle}>LOGIN SETTINGS</Text>
        <View style={styles.section}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user.email}</Text>
          <Text style={styles.verifiedText}>Verified</Text>
        </View>

        <View style={styles.divider} />

        {/* Password Section */}
        <Text style={styles.sectionTitle}>Password</Text>
        <View style={styles.section}>
          <Text style={styles.label}>Google</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>

        <View style={styles.divider} />

        {/* Notification Settings Section */}
        <Text style={styles.sectionTitle}>NOTIFICATION SETTINGS</Text>
        <View style={styles.section}>
          <Text style={styles.label}>Notification manager</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={handleNotificationSettings}
          >
            <Text style={styles.buttonText}>Set notifications here</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Dialog for Notification Settings */}
      <Modal
        visible={isDialogVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsDialogVisible(false)}
      >
        <View style={styles.dialogContainer}>
          <View style={styles.dialogContent}>
            {/* Cross Button (X) in the top-right corner */}
            <TouchableOpacity
              style={styles.crossButton}
              onPress={() => setIsDialogVisible(false)}
            >
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>

            <Text style={styles.dialogTitle}>Notification Settings</Text>
            <Text style={styles.dialogText}>
              Do you want to be notified about our updates?
            </Text>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>I agree</Text>
              <Switch
                value={isAgreed}
                onValueChange={handleSwitchToggle} // Automatically close the dialog when toggled
                trackColor={{ false: "#767577", true: "#4CAF50" }} // Custom colors for the track
                thumbColor={isAgreed ? "#FFF" : "#FFF"} // Custom colors for the thumb
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mcontainer: {
    flex: 1,
    backgroundColor: "#003366",
  },
  container: {
    flex: 1,
    padding: 16,
    marginTop: 50,
    backgroundColor: "#003366",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 20,
    marginBottom: 10,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#ADD8E6",
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: "#FFF",
    marginBottom: 10,
  },
  verifiedText: {
    fontSize: 14,
    color: "#4CAF50", // Green color for verified status
  },
  divider: {
    height: 1,
    backgroundColor: "#1E5A82",
    marginVertical: 20,
  },
  button: {
    backgroundColor: "#1E88E5",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 10,
    zIndex: 1,
    marginTop: 10,
  },
  dialogContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dialogContent: {
    width: "80%",
    backgroundColor: "#1E5A82",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  crossButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
  },
  dialogText: {
    fontSize: 14,
    color: "#FFF",
    textAlign: "center",
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 14,
    color: "#FFF",
  },
});

export default EditProfileScreen;