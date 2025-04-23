import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Alert,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import InputField from "../../components/ui/InputField";
import { loadCity, loadUserId, saveCity } from "@/utils/storageUtil";
import * as Notifications from "expo-notifications";

type ImageUri = string | null;

const SignUpScreen: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phNum, setPhNum] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [cnic, setCnic] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseFront, setLicenseFront] = useState<ImageUri>(null);
  const [licenseBack, setLicenseBack] = useState<ImageUri>(null);
  const [cnicFront, setCnicFront] = useState<ImageUri>(null);
  const [cnicBack, setCnicBack] = useState<ImageUri>(null);
  const [profilePic, setProfilePic] = useState<ImageUri>(null); // Added for profile picture
  const [fcmToken, setFcmToken] = useState<string | null>(null); // Added for FCM token
  const [isLoading, setIsLoading] = useState(false);

  // Load city from AsyncStorage when the component mounts
  useEffect(() => {
    loadCity().then(setCity);
    
    // Request notification permissions and get FCM token
    registerForPushNotifications();
  }, []);

  // Function to register for push notifications and get FCM token
  const registerForPushNotifications = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      
      // Get the token
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setFcmToken(token);
    } catch (error) {
      console.log('Error getting push token:', error);
    }
  };

  // Function to pick an image
  const pickImage = async (setImage: React.Dispatch<React.SetStateAction<ImageUri>>) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  // Handle Sign-Up
  const handleSignUp = async () => {
    // Start loading
    setIsLoading(true);

    // Validation Checks
    const nameRegex = /^[a-zA-Z\s]+$/;
    const phoneRegex = /^03\d{9}$/; // 11-digit number starting with 03
    const cnicRegex = /^\d{13}$/; // Exactly 13 digits
    const accountNumberRegex = /^\d{11,20}$/; // 11 to 20 digits
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Standard email format
    const passwordRegex = /^.{8,20}$/; // Password must be between 8-20 characters
    const licenseNumberRegex = /^[A-Za-z0-9]{6,20}$/; // Alphanumeric, 6-20 characters

    if (!nameRegex.test(name)) {
      Alert.alert("Invalid Input", "Name must contain only letters.");
      setIsLoading(false);
      return;
    }
    if (!nameRegex.test(city)) {
      Alert.alert("Invalid Input", "City must contain only letters.");
      setIsLoading(false);
      return;
    }
    if (!nameRegex.test(province)) {
      Alert.alert("Invalid Input", "Province must contain only letters.");
      setIsLoading(false);
      return;
    }
    if (!phoneRegex.test(phNum)) {
      Alert.alert("Invalid Input", "Phone number must be 11 digits and start with 03XXXXXXXXX.");
      setIsLoading(false);
      return;
    }
    if (!cnicRegex.test(cnic)) {
      Alert.alert("Invalid Input", "CNIC must be exactly 13 digits.");
      setIsLoading(false);
      return;
    }
    if (!accountNumberRegex.test(accountNo)) {
      Alert.alert("Invalid Input", "Account number must be between 11 and 20 digits.");
      setIsLoading(false);
      return;
    }
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Input", "Please enter a valid email address.");
      setIsLoading(false);
      return;
    }
    if (!passwordRegex.test(password)) {
      Alert.alert("Invalid Input", "Password must be between 8 and 20 characters.");
      setIsLoading(false);
      return;
    }
    if (!licenseNumberRegex.test(licenseNumber)) {
      Alert.alert("Invalid Input", "License number must be alphanumeric and 6-20 characters long.");
      setIsLoading(false);
      return;
    }

    // Check if all required images are selected
    if (!cnicFront || !cnicBack || !licenseFront || !licenseBack) {
      Alert.alert("Error", "Please upload all required images (CNIC & License front and back).");
      setIsLoading(false);
      return;
    }

    // Prepare FormData
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("phoneNo", phNum);
    formData.append("address", address);
    formData.append("city", city);
    formData.append("province", province);
    formData.append("accountNo", accountNo);
    formData.append("cnic", cnic);
    formData.append("license", licenseNumber);
    
    // Add FCM token if available
    if (fcmToken) {
      formData.append("fcmToken", fcmToken);
    }

    // Append profile picture if selected
    if (profilePic) {
      formData.append("profilePic", {
        uri: profilePic,
        name: "profilePic.jpg",
        type: "image/jpeg",
      } as any);
    }

    // Append images to FormData
    formData.append("cnicFront", {
      uri: cnicFront,
      name: "cnicFront.jpg",
      type: "image/jpeg",
    } as any);
    formData.append("cnicBack", {
      uri: cnicBack,
      name: "cnicBack.jpg",
      type: "image/jpeg",
    } as any);
    formData.append("licenseFront", {
      uri: licenseFront,
      name: "licenseFront.jpg",
      type: "image/jpeg",
    } as any);
    formData.append("licenseBack", {
      uri: licenseBack,
      name: "licenseBack.jpg",
      type: "image/jpeg",
    } as any);

    try {
      const response = await fetch("http://192.168.100.17:5000/users/create", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Sign-up successful! Redirecting...");
        const { user } = result;
        const userId = user._id; // Document ID of the newly created user
        loadUserId().then(userId);
        // Store the user ID in local storage or state for future use
        console.log("User created successfully! User ID:", userId);

        router.push("./verification"); // Redirect to verification screen
      } else {
        Alert.alert("Error", result.message || "Sign-up failed. Please try again.");
      }
    } catch (error) {
      console.error("Error signing up:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false); // Stop loading regardless of success or failure
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require("../../assets/images/signUp.jpg")} style={styles.backgroundImage}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.heading}>Start your car rental business</Text>
      </ImageBackground>

      <View style={styles.formContainer}>
        {/* Profile Picture Upload */}
        <Text style={styles.imageLabel}>Profile Picture (Optional)</Text>
        <TouchableOpacity 
          style={styles.profilePicContainer} 
          onPress={() => pickImage(setProfilePic)}
        >
          {profilePic ? (
            <Image source={{ uri: profilePic }} style={styles.profilePic} />
          ) : (
            <View style={styles.profilePicPlaceholder}>
              <Ionicons name="person" size={40} color="#003366" />
              <Text style={{ color: "#003366", marginTop: 5 }}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <InputField label="Name" placeholder="Enter your name" value={name} onChangeText={setName} />
        <InputField label="Email" placeholder="Enter your email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <InputField label="Password" placeholder="Enter password" value={password} onChangeText={setPassword} secureTextEntry />
        <InputField label="Phone Number" placeholder="Enter phone number" value={phNum} onChangeText={setPhNum} keyboardType="numeric" />
        <InputField label="Address" placeholder="Enter address" value={address} onChangeText={setAddress} />
        <InputField
          label="City"
          placeholder="Enter city"
          value={city}
          onChangeText={(text) => {
            setCity(text);
            saveCity(text); // Save city to AsyncStorage
          }}
        />
        <InputField label="Province" placeholder="Enter province" value={province} onChangeText={setProvince} />
        <InputField label="Account Number" placeholder="Enter account number" value={accountNo} onChangeText={setAccountNo} keyboardType="numeric" />
        <InputField label="CNIC Number" placeholder="Enter CNIC number" value={cnic} onChangeText={setCnic} keyboardType="numeric" />
        <InputField label="License Number" placeholder="Enter license number" value={licenseNumber} onChangeText={setLicenseNumber} />

        {/* Image Upload Sections */}
        <Text style={styles.imageLabel}>CNIC Front</Text>
        <TouchableOpacity style={styles.imageUploadButton} onPress={() => pickImage(setCnicFront)}>
          <Text style={styles.imageUploadText}>{cnicFront ? "Change Image" : "Upload Image"}</Text>
        </TouchableOpacity>

        <Text style={styles.imageLabel}>CNIC Back</Text>
        <TouchableOpacity style={styles.imageUploadButton} onPress={() => pickImage(setCnicBack)}>
          <Text style={styles.imageUploadText}>{cnicBack ? "Change Image" : "Upload Image"}</Text>
        </TouchableOpacity>

        <Text style={styles.imageLabel}>License Front</Text>
        <TouchableOpacity style={styles.imageUploadButton} onPress={() => pickImage(setLicenseFront)}>
          <Text style={styles.imageUploadText}>{licenseFront ? "Change Image" : "Upload Image"}</Text>
        </TouchableOpacity>

        <Text style={styles.imageLabel}>License Back</Text>
        <TouchableOpacity style={styles.imageUploadButton} onPress={() => pickImage(setLicenseBack)}>
          <Text style={styles.imageUploadText}>{licenseBack ? "Change Image" : "Upload Image"}</Text>
        </TouchableOpacity>

        {/* Sign Up Button with Loader */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#003366", paddingBottom: 30 },
  backgroundImage: { width: "110%", height: 250, justifyContent: "center", paddingHorizontal: 20 },
  backButton: { position: "absolute", top: 40, left: 15, backgroundColor: "rgba(0, 0, 0, 0.5)", padding: 8, borderRadius: 20 },
  heading: { color: "white", fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: -220 },
  formContainer: { backgroundColor: "white", margin: 20, padding: 20, borderRadius: 12, elevation: 3 },
  button: {
    marginTop: 10,
    backgroundColor: "#003366",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#cccccc", // Disabled button color
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  imageLabel: { marginTop: 10, fontSize: 16, fontWeight: "bold" },
  imageUploadButton: { marginTop: 5, padding: 10, backgroundColor: "#003366", borderRadius: 5, alignItems: "center" },
  imageUploadText: { color: "white", fontSize: 16 },
  profilePicContainer: {
    alignSelf: "center",
    marginVertical: 15,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#003366",
  },
  profilePicPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#003366",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SignUpScreen;