import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Button,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import RentalAppLayout from '@/app/screens/rentalAppLayout';
import { AppConstants } from '@/constants/appConstants';
import { getStoredCompanyId } from '@/utils/storageUtil';

const AddCarScreen = () => {
  const [carDetails, setCarDetails] = useState<Record<string, string>>({
    manufacturer: '',
    model: '',
    numberPlate: '',
    rent: '',
    capacity: '',
    transmission: 'Manual',
  });

  const [carImage, setCarImage] = useState<string | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = React.useRef<CameraView>(null);
    const [isLoading,setIsLoading] = useState(false);

  const handleChange = (name: string, value: string) => {
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
    setCarDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (source: 'gallery' | 'camera') => {
    if (carImage) {
      Alert.alert('Warning', 'You have already uploaded an image. Please remove it before adding a new one.');
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
        setCarImage(result.assets[0].uri);
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
      setCarImage(photo!.uri);
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
  
    const companyId = await getStoredCompanyId();
    if (!companyId) {
      Alert.alert('Error', 'Company ID is missing.');
      return;
    }
  
    if (!carImage) {
      Alert.alert('Error', 'Please upload a car image.');
      return;
    }
  
    const formData = new FormData();
    for (const key in carDetails) {
      formData.append(key, carDetails[key]);
    }
    
    formData.append('companyId', companyId); // Ensure companyId is included
  
    const filename = carImage.split('/').pop();
    const match = /\.(\w+)$/.exec(filename!);
    const type = match ? `image/${match[1]}` : `image`;
  
    formData.append('carImage', {
      uri: carImage,
      type: type,
      name: filename || 'image.jpg',
    } as unknown as Blob);
  
    setIsLoading(true);
    try {
      const response = await fetch(`${AppConstants.LOCAL_URL}/vehicles/postVehicle`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    
      const result = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Car posted successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Reset all fields
              setCarDetails({
                manufacturer: '',
                model: '',
                numberPlate: '',
                rent: '',
                capacity: '',
                transmission: 'Manual',
              });
              setCarImage(null);
            },
          },
        ]);
        console.log('Response:', result);
      } else {
        Alert.alert('Error', result.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to post the car.');
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <RentalAppLayout title="Add Car">
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

        {/* Display Uploaded Image */}
        {carImage && (
  <View style={styles.imagePreviewContainer}>
    <Image source={{ uri: carImage }} style={styles.imagePreview} />
    <TouchableOpacity
      style={styles.removeImageButton}
      onPress={() => setCarImage(null)}
    >
      <Text style={styles.removeImageText}>Remove</Text>
    </TouchableOpacity>
  </View>
)}

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
        {/* Close Camera Button */}
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
            value={carDetails.manufacturer}  //
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
            value={carDetails.rent}  
            onChangeText={(text) => handleChange('rent', text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Seating Capacity</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter seating capacity"
            keyboardType="numeric"
            value={carDetails.capacity} 
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
                 <Text style={styles.buttonText}>Submit</Text>
               )}
             </TouchableOpacity>
      </ScrollView>
    </RentalAppLayout>
  );
};
const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: '#fff' },
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
  label: { fontSize: 14, fontWeight: 'bold', color: '#004c8c', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, backgroundColor: '#fff' },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 10,
    backgroundColor: "#003366",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom:20
  },
  buttonDisabled: {
    backgroundColor: "#cccccc", // Disabled button color
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
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


export default AddCarScreen;
