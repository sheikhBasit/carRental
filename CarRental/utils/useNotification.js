// useNotifications.js
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

export const useNotifications = () => {
  const navigation = useNavigation();

  // Request notification permissions
  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      alert("You need to enable notifications to use this feature.");
    }
  };

  // Set the notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true, // Show an alert when the notification is received
      shouldPlaySound: true, // Play a sound when the notification is received
      shouldSetBadge: true, // Set the app badge count
    }),
  });

  // Listen for notification events
  useEffect(() => {
    const subscriptionReceived = Notifications.addNotificationReceivedListener((notification) => {
      console.log("Notification received:", notification);
    });

    const subscriptionResponse = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification tapped:", response);
      // Navigate to a specific screen when the notification is tapped
      navigation.navigate("Bookings");
    });

    return () => {
      subscriptionReceived.remove(); // Clean up the listener
      subscriptionResponse.remove(); // Clean up the listener
    };
  }, [navigation]);

  // Schedule a notification
  const scheduleNotification = async (title, body, seconds) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: "default",
      },
      trigger: {
        seconds, // Show the notification after X seconds
      },
    });
  };

  return { requestNotificationPermissions, scheduleNotification };
};