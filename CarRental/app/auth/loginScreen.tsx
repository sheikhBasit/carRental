import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InputField from '../../components/ui/InputField';
import { Ionicons } from '@expo/vector-icons';
import { AppConstants } from '@/constants/appConstants';
import { getStoredUserId, loadCity, loadUserId, saveCity, saveUserId, saveUserName, saveUserPicture } from '@/utils/storageUtil';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [city, setCity] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCity = async () => {
      try {
        const storedCity = await loadCity();
        if (storedCity) setCity(storedCity);
      } catch (error) {
        console.error("Error loading city:", error);
      }
    };

    const fetchUserId = async () => {
      try {
        const storedUserId = await loadUserId();
        if (storedUserId) setUserId(storedUserId);
      } catch (error) {
        console.error("Error loading user id:", error);
      }
    };

    fetchCity();
    fetchUserId();
  }, []);

  const handleLogin = async () => {
    console.log('Logging in with:', email, password);
    setIsLoading(true);

    try {
      const response = await fetch(`${AppConstants.LOCAL_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Response:', data);

      if (response.ok) {
        // Save login status and user data
        await AsyncStorage.setItem('isLoggedIn', 'true');
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));

        // Save user details to AsyncStorage
        setCity(data.user.city);
        setUserId(data.user._id);
        await saveUserId(data.user._id);
        await saveCity(data.user.city);
        await saveUserName(data.user.name); // Save user name
        await saveUserPicture(data.user.profilePhoto); // Save profile picture

        console.log('Logged in successfully');
        router.push('/(tabs)');
      } else {
        console.log('Login failed:', data.message);
        alert(data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
      
        <Image source={require('../../assets/images/loginBanner.jpg')} style={styles.image} />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Ready to Rent Dream Car?</Text>

        <View style={styles.formContainer}>
          <InputField
            label="User Name"
            placeholder="Enter Email or Mobile Number"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholderTextColor="#888"
          />

          <InputField
            label="Password"
            placeholder="Enter Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#888"
          />

          <TouchableOpacity onPress={() => router.replace('/screens/forgetPassword')}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.orText}>or sign up with</Text>
          <View style={styles.socialIcons}>
            <TouchableOpacity onPress={() => console.log('Google Login')}>
              <Image source={require('../../assets/images/google.png')} style={styles.icon} />
            </TouchableOpacity>
          </View>

          <Text style={styles.signUpText}>
            Don't have an account?{' '}
            <TouchableOpacity onPress={() => router.push('/auth/signUpScreen')}>
              <Text style={styles.signUpLink}>Sign up</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#003366',
    width: '100%',
  },
  container: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    backgroundColor: '#003366',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    marginTop: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 15,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    color: '#000',
  },
  forgotPassword: {
    color: '#003366',
    textAlign: 'right',
    fontSize: 14,
    marginTop: 5,
  },
  signUpText: {
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
  signUpLink: {
    color: '#003366',
    fontWeight: 'bold',
  },
  orText: {
    color: '#555',
    marginVertical: 10,
    textAlign: 'center',
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  backButton: { position: "absolute", top: 40, left: 15, backgroundColor: "rgba(0, 0, 0, 0.5)", padding: 8, borderRadius: 20 },
  
  icon: {
    width: 40,
    height: 40,
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

export default LoginScreen;