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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import InputField from "../../components/ui/InputField";
import { AppConstants } from "@/constants/appConstants";
import { saveCompanyId, saveCompanyName } from "@/utils/storageUtil";
import * as ImagePicker from "expo-image-picker";
import PakistaniProvinceSelector from "../../components/ui/ProvinceSelector";

type ImageUri = string | null;

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
        if (!nameRegex.test(city)) {
          Alert.alert("Invalid Input", "City must contain only letters.");
          return false;
        }
        if (!nameRegex.test(province)) {
          Alert.alert("Invalid Input", "Province must contain only letters.");
          return false;
        }
        if (!phoneRegex.test(phNum)) {
          Alert.alert("Invalid Input", "Phone number must be 11 digits and start with 03XXXXXXXXX.");
          return false;
        }
       
        if (!accountNumberRegex.test(accountNo)) {
          console.log(accountNo.length);
          console.log(accountNo);
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
      
          // Only append images if they exist
          if (cnicFront) {
            formData.append("cnicFront", {
              uri: cnicFront,
              name: "cnicFront.jpg",
              type: "image/jpeg",
            } as any);
          }
          
          if (cnicBack) {
            formData.append("cnicBack", {
              uri: cnicBack,
              name: "cnicBack.jpg",
              type: "image/jpeg",
            } as any);
          }
      
          const response = await fetch(`${AppConstants.LOCAL_URL}/rental-companies/postRental`, {
            method: "POST",
            body: formData,
          });
      
          const responseText = await response.text();
          console.log("Response text:", responseText);
      
          // Make sure we have valid JSON before parsing
          let data;
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error("Failed to parse response:", parseError);
            Alert.alert("Error", "Server response could not be processed. Please try again later.");
            return;
          }
      
          if (response.ok) {
            console.log("Rental company created successfully:", data);
            
            // Check if the response has company property instead of rentalCompany
            if (data && data.company && data.company._id) {
              await saveCompanyId(data.company._id);
              await saveCompanyName(data.company.companyName);
              console.log("Company ID saved:", data.company._id);
              Alert.alert("Success", "Signup Successful!", [
                { 
                  text: "OK", 
                  onPress: () => router.push("/(rental-tabs)") 
                }
              ]);
            } else {
              console.error("Invalid response structure:", data);
              Alert.alert("Error", "Account created but could not retrieve company ID. Please contact support.");
            }
          } else {
            console.error("Signup failed:", response.status, data);
            Alert.alert("Signup Failed", data.message || "Please try again later.");
          }
        } catch (error) {
          console.error("Signup error:", error);
          Alert.alert("Error", "Something went wrong. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      };
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
            // Remove all non-digit characters
            const digitsOnly = value.replace(/\D/g, '');
            // Format as XXXXX-XXXXXXX-X
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
        maxLength={15} // Increased to accommodate formatted CNIC
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
      <InputField
        label="City"
        placeholder="Enter city"
        value={city}
        onChangeText={setCity}
        keyboardType="default"
        maxLength={50}
        autoCapitalize="words"
      />


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
});
export default RentalSignUpScreen;
