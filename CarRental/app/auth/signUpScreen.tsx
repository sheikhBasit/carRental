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
  TextInput,
  Modal,
  FlatList,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import InputField from "../../components/ui/InputField";
import PakistaniProvinceSelector from "../../components/ui/ProvinceSelector";
import { loadCity, loadUserId, loadUserName, saveCity } from "@/utils/storageUtil";
import * as Notifications from "expo-notifications";
import { AppConstants } from "@/constants/appConstants";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ImageUri = string | null;

// City data by province
const pakistaniCitiesByProvince = {
  "Punjab": ["Lahore", "Faisalabad", "Rawalpindi", "Multan", "Gujranwala", "Sialkot", "Bahawalpur", "Sargodha", "Jhang", "Sheikhupura"],
  "Sindh": ["Karachi", "Hyderabad", "Sukkur", "Larkana", "Nawabshah", "Mirpur Khas", "Thatta", "Jacobabad"],
  "Khyber Pakhtunkhwa": ["Peshawar", "Abbottabad", "Mardan", "Swat", "Nowshera", "Charsadda", "Kohat", "Bannu"],
  "Balochistan": ["Quetta", "Gwadar", "Turbat", "Khuzdar", "Chaman", "Sibi", "Loralai", "Zhob"],
  "Gilgit-Baltistan": ["Gilgit", "Skardu", "Hunza", "Nagar", "Shigar", "Astore", "Ghanche"],
  "Azad Jammu and Kashmir": ["Muzaffarabad", "Mirpur", "Bhimber", "Kotli", "Rawalakot", "Bagh", "Hattian Bala"]
};

const SignUpScreen: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phNum, setPhNum] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [cnic, setCnic] = useState("");
  const [displayCnic, setDisplayCnic] = useState("");
  const [cnicFront, setCnicFront] = useState<ImageUri>(null);
  const [cnicBack, setCnicBack] = useState<ImageUri>(null);
  const [profilePic, setProfilePic] = useState<ImageUri>(null);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);

  useEffect(() => {
    loadCity().then(setCity);
    registerForPushNotifications();
  }, []);

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
      
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setFcmToken(token);
    } catch (error) {
      console.log('Error getting push token:', error);
    }
  };

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

  const handleSignUp = async () => {
    setIsLoading(true);

    const nameRegex = /^[a-zA-Z\s]+$/;
    const phoneRegex = /^03\d{9}$/;
    const cnicRegex = /^\d{13}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^.{8,20}$/;

    if (!nameRegex.test(name)) {
      Alert.alert("Invalid Input", "Name must contain only letters.");
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
    if (!cnicFront || !cnicBack) {
      Alert.alert("Error", "Please upload all required images (CNIC front and back).");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("phoneNo", phNum);
    formData.append("address", address);
    formData.append("city", city);
    formData.append("province", province);
    formData.append("cnic", cnic);

    if (fcmToken) formData.append("fcmToken", fcmToken);

    if (profilePic) {
      formData.append("profilePic", {
        uri: profilePic,
        name: "profilePic.jpg",
        type: "image/jpeg",
      } as any);
    }

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

    try {
      const response = await fetch(`${AppConstants.LOCAL_URL}/users/create`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = await response.json();
      if (response.ok) {
        const { user } = result;
        await AsyncStorage.setItem('userEmail', user.email);
        loadUserId().then(user._id);
        loadCity().then(user.city);
        loadUserName().then(user.name);
        router.push("./verification");
      } else {
        Alert.alert("Error", result.message || "Sign-up failed. Please try again.");
      }
    } catch (error) {
      console.log("Error signing up:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const cities = province ? pakistaniCitiesByProvince[province as keyof typeof pakistaniCitiesByProvince] || [] : [];

  const renderCityItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.cityItem}
      onPress={() => {
        setCity(item);
        setShowCityPicker(false);
      }}
    >
      <Text>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require("../../assets/images/signUp.jpg")} style={styles.backgroundImage}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.heading}>Start your car rental business</Text>
      </ImageBackground>

      <View style={styles.formContainer}>
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

        <InputField
          label="Name"
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
          keyboardType="default"
          maxLength={50}
          autoCapitalize="words"
        />
        <InputField
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <InputField
          label="Password"
          placeholder="Enter password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          maxLength={20}
        />
        <InputField
          label="Phone Number"
          placeholder="Enter phone number"
          value={phNum}
          onChangeText={setPhNum}
          keyboardType="numeric"
          maxLength={11}
        />
        <InputField
          label="Address"
          placeholder="Enter address"
          value={address}
          onChangeText={setAddress}
          keyboardType="default"
          multiline
          maxLength={200}
        />
        
        <PakistaniProvinceSelector
          value={province}
          onChange={setProvince}
        />
        
        <Text style={styles.label}>City</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={province ? "Select your city" : "Select province first"}
            value={city}
            onChangeText={setCity}
            onFocus={() => setShowCityPicker(false)}
            editable={!!province}
          />
          <TouchableOpacity 
            style={styles.pickerButton}
            onPress={() => province && setShowCityPicker(true)}
            disabled={!province}
          >
            <Ionicons name="chevron-down" size={20} color={province ? "#003366" : "#ccc"} />
          </TouchableOpacity>
        </View>

        <Modal
          visible={showCityPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCityPicker(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <FlatList
                data={cities}
                renderItem={renderCityItem}
                keyExtractor={(item) => item}
                ListHeaderComponent={
                  <Text style={styles.modalHeader}>Select a City</Text>
                }
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCityPicker(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <InputField
          label="CNIC Number"
          placeholder="Enter CNIC number"
          value={displayCnic}
          onChangeText={(value) => {
              const digitsOnly = value.replace(/\D/g, '');
              let formatted = '';
              if (digitsOnly.length > 0) {
                formatted = digitsOnly.slice(0, Math.min(5, digitsOnly.length));
              }
              if (digitsOnly.length > 5) {
                formatted += '-' + digitsOnly.slice(5, Math.min(12, digitsOnly.length));
              }
              if (digitsOnly.length > 12) {
                formatted += '-' + digitsOnly.slice(12);
              }
              setDisplayCnic(formatted);
              setCnic(digitsOnly);
            }}
          keyboardType="numeric"
          maxLength={15}
        />
     
        <Text style={styles.imageLabel}>CNIC Front</Text>
        <TouchableOpacity style={styles.imageUploadButton} onPress={() => pickImage(setCnicFront)}>
          <Text style={styles.imageUploadText}>{cnicFront ? "Change Image" : "Upload Image"}</Text>
        </TouchableOpacity>

        <Text style={styles.imageLabel}>CNIC Back</Text>
        <TouchableOpacity style={styles.imageUploadButton} onPress={() => pickImage(setCnicBack)}>
          <Text style={styles.imageUploadText}>{cnicBack ? "Change Image" : "Upload Image"}</Text>
        </TouchableOpacity>

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
    backgroundColor: "#cccccc",
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
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    padding: 10,
  },
  pickerButton: {
    padding: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    maxHeight: '60%',
  },
  modalHeader: {
    padding: 15,
    fontSize: 18,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    textAlign: 'center',
  },
  cityItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  closeButtonText: {
    color: '#003366',
    fontWeight: 'bold',
  },
});

export default SignUpScreen;