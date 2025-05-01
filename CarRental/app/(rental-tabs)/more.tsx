import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getStoredCompanyName, getStoredUserId, getStoredUserName } from "@/utils/storageUtil";
  import AsyncStorage from '@react-native-async-storage/async-storage';

const HostScreen = () => {
  const router = useRouter();
  const [user, setUser] = React.useState({
    name: "",
    email: "",
    profilePicture: "",
  });
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      const name = await getStoredCompanyName();
      setUser(
        (prevUser) => ({
          ...prevUser,
          name: name || "Guest",
        })
      )
    }
    fetchUserProfile();
  }, []);

  const handleBecomeHost = () => {
    // Navigate to the host registration screen
    router.push("/rentalAuth/rentalSignUpScreen");
  };

  const handleLogout = async () => {
    try {
      // Clear all data from AsyncStorage
      await AsyncStorage.clear();
      
      // Alternatively, if you only want to remove specific items:
      // await AsyncStorage.multiRemove(['userToken', 'userData', 'otherKey']);
      
      console.log("User logged out and storage cleared");
      
      // Navigate to the login or start screen
      router.replace("/auth/startScreen");
    } catch (error) {
      console.error("Failed to clear storage on logout:", error);
    }
  };
  const navigateToScreen = (screenName: string) => {
    router.push(`./screens/${screenName}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Ionicons name="person-circle-outline" size={80} color="white" style={styles.profileImage} />
        <Text style={styles.userName}>{user.name}</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.optionButton} onPress={() => router.push(`/screens/companyAccount`)}>
          <Ionicons name="person-outline" size={24} color="rgba(72, 156, 240, 0.9)" />
          <Text style={styles.optionText}>Account</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.optionButton} onPress={() => router.push(`/screens/addCarScreen`)}>
          <Ionicons name="car" size={24} color="rgba(72, 156, 240, 0.9)" />
          <Text style={styles.optionText}>Add Cars</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.optionButton} onPress={() => router.push(`/screens/addDriverScreen`)}>
          <Ionicons name="people" size={24} color="rgba(72, 156, 240, 0.9)" />
          <Text style={styles.optionText}>Add Drivers</Text>
        </TouchableOpacity>
        
        {/* New Contact Us Button */}
        <TouchableOpacity style={styles.optionButton} onPress={() => router.push(`/screens/contact`)}>
          <Ionicons name="call-outline" size={24} color="rgba(72, 156, 240, 0.9)" />
          <Text style={styles.optionText}>Contact Us</Text>
        </TouchableOpacity>
        
        {/* New About Us Button */}
        <TouchableOpacity style={styles.optionButton} onPress={() => router.push(`/screens/about`)}>
          <Ionicons name="information-circle-outline" size={24} color="rgba(72, 156, 240, 0.9)" />
          <Text style={styles.optionText}>About Us</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="exit-outline" size={24} color="#FF3B30" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003366", // Deep blue that works well with Pakistani context
  },
  profileHeader: {
    alignItems: "center",
    marginTop: 30,
    backgroundColor: "#003366",
    paddingBottom: 20,
  },
  profileImage: {
    alignContent: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 22,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userName: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
    marginTop: 5,
  },
  section: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
  hostButton: {
    backgroundColor: "rgba(72, 156, 240, 0.9)",
    padding: 20,
    borderRadius: 10,
  },
  hostButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  hostButtonSubText: {
    fontSize: 14,
    color: "#fff",
    marginTop: 10,
  },
  learnMoreText: {
    fontSize: 14,
    color: "#fff",
    marginTop: 10,
    textDecorationLine: "underline",
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  optionText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    marginHorizontal: 20,
    marginTop: 10,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginLeft: 16,
    marginTop: 20,
  },
  logoutText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 16,
  },
});

export default HostScreen;