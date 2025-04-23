import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ImageBackground, 
  StatusBar,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/ui/Button';

const { width, height } = Dimensions.get('window');

const StartScreen: React.FC = () => {
  const [permission, setPermission] = useState(true);
  const router = useRouter();
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const buttonAnim = new Animated.Value(0);
  
  useEffect(() => {
    // Request permissions here if needed
    // For demo purposes, we're setting permission to true
    
    // Animations sequence
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true
        })
      ]),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      })
    ]).start();
    
  }, []);

  if (!permission) {
    // Instead of empty view, show permission request
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Permission Required</Text>
        <Text style={styles.permissionText}>
          DriveFleet needs permission to continue. This helps us provide you with the best car sharing experience.
        </Text>
        <Button
          title="Grant Permission"
          onPress={() => setPermission(true)}
          style={styles.permissionButton}
        />
      </SafeAreaView>
    );
  }

  const handleRenterPress = () => {
    console.log('Become a renter');
    // Add haptic feedback here if desired
    router.replace('/auth/loginScreen');
  };

  const handleHostPress = () => {
    console.log('Become a host');
    // Add haptic feedback here if desired
    router.push('/rentalAuth/rentalLoginScreen');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ImageBackground 
        source={require('../../assets/images/background.png')} 
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,51,102,0.8)']}
          style={styles.gradient}
        >
          {/* Logo and Top Content */}
          <Animated.View 
            style={[
              styles.topContent, 
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }] 
              }
            ]}
          >
            <View style={styles.logoContainer}>
              <Ionicons name="car-sport" size={50} color="#fff" />
              <Text style={styles.logoText}>DriveFleet</Text>
            </View>
            <Text style={styles.title}>Start your car sharing business</Text>
            <Text style={styles.subtitle}>Fast, Reliable, Convenient</Text>
          </Animated.View>

          {/* Middle content - can add feature highlights here */}
          <View style={styles.middleContent}>
            <Animated.View 
              style={[styles.featureItem, { opacity: fadeAnim }]}
            >
              <Ionicons name="cash-outline" size={24} color="#fff" />
              <Text style={styles.featureText}>Earn money sharing your car</Text>
            </Animated.View>
            <Animated.View 
              style={[styles.featureItem, { opacity: fadeAnim }]}
            >
              <Ionicons name="shield-checkmark-outline" size={24} color="#fff" />
              <Text style={styles.featureText}>Insurance coverage included</Text>
            </Animated.View>
            <Animated.View 
              style={[styles.featureItem, { opacity: fadeAnim }]}
            >
              <Ionicons name="people-outline" size={24} color="#fff" />
              <Text style={styles.featureText}>Growing community of drivers</Text>
            </Animated.View>
          </View>

          {/* Bottom Buttons */}
          <Animated.View 
            style={[
              styles.buttonsContainer,
              {
                opacity: buttonAnim,
                transform: [{ translateY: Animated.multiply(buttonAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0]
                }), -1) }]
              }
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.buttonRenter}
              onPress={handleRenterPress}
            >
              <LinearGradient
                colors={['#4a90e2', '#356cb1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Ionicons name="car-outline" size={22} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Rent a Car</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.buttonHost}
              onPress={handleHostPress}
            >
              <LinearGradient
                colors={['#ffffff', '#f0f0f0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Ionicons name="home-outline" size={22} color="#003366" style={styles.buttonIcon} />
                <Text style={styles.buttonTextDark}>Become a Host</Text>
              </LinearGradient>
            </TouchableOpacity>
            
          </Animated.View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  topContent: {
    alignItems: 'center',
    marginTop: height * 0.08,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
  middleContent: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
  },
  featureText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: height * 0.05,
    paddingHorizontal: 10,
  },
  buttonRenter: {
    width: '100%',
    height: 56,
    marginBottom: 16,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonHost: {
    width: '100%',
    height: 56,
    marginBottom: 16,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  buttonTextDark: {
    fontSize: 18,
    fontWeight: '600',
    color: '#003366',
  },
  buttonIcon: {
    marginRight: 8,
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    color: '#fff',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  // Permission screen styles
  permissionContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#003366',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
    color: '#555',
  },
  permissionButton: {
    width: '80%',
    backgroundColor: '#003366',
  }
});

export default StartScreen;