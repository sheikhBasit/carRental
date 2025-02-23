import React from "react";
import { View, ScrollView, Text, StyleSheet, Image } from "react-native";
import { Appbar } from "react-native-paper";
import { router } from "expo-router";

const AboutScreen = () => {
  return (
    <View style={styles.container}>
      {/* App Bar */}
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="About Us" />
      </Appbar.Header>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <Image 
          source={{ uri: "https://source.unsplash.com/600x300/?team,work" }} 
          style={styles.image}
        />

        <Text style={styles.title}>Who We Are</Text>
        <Text style={styles.text}>
          We are a passionate team dedicated to providing top-quality car rental services. 
          Our mission is to make renting a car easier, faster, and more convenient for everyone.
        </Text>

        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.text}>
          Our goal is to provide reliable and affordable car rental solutions, ensuring 
          customer satisfaction through excellent service and a seamless booking experience.
        </Text>

        <Text style={styles.sectionTitle}>Why Choose Us?</Text>
        <Text style={styles.text}>✅ Wide variety of vehicles to choose from</Text>
        <Text style={styles.text}>✅ Affordable and transparent pricing</Text>
        <Text style={styles.text}>✅ 24/7 customer support</Text>
        <Text style={styles.text}>✅ Easy and fast booking process</Text>

        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Text style={styles.text}>📧 Email: support@example.com</Text>
        <Text style={styles.text}>📞 Phone: +1 234 567 890</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: "#555",
    marginBottom: 10,
  },
});

export default AboutScreen;
