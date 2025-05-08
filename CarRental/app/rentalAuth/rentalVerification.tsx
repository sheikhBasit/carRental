import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";
import { AppConstants } from "@/constants/appConstants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const VerificationCodeScreen: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState(""); // State for verification code
  const [isLoading, setIsLoading] = useState(false); // State for loader

  // Handle verification code submission
  const handleVerifyCode = async () => {
    setIsLoading(true); // Start loading

    // Basic validation
    if (!verificationCode || verificationCode.length !== 6) {
      Alert.alert("Invalid Code", "Please enter a valid 6-digit verification code.");
      setIsLoading(false); // Stop loading
      return;
    }

    // API call to verify the code
    try {
      const response = await fetch(`${AppConstants.LOCAL_URL}/rental-companies/verify/rental-company`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: verificationCode }),
      });

      const result = await response.json();
      await AsyncStorage.setItem('accessToken', result.token);

      if (response.ok) {
        Alert.alert("Success", "Verification successful! Redirecting...");
        router.push("/(tabs)"); // Navigate to the next screen
      } else {
        Alert.alert("Error", result.message || "Verification failed. Please try again.");
      }
    } catch (error) {
      console.log("Error verifying code:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleResendVerifyCode = async () => {
    setIsLoading(true); // Start loading

    const email = await AsyncStorage.getItem('email');
    // API call to verify the code
    try {
      const response = await fetch(`${AppConstants.LOCAL_URL}/rental-companies/resend-verification/rental-company`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      });

      const result = await response.json();
     
      if (response.ok) {
        Alert.alert("Success", "Verification Code Send");
      } else {
        Alert.alert("Error", result.message || "Verification failed. Please try again.");
      }
    } catch (error) {
      console.log("Error verifying code:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Verification Code</Text>
      <Text style={styles.subtitle}>
        We have sent a 6-digit verification code to your email/phone. Please enter it below.
      </Text>

      <InputField
        label=""
        placeholder="Enter verification code"
        value={verificationCode}
        onChangeText={setVerificationCode}
        keyboardType="numeric"
        maxLength={6} // Limit to 6 digits
      />

       <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleVerifyCode}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="blue" />
                ) : (
                  <Text style={styles.buttonText}>Verify</Text>
                )}
              </TouchableOpacity>

      <TouchableOpacity onPress={() => handleResendVerifyCode()}>
        <Text style={styles.resendText}>Didn't receive the code? Resend</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  buttonText: {
    color: "blue",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 140,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
  },
  button: {
    width: "100%",
    marginTop: 20,
  },
  resendText: {
    marginTop: 20,
    color: "#003366",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonDisabled: {
    backgroundColor: "#cccccc", // Disabled button color
  },
});

export default VerificationCodeScreen;