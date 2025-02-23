import React from "react";
import { View, ScrollView, Text, StyleSheet, Linking } from "react-native";
import { Appbar, Button } from "react-native-paper";
import { router } from "expo-router";

const ContactScreen = () => {
  const handleEmailPress = () => {
    Linking.openURL("mailto:support@example.com");
  };

  const handlePhonePress = () => {
    Linking.openURL("tel:+1234567890");
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Contact Us" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Get in Touch</Text>
        <Text style={styles.text}>
          If you have any questions or need support, feel free to reach out to us.
        </Text>

        <Text style={styles.sectionTitle}>Contact Information</Text>
        <Text style={styles.text}>📧 Email: support@example.com</Text>
        <Button mode="contained" style={styles.button} onPress={handleEmailPress}>
          Email Us
        </Button>

        <Text style={styles.text}>📞 Phone: +1 234 567 890</Text>
        <Button mode="contained" style={styles.button} onPress={handlePhonePress}>
          Call Us
        </Button>
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
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
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
  button: {
    marginVertical: 10,
    backgroundColor: "#007AFF",
  },
});

export default ContactScreen;
