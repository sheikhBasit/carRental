import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import RentalAppLayout from '@/app/screens/rentalAppLayout';
import { AppConstants } from '@/constants/appConstants';
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

type CarDetails = {
  manufacturer: string;
  model: string;
  numberPlate: string;
  rent: number;
  capacity: number;
  transmission: string;
  carImageUrls: string[];
  [key: string]: string | number | string[];
};

const EditCarScreen = () => {
  const { carId } = useLocalSearchParams<{ carId: string }>();
  const navigation = useNavigation();

  const [carDetails, setCarDetails] = useState<CarDetails>({
    manufacturer: '',
    model: '',
    numberPlate: '',
    rent: 0,
    capacity: 0,
    transmission: 'Manual',
    carImageUrls: [],
  });

  const [carImages, setCarImages] = useState<string[]>([]);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = React.useRef<CameraView>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await fetch(`${AppConstants.LOCAL_URL}/vehicles/${carId}`);
        const data = await response.json();

        if (response.ok) {
          setCarDetails(data);
          setCarImages(data.carImageUrls);
        } else {
          Alert.alert('Error', 'Failed to fetch car details.');
        }
      } catch (error) {
        console.error('Error fetching car details:', error);
        Alert.alert('Error', 'An error occurred while fetching car details.');
      }
    };

    fetchCarDetails();
  }, [carId]);

  const handleChange = (name: keyof CarDetails, value: string) => {
    if (name === 'manufacturer' && !/^[a-zA-Z\s]+$/.test(value)) {
      return; // Prevent input if it contains non-alphabet characters
    }
    if ((name === 'rent' || name === 'capacity') && !/^\d*$/.test(value)) {
      return; // Prevent input if it's not a number
    }
    if (name === 'transmission' && value !== 'Auto' && value !== 'Manual') {
      Alert.alert('Error', 'Transmission must be either "Auto" or "Manual".');
      return;
    }

    const updatedValue = (name === 'rent' || name === 'capacity') ? Number(value) : value;

    setCarDetails((prev) => ({ ...prev, [name]: updatedValue }));
  };

  const handleImageUpload = async (source: 'gallery' | 'camera') => {
    if (carImages.length >= 3) {
      Alert.alert('Warning', 'You can only upload up to 3 images.');
      return;
    }

    if (source === 'gallery') {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'You need to grant permission to access the gallery.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCarImages((prev) => [...prev, result.assets[0].uri]);
      }
    } else if (source === 'camera') {
      if (!permission || !permission.granted) {
        Alert.alert('Permission required', 'You need to grant permission to access the camera.');
        return;
      }
      setCameraVisible(true);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setCarImages((prev) => [...prev, photo!.uri]);
      setCameraVisible(false);
    }
  };

  const closeCamera = () => {
    setCameraVisible(false);
  };

  const toggleCameraType = () => {
    setCameraType((current) => (current === 'back' ? 'front' : 'back'));
  };

  const toggleTransmission = () => {
    setCarDetails((prev) => ({
      ...prev,
      transmission: prev.transmission === 'Auto' ? 'Manual' : 'Auto',
    }));
  };

  const handleSubmit = async () => {
    if (
      !carDetails.manufacturer ||
      !carDetails.model ||
      !carDetails.numberPlate ||
      !carDetails.rent ||
      !carDetails.capacity ||
      !carDetails.transmission
    ) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
  
    if (carImages.length === 0) {
      Alert.alert('Error', 'Please upload at least one car image.');
      return;
    }
  
    const formData = new FormData();
    for (const key in carDetails) {
      const value = carDetails[key];
  
      // Handle string[] (carImageUrls) separately
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          formData.append(`${key}[${index}]`, item);
        });
      } else {
        // Convert numbers to strings
        const stringValue = typeof value === 'number' ? value.toString() : value;
        formData.append(key, stringValue);
      }
    }
  
    // Append car images
    carImages.forEach((image, index) => {
      const filename = image.split('/').pop();
      const match = /\.(\w+)$/.exec(filename!);
      const type = match ? `image/${match[1]}` : `image`;
  
      formData.append('carImages', {
        uri: image,
        type: type,
        name: filename || `image${index}.jpg`,
      } as unknown as Blob);
    });
  
    setIsLoading(true);
    try {
      const response = await fetch(`${AppConstants.LOCAL_URL}/vehicles/${carId}`, {
        method: 'PUT',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      const result = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Car updated successfully!');
        console.log('Response:', result);
      } else {
        Alert.alert('Error', result.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to update the car.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleDelete = async () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this car?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${AppConstants.LOCAL_URL}/vehicles/${carId}`, {
                method: 'DELETE',
              });
  
              if (response.ok) {
                Alert.alert('Success', 'Car deleted successfully!');
                navigation.goBack(); // Navigate back after deletion
              } else {
                Alert.alert('Error', 'Failed to delete car.');
              }
            } catch (error) {
              console.error('Error deleting car:', error);
              Alert.alert('Error', 'An error occurred while deleting the car.');
            }
          },
        },
      ]
    );
  };
  
  return (
    <RentalAppLayout title="Edit Car">
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#FFF" />
      </TouchableOpacity>

      <ScrollView style={styles.container}>
        {/* Image Upload Section */}
        <View style={styles.imageUploadContainer}>
          <TouchableOpacity
            style={styles.imageUploadButton}
            onPress={() => handleImageUpload('gallery')}
          >
            <Text style={styles.imageUploadButtonText}>Upload from Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.imageUploadButton}
            onPress={() => handleImageUpload('camera')}
          >
            <Text style={styles.imageUploadButtonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Display Uploaded Images */}
        {carImages.map((image, index) => (
          <View key={index} style={styles.imagePreviewContainer}>
            <Image source={{ uri: image }} style={styles.imagePreview} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setCarImages((prev) => prev.filter((_, i) => i !== index))}
            >
              <Text style={styles.removeImageText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Camera View */}
        {cameraVisible && (
          <View style={styles.cameraContainer}>
            <CameraView ref={cameraRef} style={styles.camera} facing={cameraType}>
              <View style={styles.cameraButtonContainer}>
                <TouchableOpacity style={styles.cameraButton} onPress={toggleCameraType}>
                  <Text style={styles.cameraButtonText}>Flip Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cameraButton} onPress={takePicture}>
                  <Text style={styles.cameraButtonText}>Capture</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cameraButton} onPress={closeCamera}>
                  <Text style={styles.cameraButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </CameraView>
          </View>
        )}

        {/* Form Fields */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Manufacturer</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter manufacturer"
            value={carDetails.manufacturer}
            onChangeText={(text) => handleChange('manufacturer', text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Model</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter model"
            value={carDetails.model}
            onChangeText={(text) => handleChange('model', text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Number Plate</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter number plate"
            value={carDetails.numberPlate}
            onChangeText={(text) => handleChange('numberPlate', text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Rent</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter rent"
            keyboardType="numeric"
            value={carDetails.rent.toString()}
            onChangeText={(text) => handleChange('rent', text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Seating Capacity</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter seating capacity"
            keyboardType="numeric"
            value={carDetails.capacity.toString()}
            onChangeText={(text) => handleChange('capacity', text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Transmission</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                carDetails.transmission === 'Auto' ? styles.activeButton : {},
              ]}
              onPress={toggleTransmission}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  carDetails.transmission === 'Auto' ? styles.activeButtonText : {},
                ]}
              >
                Auto
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                carDetails.transmission === 'Manual' ? styles.activeButton : {},
              ]}
              onPress={toggleTransmission}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  carDetails.transmission === 'Manual' ? styles.activeButtonText : {},
                ]}
              >
                Manual
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Update Car</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
  style={[styles.button, styles.deleteButton]}
  onPress={handleDelete}
>
  <Text style={styles.buttonText}>Delete Car</Text>
</TouchableOpacity>
      </ScrollView>
    </RentalAppLayout>
  );
};

const styles = StyleSheet.create({
  container: { padding: 15 },
  imageUploadContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  removeImageButton: {
    marginTop: 10,
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
  },
  imageUploadButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  
  imageUploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagePreviewContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  imagePreview: {
    width: 200,
    height: 150,
    borderRadius: 10,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 20,
  },
  camera: {
    flex: 1,
    height: 300,
  },
  cameraButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  cameraButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cameraButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  inputContainer: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, backgroundColor: '#fff' },
  button: {
    marginTop: 10,
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  deleteButton : {
    backgroundColor: '#dc3545',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 5,
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  activeButton: {
    backgroundColor: '#007bff',
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  activeButtonText: {
    color: '#fff',
  },
});

export default EditCarScreen;