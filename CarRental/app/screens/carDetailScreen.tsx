// import React, { useState, useEffect, useRef } from 'react';
// import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
// import { useRoute, RouteProp } from '@react-navigation/native';
// import { Camera, CameraType } from 'expo-camera';
// import * as ImagePicker from 'expo-image-picker';
// import AppLayout from './AppLayout';

// type CarProps = {
//   name: string;
//   image: any;
//   price: string;
//   fuel: string;
//   maxSpeed: string;
//   rating?: number;
// };

// type RootStackParamList = {
//   CarDetailScreen: { car: CarProps };
// };

// const CarDetailScreen = () => {
//   const route = useRoute<RouteProp<RootStackParamList, 'CarDetailScreen'>>();
//   const { car } = route.params;
//   const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
//   const [hasGalleryPermission, setHasGalleryPermission] = useState<boolean | null>(null);
//   const [cameraType, setCameraType] = useState<CameraType>(CameraType.back);
//   const [selectedImage, setSelectedImage] = useState<string | null>(null);
//   const cameraRef = useRef<Camera>(null);

//   useEffect(() => {
//     (async () => {
//       const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
//       const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
//       setHasCameraPermission(cameraStatus === 'granted');
//       setHasGalleryPermission(galleryStatus === 'granted');
//     })();
//   }, []);

//   const takePicture = async () => {
//     if (cameraRef.current) {
//       const photo = await cameraRef.current.takePictureAsync();
//       setSelectedImage(photo.uri);
//     }
//   };

//   const pickImage = async () => {
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [4, 3],
//       quality: 1,
//     });

//     if (!result.canceled) {
//       setSelectedImage(result.assets[0].uri);
//     }
//   };

//   if (hasCameraPermission === null || hasGalleryPermission === null) {
//     return <View />;
//   }
//   if (hasCameraPermission === false) {
//     return <Text>No access to camera</Text>;
//   }

//   return (
//     <AppLayout title={car.name}>
//       <View style={styles.container}>
//         {/* Camera Preview */}
//         <Camera style={styles.camera} type={cameraType} ref={cameraRef}>
//           <View style={styles.cameraButtonContainer}>
//             <TouchableOpacity style={styles.cameraButton} onPress={takePicture}>
//               <Text style={styles.cameraButtonText}>Capture</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
//               <Text style={styles.cameraButtonText}>Pick from Gallery</Text>
//             </TouchableOpacity>
//           </View>
//         </Camera>

//         {/* Display Captured or Selected Image */}
//         {selectedImage ? (
//           <Image source={{ uri: selectedImage }} style={styles.image} />
//         ) : (
//           <Image source={car.image} style={styles.image} />
//         )}

//         {/* Car Name and Rating */}
//         <View style={styles.carInfo}>
//           <Text style={styles.name}>{car.name}</Text>
//           <Text style={styles.rating}>⭐ {car.rating} Stars</Text>
//         </View>

//         {/* Features Section */}
//         <Text style={styles.sectionTitle}>Features</Text>
//         <View style={styles.features}>
//           <View style={styles.featureBox}>
//             <Text style={styles.featureTitle}>Max Speed</Text>
//             <Text style={styles.featureText}>{car.maxSpeed} KMPH</Text>
//           </View>
//           <View style={styles.featureBox}>
//             <Text style={styles.featureTitle}>Fuel Type</Text>
//             <Text style={styles.featureText}>{car.fuel}</Text>
//           </View>
//         </View>

//         {/* Pickup Location */}
//         <Text style={styles.sectionTitle}>Pickup Location</Text>
//         <View style={styles.picker}>
//           <Text>Eme Society, Lahore</Text>
//         </View>

//         {/* Pickup Date */}
//         <Text style={styles.sectionTitle}>Pickup Date</Text>
//         <View style={styles.picker}>
//           <Text>Dec 01th, Sunday</Text>
//         </View>

//         {/* Price and Booking Button */}
//         <View style={styles.footer}>
//           <Text style={styles.price}>4,599/day</Text>
//           <TouchableOpacity style={styles.bookButton}>
//             <Text style={styles.bookButtonText}>Book Now</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </AppLayout>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//     padding: 20,
//   },
//   camera: {
//     width: '100%',
//     height: 200,
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   cameraButtonContainer: {
//     flex: 1,
//     backgroundColor: 'transparent',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-end',
//     marginBottom: 20,
//     paddingHorizontal: 20,
//   },
//   cameraButton: {
//     backgroundColor: '#fff',
//     padding: 10,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   galleryButton: {
//     backgroundColor: '#ddd',
//     padding: 10,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   cameraButtonText: {
//     fontSize: 14,
//     fontWeight: 'bold',
//   },
//   image: {
//     width: '100%',
//     height: 200,
//     borderRadius: 10,
//     marginTop: 10,
//   },
//   carInfo: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginVertical: 10,
//   },
//   name: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   rating: {
//     fontSize: 16,
//     color: '#FFD700',
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginVertical: 10,
//   },
//   features: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   featureBox: {
//     backgroundColor: '#fff',
//     padding: 10,
//     borderRadius: 8,
//     alignItems: 'center',
//     width: '48%',
//   },
//   featureTitle: {
//     fontSize: 14,
//     fontWeight: 'bold',
//   },
//   featureText: {
//     fontSize: 14,
//     color: 'gray',
//   },
//   picker: {
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     marginBottom: 10,
//     padding: 10,
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   price: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   bookButton: {
//     backgroundColor: '#007bff',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//   },
//   bookButtonText: {
//     color: '#fff',
//     fontSize: 16,
//   },
// });

// export default CarDetailScreen;
