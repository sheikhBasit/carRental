// app/start.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../../components/ui/Button';

const StartScreen: React.FC = () => {
    const[permission,setPermission]=useState(false);
    const router = useRouter();
    
    if(!permission){
        <View></View>
    }
    return (
        <ImageBackground source={require('../../assets/images/background.png')} style={styles.background}>
            <View style={styles.container}>
                <Text style={styles.title}>Start your car sharing business</Text>
                <Text style={styles.subtitle}>DriveFleet - Let's Start</Text>
                <Button
                    title="Rent a Car"
                    onPress={() => 
                        {
                        console.log('Become a renter');
                      router.replace('/auth/loginScreen')}}
                    style={styles.button}
                />
                <Button
                    title="Become a Host"
                    onPress={() => {
                        console.log('Become a host');
                        router.push('/rentalAuth/rentalLoginScreen');
                      }}
                    style={styles.button}
                />
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        width: '100%',
        height: '80%',
        color: '#fff',
        backgroundColor: '#003366',

    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#000',
        textAlign: 'center',
        marginBottom: 40,
    },
    button: {
        width: '80%',
        marginBottom: 20,
        color: "#003366"
    },
});

export default StartScreen;
