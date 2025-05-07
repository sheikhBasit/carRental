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
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getStoredUserId, setStoredNotificationPreference, getStoredNotificationPreference } from "@/utils/storageUtil";
import { AppConstants } from "@/constants/appConstants";
import { apiFetch } from '@/utils/api';

type PaymentMethod = {
  cardNumber: string;
  cardHolderName?: string;
  expiryDate: string;
  cvv?: string;
  isDefault: boolean;
  cardType: 'visa' | 'mastercard' | 'amex' | 'discover' | 'other';
  lastFourDigits?: string;
};

type User = {
  name: string;
  email: string;
  phoneNo: string;
  address: string;
  profilePic?: string;
  accountNo?: string;
  city: string;
  fcmToken?: string;
  province: string;
  license?: string;
  licenseFrontUrl?: string;
  licenseBackUrl?: string;
  cnic: string;
  cnicFrontUrl?: string;
  cnicBackUrl?: string;
  paymentMethods: PaymentMethod[];
  isVerified: boolean;
};

const EditProfileScreen = () => {
  const router = useRouter();
  const [user, setUser] = useState<User>({
    name: "",
    email: "",
    phoneNo: "",
    address: "",
    city: "",
    province: "",
    cnic: "",
    paymentMethods: [],
    isVerified: false,
  });
  const [loading, setLoading] = useState(true);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

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
      const data = await apiFetch(`/users/${userId}`,{},undefined,'user');
      setUser(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      Alert.alert("Error", "Failed to fetch user profile.");
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationPreference = async () => {
    try {
      const preference = await getStoredNotificationPreference();
      if (preference !== null) {
        setIsAgreed(preference === "true");
      }
    } catch (error) {
      console.error("Error loading notification preference:", error);
    }
  };

  const handleNotificationSettings = () => {
    setIsDialogVisible(true);
  };

  const handleSwitchToggle = async (newValue: boolean) => {
    setIsAgreed(newValue);
    try {
      await setStoredNotificationPreference(newValue.toString());
      if (newValue) {
        Alert.alert("Success", "You will be notified about updates.");
      }
    } catch (error) {
      console.error("Error saving notification preference:", error);
    } finally {
      setIsDialogVisible(false);
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
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#FFF" />
      </TouchableOpacity>

      <ScrollView style={styles.container}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          {user.profilePic ? (
            <Image source={{ uri: user.profilePic }} style={styles.profileImage} />
          ) : (
            <Ionicons name="person-circle-outline" size={80} color="#FFF" />
          )}
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.verificationStatus}>
            {user.isVerified ? "Verified" : "Not Verified"}
          </Text>
        </View>

        {/* Personal Information Section */}
        <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>
        <View style={styles.section}>
          <Text style={styles.label}>Phone Number</Text>
          <Text style={styles.value}>{user.phoneNo}</Text>
          
          <Text style={styles.label}>Address</Text>
          <Text style={styles.value}>{user.address}</Text>
          
          <Text style={styles.label}>City</Text>
          <Text style={styles.value}>{user.city}</Text>
          
          <Text style={styles.label}>Province</Text>
          <Text style={styles.value}>{user.province}</Text>
          
          <Text style={styles.label}>CNIC</Text>
          <Text style={styles.value}>{user.cnic}</Text>
        </View>

        <View style={styles.divider} />

        {/* Payment Methods Section */}
        <Text style={styles.sectionTitle}>PAYMENT METHODS</Text>
        {user.paymentMethods.length > 0 ? (
          user.paymentMethods.map((method, index) => (
            <View key={index} style={styles.paymentMethod}>
              <Text style={styles.label}>
                {method.cardType.toUpperCase()} •••• {method.lastFourDigits || '****'}
              </Text>
              <Text style={styles.value}>Expires {method.expiryDate}</Text>
              {method.isDefault && (
                <Text style={styles.defaultBadge}>Default</Text>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noPaymentMethods}>No payment methods added</Text>
        )}

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
                onValueChange={handleSwitchToggle}
                trackColor={{ false: "#767577", true: "#4CAF50" }}
                thumbColor={isAgreed ? "#FFF" : "#FFF"}
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
  profileSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: "#ADD8E6",
    marginBottom: 5,
  },
  verificationStatus: {
    fontSize: 14,
    color: "#4CAF50",
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
    marginBottom: 15,
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
  paymentMethod: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#1E5A82",
    borderRadius: 8,
  },
  defaultBadge: {
    fontSize: 12,
    color: "#4CAF50",
    marginTop: 5,
  },
  noPaymentMethods: {
    fontSize: 14,
    color: "#ADD8E6",
    fontStyle: "italic",
  },
});

export default EditProfileScreen;