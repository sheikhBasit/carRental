import React, { useState,useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InputField from '../../components/ui/InputField';
import Button from '../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { AppConstants } from '@/constants/appConstants';
import { loadCompanyId, saveCompanyId, saveCompanyName } from '@/utils/storageUtil';
// import { registerForPushNotifications}  from '@/utils/useNotification';

const RentalLoginScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [companyId,setCompanyId] = useState('');
    const [isLoading,setIsLoading] = useState(false);
    const router = useRouter();
    useEffect(() => {
        // Load city from AsyncStorage when the component mounts
        const fetchCompanyId = async () => {
            const storedCity = await loadCompanyId();
            if (storedCity) {
                setCompanyId(storedCity);
            }
        };
        fetchCompanyId();
    }, []);

    const handleLogin = async () => {
        try {
            const response = await fetch(`${AppConstants.LOCAL_URL}/rental-companies/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });
    
            const data = await response.json();
            
            if (response.ok) {
                await AsyncStorage.setItem('accessToken', data.token);
                console.log('Login successful:', data);
                await AsyncStorage.setItem('isLoggedIn', "true");
                // Store companyId if returned from API
            //     const expoPushToken = await registerForPushNotifications();
            // console.log('Expo Push Token:', expoPushToken);
            // if (expoPushToken) {
            //   await storeExpoPushToken(data.company._id, expoPushToken);
            // }
      
                if (data.company._id) {
                    await saveCompanyId(data.company._id);
                    setCompanyId(data.company._id);
                    await saveCompanyName(data.company.companyName);
                    
                }
                router.push('/(rental-tabs)');
            } else {
                console.log('Login failed:', data.message);
                alert('Login failed: ' + data.message);
            }
        } catch (error) {
            console.log('Error logging in:', error);
            alert('Something went wrong. Please try again later.');
        }
    };

    const storeExpoPushToken = async (companyId:string, expoPushToken:string) => {
        try {
            const fcmToken = expoPushToken;
          const response = await fetch(`${AppConstants.LOCAL_URL}/rental-companies/${companyId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fcmToken }),
          });
      
          const data = await response.json();
          if (response.ok) {
            console.log('Expo push token updated successfully:', data);
          } else {
            console.log('Failed to update Expo push token:', data.message);
          }
        } catch (error) {
          console.log('Error updating Expo push token:', error);
        }
      };
    

    const handleGoogleLogin = () => {
        console.log('Logging in with Google');
    };

    const handleForgetPassword = () => {
        console.log('Forgot Password');
    };

    const handleSignUp = () => {
        router.push('/rentalAuth/rentalSignUpScreen');
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.push('/auth/startScreen')}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>

                <Image source={require('../../assets/images/login.png')} style={styles.image} />
                <Text style={styles.title}>Ready to rent your car?</Text>
                
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

                    <TouchableOpacity onPress={handleForgetPassword}>
                        <Text style={styles.forgotPassword}>Forgot Password?</Text>
                    </TouchableOpacity>
                    
             {/* Sign Up Button with Loader */}
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
                    <Text style={styles.signUpText}>
                        Don't have an account?{' '}
                        <TouchableOpacity onPress={handleSignUp}>
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
    },
    container: {
        flex: 1,
        width: '100%',
        paddingHorizontal: 20,
        backgroundColor: '#003366',
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
    },
    image: {
        width: '100%',
        height: 180,
        resizeMode: 'contain',
        marginTop: 80,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginVertical: 15,
        textAlign: 'center',
    },
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
    loginButton: {
        width: '100%',
        marginTop: 20,
        backgroundColor: '#003366',
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
    icon: {
        width: 40,
        height: 40,
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
});

export default RentalLoginScreen;
