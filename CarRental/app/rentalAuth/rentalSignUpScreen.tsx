import React, { useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";
import { router } from 'expo-router';

const RentalSignUpScreen = () => {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phNum, setPhNum] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankTitle, setBankTitle] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [cnic, setCnic] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [licenseFront, setLicenseFront] = useState(null);
  const [licenseBack, setLicenseBack] = useState(null);
  const [cnicFront, setCnicFront] = useState(null);
  const [cnicBack, setCnicBack] = useState(null);
  const pickImage = async (setImage: any) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);  
    }
  };
  

  const handleSignUp = () => {
    console.log('Registering with:', { 
      companyName, email, password, phNum, 
      bankName, bankTitle, accountNo, 
      cnic, address, city, province, 
      licenseFront, licenseBack, cnicFront, cnicBack 
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/images/signup.png')} style={styles.backgroundImage}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.heading}>Register Your Company</Text>
      </ImageBackground>

      <View style={styles.formContainer}>
        <InputField label="Company Name" placeholder="Enter company name" value={companyName} onChangeText={setCompanyName} />
        <InputField label="Email" placeholder="Enter your email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <InputField label="Password" placeholder="Enter password" value={password} onChangeText={setPassword} secureTextEntry />
        <InputField label="Phone Number" placeholder="Enter phone number" value={phNum} onChangeText={setPhNum} keyboardType="phone-pad" />
        <InputField label="Bank Name" placeholder="Enter bank name" value={bankName} onChangeText={setBankName} />
        <InputField label="Bank Title" placeholder="Enter bank title" value={bankTitle} onChangeText={setBankTitle} />
        <InputField label="Account Number" placeholder="Enter account number" value={accountNo} onChangeText={setAccountNo} keyboardType="numeric" />
        <InputField label="CNIC Number" placeholder="Enter CNIC number" value={cnic} onChangeText={setCnic} keyboardType="numeric" />
        <InputField label="Address" placeholder="Enter address" value={address} onChangeText={setAddress} />
        <InputField label="City" placeholder="Enter city" value={city} onChangeText={setCity} />
        <InputField label="Province" placeholder="Enter province" value={province} onChangeText={setProvince} />
        
        {/* Image Upload Section */}
        <Text style={styles.imageLabel}>Upload CNIC Front Image</Text>
        <TouchableOpacity onPress={() => pickImage(setCnicFront)} style={styles.imagePicker}>
          {cnicFront ? <Image source={{ uri: cnicFront }} style={styles.image} /> : <Text>Select Image</Text>}
        </TouchableOpacity>
        
        <Text style={styles.imageLabel}>Upload CNIC Back Image</Text>
        <TouchableOpacity onPress={() => pickImage(setCnicBack)} style={styles.imagePicker}>
          {cnicBack ? <Image source={{ uri: cnicBack }} style={styles.image} /> : <Text>Select Image</Text>}
        </TouchableOpacity>

        <Text style={styles.imageLabel}>Upload License Front Image</Text>
        <TouchableOpacity onPress={() => pickImage(setLicenseFront)} style={styles.imagePicker}>
          {licenseFront ? <Image source={{ uri: licenseFront }} style={styles.image} /> : <Text>Select Image</Text>}
        </TouchableOpacity>
        
        <Text style={styles.imageLabel}>Upload License Back Image</Text>
        <TouchableOpacity onPress={() => pickImage(setLicenseBack)} style={styles.imagePicker}>
          {licenseBack ? <Image source={{ uri: licenseBack }} style={styles.image} /> : <Text>Select Image</Text>}
        </TouchableOpacity>

        <Button title="Sign Up" onPress={handleSignUp} style={styles.button} />
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
  },
  formContainer: {
    backgroundColor: "white",
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 3,
  },
  button: {
    marginTop: 10,
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
});

export default RentalSignUpScreen;
