import React from "react";
import { View, ScrollView, Text, StyleSheet } from "react-native";
import { Appbar } from "react-native-paper";
import { router } from "expo-router";

const TermsScreen = () => {
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Terms & Conditions" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Terms & Conditions</Text>
        <Text style={styles.text}>
          Welcome to our application. By using our services, you agree to comply with our terms and conditions.
        </Text>
        <Text style={styles.text}>1. You must be at least 18 years old to use our services.</Text>
        <Text style={styles.text}>2. We reserve the right to update or modify these terms at any time.</Text>
        <Text style={styles.text}>3. Any misuse of our services will lead to termination of your account.</Text>
        <Text style={styles.text}>4. Your data will be used according to our Privacy Policy.</Text>
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
  },
  text: {
    fontSize: 16,
    color: "#555",
    marginBottom: 10,
  },
});

export default TermsScreen;
