import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';
import { AppConstants } from '@/constants/appConstants';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      
      const response = await axios.post(`${AppConstants.LOCAL_URL}/auth/forgot-password`, { email });
      
      if (response.data.success) {
        setMessage('Password reset link sent to your email');
        Alert.alert(
          'Success', 
          'Password reset link sent to your email',
          [{ text: 'OK', onPress: () => router.replace('/auth/loginScreen') }]
        );
      }
    } catch (error:any) {
      const errorMessage = error.response?.data?.message || 'Something went wrong';
      setMessage(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>Enter your email to receive a password reset link</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      {message ? <Text style={styles.message}>{message}</Text> : null}
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleForgotPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Send Reset Link</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.linkButton}
        onPress={() => router.replace('/auth/loginScreen')}
      >
        <Text style={styles.linkText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}
// Styles
const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: '#666',
      marginBottom: 30,
      textAlign: 'center',
    },
    input: {
      backgroundColor: '#fff',
      borderRadius: 5,
      padding: 15,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: '#ddd',
    },
    button: {
      backgroundColor: '#007BFF',
      borderRadius: 5,
      padding: 15,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    message: {
      marginVertical: 10,
      color: '#28a745',
      textAlign: 'center',
    },
    linkButton: {
      marginTop: 20,
      alignItems: 'center',
    },
    linkText: {
      color: '#007BFF',
      fontSize: 16,
    },
  });
  