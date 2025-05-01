import React from "react";
import { View, ScrollView, Text, StyleSheet, Linking, Image } from "react-native";
import { Appbar, Button } from "react-native-paper";
import { router } from "expo-router";

const ContactScreen = () => {
  const handleEmailPress = () => {
    Linking.openURL("mailto:support@carrent.pk");
  };
  
  const handlePhonePress = () => {
    Linking.openURL("tel:+923001234567");
  };
  
  const handleWhatsAppPress = () => {
    Linking.openURL("https://wa.me/923001234567");
  };
  
  const handleLocationPress = () => {
    Linking.openURL("https://maps.google.com/?q=Block+7+Gulshan+Iqbal+Karachi");
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction color="#fff" onPress={() => router.back()} />
        <Appbar.Content title="Contact Us" titleStyle={styles.appbarTitle} />
      </Appbar.Header>
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Get in Touch</Text>
        <Text style={styles.text}>
          If you have any questions about car rentals in Pakistan or need support with your booking,
          feel free to reach out to our customer service team.
        </Text>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <Text style={styles.contactLabel}>Email:</Text>
          <Text style={styles.text}>support@carrent.pk</Text>
          <Button 
            mode="contained" 
            style={styles.button} 
            onPress={handleEmailPress}
            icon="email"
          >
            Email Us
          </Button>
          
          <Text style={styles.contactLabel}>Phone:</Text>
          <Text style={styles.text}>0300-1234567 (Mon-Sat, 9am to 8pm)</Text>
          <Button 
            mode="contained" 
            style={styles.button} 
            onPress={handlePhonePress}
            icon="phone"
          >
            Call Us
          </Button>
          
          <Text style={styles.contactLabel}>WhatsApp:</Text>
          <Text style={styles.text}>0300-1234567 (Available 24/7)</Text>
          {/* <Button 
            mode="contained" 
            style={styles.whatsappButton} 
            onPress={handleWhatsAppPress}
            icon="whatsapp"
          >
            Message on WhatsApp
          </Button> */}
        </View>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Visit Our Office</Text>
          <Text style={styles.text}>Block 7, Gulshan Iqbal</Text>
          <Text style={styles.text}>Karachi, Sindh</Text>
          <Text style={styles.text}>Pakistan</Text>
          <Button 
            mode="contained" 
            style={styles.locationButton} 
            onPress={handleLocationPress}
            icon="map-marker"
          >
            View on Google Maps
          </Button>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Office Hours</Text>
          <Text style={styles.text}>Monday - Saturday: 9:00 AM to 8:00 PM</Text>
          <Text style={styles.text}>Friday: 9:00 AM to 12:30 PM, 2:30 PM to 8:00 PM</Text>
          <Text style={styles.text}>Sunday: Closed</Text>
        </View>
        
        <View style={styles.emergencySection}>
          <Text style={styles.emergencyTitle}>24/7 Roadside Assistance</Text>
          <Text style={styles.text}>For emergencies and roadside assistance:</Text>
          <Text style={styles.emergencyNumber}>0311-1234567</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  appbar: {
    backgroundColor: "#003366", // Pakistan green color
  },
  appbarTitle: {
    color: "#fff",
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#01411c",
    marginBottom: 15,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginVertical: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#01411c",
    marginBottom: 15,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#444",
    marginTop: 10,
  },
  text: {
    fontSize: 15,
    color: "#555",
    marginBottom: 5,
  },
  button: {
    marginVertical: 10,
    backgroundColor: "#003366", // Pakistan green
    marginBottom: 20,
  },
  whatsappButton: {
    marginVertical: 10,
    backgroundColor: "#25D366", // WhatsApp green
    marginBottom: 20,
  },
  locationButton: {
    marginVertical: 10,
    backgroundColor: "#4285F4", // Google blue
  },
  emergencySection: {
    backgroundColor: "#ffe8e8",
    borderRadius: 8,
    padding: 16,
    marginVertical: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#e74c3c",
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#c0392b",
    marginBottom: 10,
  },
  emergencyNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#e74c3c",
    marginTop: 5,
    marginBottom: 10,
  }
});

export default ContactScreen;