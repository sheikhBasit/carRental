import React from "react";
import { View, ScrollView, Text, StyleSheet, Image } from "react-native";
import { Appbar } from "react-native-paper";
import { router } from "expo-router";

const AboutScreen = () => {
  return (
    <View style={styles.container}>
      {/* App Bar */}
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction color="#fff" onPress={() => router.back()} />
        <Appbar.Content title="About Us" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={styles.title}>Who We Are</Text>
        <Text style={styles.text}>
          We are a dedicated team providing premium car rental services across Pakistan.
          Our mission is to make car rentals easier, faster, and more convenient for
          Pakistani citizens and visitors alike.
        </Text>

        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.text}>
          We aim to provide reliable and affordable car rental solutions throughout Pakistan,
          ensuring customer satisfaction through excellent service, local knowledge, and a
          seamless booking experience.
        </Text>

        <Text style={styles.sectionTitle}>Why Choose Us?</Text>
        <Text style={styles.text}>✅ Wide service coverage across major Pakistani cities including Karachi, Lahore, Islamabad, and Peshawar</Text>
        <Text style={styles.text}>✅ Diverse fleet including popular local models like Suzuki Cultus, Toyota Corolla, Honda City, and luxury options</Text>
        <Text style={styles.text}>✅ Affordable and transparent pricing in PKR with no hidden charges</Text>
        <Text style={styles.text}>✅ 24/7 customer support available in both English and Urdu</Text>
        <Text style={styles.text}>✅ Easy booking with multiple payment options including JazzCash and EasyPaisa</Text>

        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Text style={styles.text}>📧 Email: support@carrent.pk</Text>
        <Text style={styles.text}>📞 Phone: 0300-1234567</Text>
        <Text style={styles.text}>🏢 Office: Block 7, Gulshan Iqbal, Karachi</Text>
        <Text style={styles.text}>🌐 Website: www.carrent.pk</Text>
        
        {/* Pakistani social media links */}
        <View style={styles.socialSection}>
          <Text style={styles.socialText}>Follow us on:</Text>
          <Text style={styles.socialText}>Facebook | Instagram | WhatsApp</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#01411c", // Pakistan green color
    marginBottom: 15,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#01411c", // Pakistan green color
    marginTop: 25,
    marginBottom: 10,
  },
  text: {
    fontSize: 15,
    color: "#444",
    marginBottom: 10,
    lineHeight: 22,
  },
  socialSection: {
    marginTop: 25,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    alignItems: "center",
  },
  socialText: {
    fontSize: 14,
    color: "#444",
    marginBottom: 5,
  }
});

export default AboutScreen;