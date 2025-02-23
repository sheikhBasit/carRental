import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InputField from '../../components/ui/InputField';
import Button from '../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';

const RentalLoginScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async () => {
        console.log('Logging in with:', email, password);
        await AsyncStorage.setItem('isLoggedIn', "true");
        const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
        console.log("Iasldnsa ",isLoggedIn);
        if (isLoggedIn) {
            console.log('Logged in');
            router.push('/(rental-tabs)/addCarScreen');
        } else {
            console.log('Not Logged In');
        }
    };

    const handleGoogleLogin = () => {
        console.log('Logging in with Google');
    };

    const handleForgetPassword = () => {
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
                    
                    <Button title="Log In" onPress={handleLogin} style={styles.loginButton} />

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
