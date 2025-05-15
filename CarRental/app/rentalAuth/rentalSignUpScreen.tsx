import React, { useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  TextInput
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import InputField from "../../components/ui/InputField";
import { AppConstants } from "@/constants/appConstants";
import { saveCompanyId, saveCompanyName } from "@/utils/storageUtil";
import * as ImagePicker from "expo-image-picker";
import PakistaniProvinceSelector from "../../components/ui/ProvinceSelector";
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

const RentalSignUpScreen = () => {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phNum, setPhNum] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankTitle, setBankTitle] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [cnic, setCnic] = useState("");
  const [displayCnic, setDisplayCnic] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [cnicFront, setCnicFront] = useState<ImageUri>(null);
  const [cnicBack, setCnicBack] = useState<ImageUri>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);

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

  const validateInputs = () => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    const phoneRegex = /^03\d{9}$/;
    const accountNumberRegex = /^\d{11,20}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^.{8,20}$/;

    if (!nameRegex.test(companyName)) {
      Alert.alert("Invalid Input", "Company name must contain only letters.");
      return false;
    }
    if (!phoneRegex.test(phNum)) {
      Alert.alert("Invalid Input", "Phone number must be 11 digits and start with 03XXXXXXXXX.");
      return false;
    }
    if (!accountNumberRegex.test(accountNo)) {
      Alert.alert("Invalid Input", "Account number must be between 11 and 20 digits.");
      return false;
    }
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Input", "Please enter a valid email address.");
      return false;
    }
    if (!passwordRegex.test(password)) {
      Alert.alert("Invalid Input", "Password must be between 8 and 20 characters.");
      return false;
    }
    if (!cnicFront || !cnicBack) {
      Alert.alert("Error", "Please upload both CNIC front and back images.");
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateInputs()) {
      setIsLoading(false);
      return;
    }
  
    setIsLoading(true);
  
    try {
      let formData = new FormData();
  
      formData.append("companyName", companyName);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("phNum", phNum);
      formData.append("bankName", bankName);
      formData.append("bankTitle", bankTitle);
      formData.append("accountNo", accountNo);
      formData.append("cnic", cnic);
      formData.append("address", address);
      formData.append("city", city);
      formData.append("province", province);
  
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
  
      const response = await fetch(`${AppConstants.LOCAL_URL}/rental-companies/postRental`, {
        method: "POST",
        body: formData,
      });
  
      const responseText = await response.text();
      console.log("Response text:", responseText);
  
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.log("Failed to parse response:", parseError);
        Alert.alert("Error", "Server response could not be processed. Please try again later.");
        return;
      }
  
      if (response.ok) {
        console.log("Rental company created successfully:", data);
        
        if (data && data.company && data.company._id) {
          await AsyncStorage.setItem('companyAccessToken', data.token);
          await AsyncStorage.setItem('email', data.company.email);
          
          await saveCompanyId(data.company._id);
          await saveCompanyName(data.company.companyName);
          console.log("Company ID saved:", data.company._id);
          
          router.push("/rentalAuth/rentalVerification");
        } else {
          console.log("Invalid response structure:", data);
          Alert.alert("Error", "Account created but could not retrieve company ID. Please contact support.");
        }
      } else {
        console.log("Signup failed:", response.status, data);
        Alert.alert("Signup Failed", data.message || "Please try again later.");
      }
    } catch (error) {
      console.log("Signup error:", error);
      Alert.alert("Error", "Something went wrong. Please try again later.");
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
      <ImageBackground source={require("../../assets/images/signup.png")} style={styles.backgroundImage}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.heading}>Register Your Company</Text>
      </ImageBackground>

      <View style={styles.formContainer}>
        <InputField
          label="Company Name"
          placeholder="Enter company name"
          value={companyName}
          onChangeText={setCompanyName}
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
          label="Bank Name"
          placeholder="Enter bank name"
          value={bankName}
          onChangeText={setBankName}
          keyboardType="default"
          maxLength={50}
          autoCapitalize="words"
        />
        <InputField
          label="Account Title"
          placeholder="Enter account title"
          value={bankTitle}
          onChangeText={setBankTitle}
          keyboardType="default"
          maxLength={50}
          autoCapitalize="words"
        />
        <InputField
          label="Account Number"
          placeholder="Enter account number"
          value={accountNo}
          onChangeText={setAccountNo}
          keyboardType="numeric"
          maxLength={20}
        />
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
        
        {/* City Selector */}
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

        <Text style={styles.imageLabel}>Upload CNIC Front Image</Text>
        <TouchableOpacity onPress={() => pickImage(setCnicFront)} style={styles.imagePicker}>
          {cnicFront ? <Image source={{ uri: cnicFront }} style={styles.image} /> : <Text>Select Image</Text>}
        </TouchableOpacity>

        <Text style={styles.imageLabel}>Upload CNIC Back Image</Text>
        <TouchableOpacity onPress={() => pickImage(setCnicBack)} style={styles.imagePicker}>
          {cnicBack ? <Image source={{ uri: cnicBack }} style={styles.image} /> : <Text>Select Image</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Sign Up</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#003366",
    paddingBottom: 30,
  },
  backgroundImage: {
    width: "110%",
    height: 250,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 15,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 8,
    borderRadius: 20,
  },
  heading: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 220,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  formContainer: {
    backgroundColor: "white",
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 3,
  },
  imageLabel: {
    marginTop: 15,
    fontWeight: "bold",
    color: "#003366",
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: "#003366",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginTop: 5,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
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

export default RentalSignUpScreen;