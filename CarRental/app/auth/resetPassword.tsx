import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { AppConstants } from '@/constants/appConstants';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { token } = useLocalSearchParams();

  const handleResetPassword = async () => {
    if (!token) {
      Alert.alert('Error', 'Invalid reset token');
      return;
    }

    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      
      const response = await axios.post(`${AppConstants.LOCAL_URL}/auth/reset-password/${token}`, { 
        password 
      });
      
      if (response.data.success) {
        Alert.alert(
          'Success', 
          'Password reset successful. You can now login with your new password.',
          [{ text: 'OK', onPress: () => router.replace('/auth/loginScreen') }]
        );
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Something went wrong';
      setMessage(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Enter your new password</Text>
      
      <TextInput
        style={styles.input}
        placeholder="New Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      
      {message ? <Text style={styles.message}>{message}</Text> : null}
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleResetPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Reset Password</Text>
        )}
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
    