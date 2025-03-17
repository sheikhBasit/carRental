import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InputField from '../../components/ui/InputField';
import Button from '../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { AppConstants } from '@/constants/appConstants';
import { getStoredUserId, loadCity, loadUserId, saveUserId } from '@/utils/storageUtil';

const LoginScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const [city, setCity] = useState('');
    const [userId, setUserId] = useState('');
    const [isLoading, setIsLoading] = useState(false); // State for loader

    useEffect(() => {
        // Load city and userId from AsyncStorage when the component mounts
        const fetchCity = async () => {
            try {
                const storedCity = await loadCity();
                if (storedCity) {
                    setCity(storedCity); // Update city state
                }
            } catch (error) {
                console.error("Error loading city:", error);
            }
        };

        const fetchUserId = async () => {
            try {
       
                const storedUserId = await loadUserId();
                const stuserId = await getStoredUserId();

                if (storedUserId) {
                    setUserId(storedUserId); // Update userId state
                }
                
            } catch (error) {
                console.error("Error loading user id:", error);
            }
        };

        fetchCity();
        fetchUserId();
    }, []);

    const handleLogin = async () => {
        console.log('Logging in with:', email, password);
        setIsLoading(true); // Start loading

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
                // Save login status and user data to AsyncStorage
                await AsyncStorage.setItem('isLoggedIn', 'true');
                await AsyncStorage.setItem('userData', JSON.stringify(data.user));

                // Update state with city and userId
                setCity(data.user.city); // Update city state
                setUserId(data.user._id); // Update userId state
                await saveUserId(data.user._id);
                const uId = await getStoredUserId()
                console.log('City:', data.user.city);
                console.log('User ID:', data.user._id);
                console.log('City:', uId);

                console.log('Logged in successfully');
                router.push('/(drawer)/(tabs)');
            } else {
                console.log('Login failed:', data.message);
                alert(data.message); // Show error message
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false); // Stop loading regardless of success or failure
        }
    };

    const handleGoogleLogin = () => {
        console.log('Logging in with Google');
    };

    const handleForgetPassword = () => {
        router.replace('/screens/forgetPassword');
        console.log('Forgot Password');
    };

    const handleSignUp = () => {
        router.push('/auth/signUpScreen');
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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
                        <TouchableOpacity onPress={handleGoogleLogin}>
                            <Image source={require('../../assets/images/google.png')} style={styles.icon} />
                        </TouchableOpacity>
                    </View>

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

export default LoginScreen;