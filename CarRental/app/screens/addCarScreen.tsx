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
  ActivityIndicator,
  Switch,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import RentalAppLayout from '@/app/screens/rentalAppLayout';
import { AppConstants } from '@/constants/appConstants';
import { getStoredCompanyId } from '@/utils/storageUtil';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Define types
type Availability = {
  days: string[];
  startTime: string;
  endTime: string;
};

type City = {
  name: string;
  additionalFee: string | number;
};

type CarDetails = {
  manufacturer: string;
  model: string;
  numberPlate: string;
  rent: string;
  capacity: string;
  transmission: 'Auto' | 'Manual';
  isAvailable: boolean;
  availability: Availability;
  cities: City[];
};

// Days of week for availability
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AddCarScreen = () => {
  const navigation = useNavigation();
  const [carDetails, setCarDetails] = useState<CarDetails>({
    manufacturer: '',
    model: '',
    numberPlate: '',
    rent: '',
    capacity: '',
    transmission: 'Manual',
    isAvailable: true,
    availability: {
      days: [],
      startTime: '',
      endTime: '',
    },
    cities: [{
      name: '',
      additionalFee: '',
    }],
  });

  const [carImages, setCarImages] = useState<string[]>([]);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = React.useRef<CameraView>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle availability changes
  const handleAvailabilityChange = (field: keyof Availability, value: string) => {
    setCarDetails(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [field]: value
      }
    }));
  };

  // Handle changes for array fields (cities)
  const handleCityChange = (index: number, field: keyof City, value: string) => {
    const updatedCities = [...carDetails.cities];
    updatedCities[index] = {
      ...updatedCities[index],
      [field]: field === 'additionalFee' ? Number(value) || 0 : value
    };
    setCarDetails(prev => ({ ...prev, cities: updatedCities }));
  };

  // Add new city
  const addCity = () => {
    setCarDetails(prev => ({
      ...prev,
      cities: [...prev.cities, { name: '', additionalFee: '' }]
    }));
  };

  // Remove city
  const removeCity = (index: number) => {
    if (carDetails.cities.length <= 1) {
      Alert.alert('Error', 'At least one city is required');
      return;
    }
    const updatedCities = [...carDetails.cities];
    updatedCities.splice(index, 1);
    setCarDetails(prev => ({ ...prev, cities: updatedCities }));
  };

  // Toggle day selection
  const toggleDay = (day: string) => {
    setCarDetails(prev => {
      const days = [...prev.availability.days];
      const dayIndex = days.indexOf(day);
      
      if (dayIndex === -1) {
        days.push(day);
      } else {
        days.splice(dayIndex, 1);
      }
      
      return {
        ...prev,
        availability: {
          ...prev.availability,
          days
        }
      };
    });
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
        setCarImages(prev => [...prev, result.assets[0].uri]);
      }
    } else if (source === 'camera') {
      if (!permission || !permission.granted) {
        const permissionResponse = await requestPermission();
        if (!permissionResponse.granted) {
          Alert.alert('Permission required', 'You need to grant permission to access the camera.');
          return;
        }
      }
      setCameraVisible(true);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          setCarImages(prev => [...prev, photo.uri]);
        }
        setCameraVisible(false);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const closeCamera = () => {
    setCameraVisible(false);
  };

  const toggleCameraType = () => {
    setCameraType(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleTransmission = () => {
    setCarDetails(prev => ({
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
      !carDetails.transmission ||
      carDetails.availability.days.length === 0 ||
      !carDetails.availability.startTime ||
      !carDetails.availability.endTime ||
      carDetails.cities.some(city => !city.name)
    ) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(carDetails.availability.startTime) || 
        !timeRegex.test(carDetails.availability.endTime)) {
      Alert.alert('Error', 'Please enter time in HH:MM format (24-hour)');
      return;
    }

    const companyId = await getStoredCompanyId();
    if (!companyId) {
      Alert.alert('Error', 'Company ID is missing.');
      return;
    }

    const formData = new FormData();
    formData.append('manufacturer', carDetails.manufacturer);
    formData.append('model', carDetails.model);
    formData.append('numberPlate', carDetails.numberPlate);
    formData.append('rent', carDetails.rent);
    formData.append('capacity', carDetails.capacity);
    formData.append('transmission', carDetails.transmission);
    formData.append('isAvailable', carDetails.isAvailable.toString());
    formData.append('availability', JSON.stringify(carDetails.availability));
    formData.append('cities', JSON.stringify(carDetails.cities));
    formData.append('company', companyId);

    carImages.forEach((image, index) => {
      const filename = image.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : 'image';

      formData.append('carImages', {
        uri: image,
        type,
        name: filename || `image${index}.jpg`,
      } as any);
    });

    setIsLoading(true);
    try {
      const response = await fetch(`${AppConstants.LOCAL_URL}/vehicles/postVehicle`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Car posted successfully!', [
          {
            text: 'OK',
            onPress: () => {
              setCarDetails({
                manufacturer: '',
                model: '',
                numberPlate: '',
                rent: '',
                capacity: '',
                transmission: 'Manual',
                isAvailable: true,
                availability: {
                  days: [],
                  startTime: '',
                  endTime: '',
                },
                cities: [{
                  name: '',
                  additionalFee: '',
                }],
              });
              setCarImages([]);
              navigation.goBack();
            },
          },
        ]);
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
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
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
        <View style={styles.imagePreviewList}>
          {carImages.map((image, index) => (
            <View key={index} style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setCarImages(prev => prev.filter((_, i) => i !== index))}
              >
                <Text style={styles.removeImageText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

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
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Manufacturer</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter manufacturer"
              value={carDetails.manufacturer}
              onChangeText={(text) => setCarDetails(prev => ({...prev, manufacturer: text}))}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Model</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter model"
              value={carDetails.model}
              onChangeText={(text) => setCarDetails(prev => ({...prev, model: text}))}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Number Plate</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter number plate"
              value={carDetails.numberPlate}
              onChangeText={(text) => setCarDetails(prev => ({...prev, numberPlate: text}))}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Rent ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter rent"
              keyboardType="numeric"
              value={carDetails.rent}
              onChangeText={(text) => setCarDetails(prev => ({...prev, rent: text}))}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Seating Capacity</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter seating capacity"
              keyboardType="numeric"
              value={carDetails.capacity}
              onChangeText={(text) => setCarDetails(prev => ({...prev, capacity: text}))}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Transmission</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  carDetails.transmission === 'Auto' && styles.activeButton,
                ]}
                onPress={() => setCarDetails(prev => ({...prev, transmission: 'Auto'}))}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    carDetails.transmission === 'Auto' && styles.activeButtonText,
                  ]}
                >
                  Auto
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  carDetails.transmission === 'Manual' && styles.activeButton,
                ]}
                onPress={() => setCarDetails(prev => ({...prev, transmission: 'Manual'}))}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    carDetails.transmission === 'Manual' && styles.activeButtonText,
                  ]}
                >
                  Manual
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Availability Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Days Available</Text>
              <View style={styles.daysContainer}>
                {DAYS_OF_WEEK.map(day => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayButton,
                      carDetails.availability.days.includes(day) && styles.selectedDay
                    ]}
                    onPress={() => toggleDay(day)}
                  >
                    <Text style={[
                      styles.dayButtonText,
                      carDetails.availability.days.includes(day) && styles.selectedDayText
                    ]}>
                      {day.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.timeInputContainer}>
              <View style={styles.timeInput}>
                <Text style={styles.label}>Start Time</Text>
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM"
                  value={carDetails.availability.startTime}
                  onChangeText={(text) => handleAvailabilityChange('startTime', text)}
                />
              </View>
              <View style={styles.timeInput}>
                <Text style={styles.label}>End Time</Text>
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM"
                  value={carDetails.availability.endTime}
                  onChangeText={(text) => handleAvailabilityChange('endTime', text)}
                />
              </View>
            </View>
          </View>

          {/* Cities Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cities & Pricing</Text>
            {carDetails.cities.map((city, index) => (
              <View key={index} style={styles.cityContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>City Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter city name"
                    value={city.name}
                    onChangeText={(text) => handleCityChange(index, 'name', text)}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Additional Fee ($)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter additional fee"
                    keyboardType="numeric"
                    value={city.additionalFee.toString()}
                    onChangeText={(text) => handleCityChange(index, 'additionalFee', text)}
                  />
                </View>
                {carDetails.cities.length > 1 && (
                  <TouchableOpacity 
                    style={styles.removeCityButton}
                    onPress={() => removeCity(index)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#dc3545" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={addCity}>
              <Text style={styles.addButtonText}>+ Add Another City</Text>
            </TouchableOpacity>
          </View>

          {/* Availability Toggle */}
          <View style={styles.toggleContainer}>
            <Text style={styles.label}>Available for Rent</Text>
            <Switch
              value={carDetails.isAvailable}
              onValueChange={(value) => setCarDetails(prev => ({ ...prev, isAvailable: value }))}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={carDetails.isAvailable ? '#003366' : '#f4f3f4'}
            />
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
  section: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 15,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    minWidth: 50,
    alignItems: 'center',
  },
  selectedDay: {
    backgroundColor: '#003366',
  },
  dayButtonText: {
    color: '#333',
  },
  selectedDayText: {
    color: '#fff',
  },
  timeInputContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  timeInput: {
    flex: 1,
  },
  cityContainer: {
    marginBottom: 15,
    position: 'relative',
  },
  removeCityButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 10,
  },
  addButton: {
    backgroundColor: '#e9f5ff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#003366',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
  },
  formContainer: {
    marginTop: 20,
  },
  imageUploadContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  imageUploadButton: {
    flex: 1,
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  imageUploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagePreviewList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  imagePreviewContainer: {
    width: '48%',
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    aspectRatio: 4/3,
    borderRadius: 8,
  },
  removeImageButton: {
    marginTop: 8,
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cameraContainer: {
    width: '100%',
    aspectRatio: 4/3,
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  cameraButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 10,
  },
  cameraButton: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  cameraButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  activeButton: {
    backgroundColor: '#007bff',
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeButtonText: {
    color: '#fff',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#003366',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddCarScreen;