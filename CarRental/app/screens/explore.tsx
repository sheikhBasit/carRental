// import React, { useState, useEffect } from "react";
// import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, ActivityIndicator } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import { StackNavigationProp } from "@react-navigation/stack";
// import AppLayout from "../../screens/AppLayout";
// import { loadUserId } from "@/utils/storageUtil";
// import { AppConstants } from "@/constants/appConstants";
// // import { requestNotificationPermissions, scheduleNotification, registerForPushNotifications, sendPushNotification }  from "@/utils/useNotification"; // Import the hook

// type CarProps = {
//   id: string;
//   name: string;
//   image: string;
//   price: string;
//   fromDate: string;
//   toDate: string;
//   rentalCompany: string;
//   capacity: number;
// };

// type RootStackParamList = {
//   CarDetailScreen: { car: CarProps };
// };

// const HomeScreen = () => {
//   const navigation = useNavigation<StackNavigationProp<RootStackParamList, "CarDetailScreen">>();
//   const [cars, setCars] = useState<CarProps[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [userId, setUserId] = useState<string | null>(null);


//   useEffect(() => {
//     const fetchUserId = async () => {
//       const storedUserId = await loadUserId();
      
//       if (storedUserId) {
//         setUserId(storedUserId);
//         fetchBookings(storedUserId);
//       } else {
//         setLoading(false);
//       }
//     };

//     fetchUserId();

//     // Request notification permissions
//     // requestNotificationPermissions();
//   }, []);

//   const fetchBookings = async (userId: string) => {
//     try {
//       const response = await fetch(
//         `${AppConstants.LOCAL_URL}/bookings/userBookings?userId=${userId}&status=ongoing`
//       );

//       if (!response.ok) {
//         if (response.status === 404) {
//           setCars([]); // Set cars to an empty array
//           return;
//         }
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }

//       const data = await response.json();

//       if (!Array.isArray(data)) {
//         throw new Error("Invalid response format: Expected an array");
//       }

//       // Format data to match CarProps
//       const formattedCars = data.map((booking: any) => {
//         const vehicle = booking.idVehicle || {};
//         const company = booking.company || {};

//         return {
//           id: booking._id || "N/A",
//           name: `${vehicle.manufacturer || "Unknown"} ${vehicle.model || ""}`.trim(),
//           image: vehicle.carImageUrl || "https://via.placeholder.com/150",
//           price: vehicle.rent || "N/A",
//           fromDate: booking.from || "N/A",
//           toDate: booking.to || "N/A",
//           rentalCompany: company.companyName || "Unknown",
//           capacity: vehicle.capacity || "N/A",
//         };
//       });

//       setCars(formattedCars);
//     } catch (error) {
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const navigateToBookNow = (car: CarProps) => {
//     navigation.navigate("CarDetailScreen", { car });
//   };

//   return (
//     <AppLayout title="Home">
//       <View style={styles.container}>
//         {loading ? (
//           <ActivityIndicator size="large" color="#FFF" />
//         ) : cars.length === 0 ? (
//           <Text style={styles.noDataText}>No ongoing bookings found.</Text>
//         ) : (
//           <FlatList
//             data={cars}
//             keyExtractor={(item) => item.id}
//             renderItem={({ item }) => (
//               <TouchableOpacity onPress={() => navigateToBookNow(item)} style={styles.card}>
//                 <Image source={{ uri: item.image }} style={styles.carImage} />
//                 <View style={styles.cardContent}>
//                   <Text style={styles.carName}>{item.name}</Text>
//                   <Text style={styles.carPrice}>${item.price} per day</Text>
//                   <View style={styles.infoRow}>
//                     <Text style={styles.label}>Rental Company:</Text>
//                     <Text style={styles.value}>{item.rentalCompany}</Text>
//                   </View>
//                   <View style={styles.infoRow}>
//                     <Text style={styles.label}>Capacity:</Text>
//                     <Text style={styles.value}>{item.capacity} seats</Text>
//                   </View>
//                   <View style={styles.infoRow}>
//                     <Text style={styles.label}>Booking Dates:</Text>
//                     <Text style={styles.value}>
//                       {item.fromDate} → {item.toDate}
//                     </Text>
//                   </View>
//                 </View>
//               </TouchableOpacity>
//             )}
//           />
//         )}
//       </View>
//     </AppLayout>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#003366",
//     padding: 10,
//   },
//   card: {
//     backgroundColor: "#1E5A82",
//     borderRadius: 10,
//     overflow: "hidden",
//     marginBottom: 15,
//   },
//   carImage: {
//     width: "100%",
//     height: 150,
//   },
//   cardContent: {
//     padding: 15,
//   },
//   carName: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#FFF",
//   },
//   carPrice: {
//     fontSize: 16,
//     color: "#ADD8E6",
//     marginTop: 5,
//   },
//   infoRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 5,
//   },
//   label: {
//     fontSize: 14,
//     color: "#ADD8E6",
//     fontWeight: "600",
//   },
//   value: {
//     fontSize: 14,
//     color: "#FFF",
//   },
//   noDataText: {
//     fontSize: 18,
//     color: "#FFF",
//     textAlign: "center",
//     marginTop: 20,
//   },
// });

// export default HomeScreen;