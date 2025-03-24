// import * as Notifications from "expo-notifications";
// import { Platform, Alert } from "react-native";

// // Request notification permissions
// export const requestNotificationPermissions = async () => {
//   // try {
//   //   const { status } = await Notifications.requestPermissionsAsync();
//   //   if (status !== "granted") {
//   //     alert("You need to enable notifications to use this feature.");
//   //   }

//   //   if (Platform.OS === "android") {
//   //     await Notifications.setNotificationChannelAsync("default", {
//   //       name: "Default",
//   //       importance: Notifications.AndroidImportance.MAX,
//   //       sound: "default",
//   //     });
//   //   }
//   // } catch (error) {
//   //   console.error("Error requesting notification permissions:", error);
//   // }
// };

// // Register for push notifications and get the Expo push token
// export const registerForPushNotifications = async () => {
//   // try {
//   //   const { status } = await Notifications.getPermissionsAsync();
//   //   console.log("Notification permission status:", status);

//   //   if (status !== "granted") {
//   //     alert("Permission to receive notifications was denied.");
//   //     return null;
//   //   }

//   //   const token = (await Notifications.getExpoPushTokenAsync()).data;
//   //   console.log("Expo Push Token:", token);
//   //   return token;
//   // } catch (error) {
//   //   console.error("Error getting Expo push token:", error);
//   //   return null;
//   // }
// };

// // Send a push notification using Expo's API
// export const sendPushNotification = async (expoPushToken, title, message) => {
//   try {
//     console.log("Sending push notification to:", expoPushToken);
//     console.log("Notification title:", title);
//     console.log("Notification message:", message);
//     // const response = await fetch("https://exp.host/--/api/v2/push/send", {
//     //   method: "POST",
//     //   headers: {
//     //     "Content-Type": "application/json",
//     //   },
//     //   body: JSON.stringify({
//     //     to: expoPushToken,
//     //     title: title,
//     //     body: message,
//     //     sound: "default",
//     //   }),
//     // });

//     // const result = await response.json();
//     // console.log("Push Notification Response:", result);

//     // if (result.errors) {
//     //   console.error("Failed to send push notification:", result.errors);
//     // }
//   } catch (error) {
//     console.error("Error sending push notification:", error);
//   }
// };

// // Schedule a local notification
// export const scheduleNotification = async (title, body, seconds) => {
//   try {
//     // await Notifications.scheduleNotificationAsync({
//     //   content: {
//     //     title,
//     //     body,
//     //     sound: "default",
//     //   },
//     //   trigger: {
//     //     seconds,
//     //     repeats: false,
//     //   },
//     // });
//   } catch (error) {
//     console.error("Error scheduling notification:", error);
//   }
// };

// // // Handle foreground notifications
// // export const setupNotificationListener = () => {
// //   return Notifications.addNotificationReceivedListener((notification) => {
// //     console.log("Notification received:", notification);
    
// //     if (notification.request.content.title && notification.request.content.body) {
// //       Alert.alert(notification.request.content.title, notification.request.content.body);
// //     }
// //   });
// // };