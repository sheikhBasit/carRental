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
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import RentalAppLayout from '@/app/screens/rentalAppLayout';
import { AppConstants } from '@/constants/appConstants';
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { apiFetch } from '@/utils/api';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

type CityType = {
  name: string;
  additionalFee: number;
};

type AvailabilityType = {
  days: string[];
  startTime: string;
  endTime: string;
};

type CarDetails = {
  manufacturer: string;
  model: string;
  numberPlate: string;
  carImageUrl: string;
  rent: number;
  capacity: number;
  transmission: 'Auto' | 'Manual';
  company: string;
  cities: CityType[];
  availability: AvailabilityType;
};

const EditCarScreen = () => {
  const { carId } = useLocalSearchParams<{ carId: string }>();
  const router = useRouter();

  const [carDetails, setCarDetails] = useState<CarDetails>({
    manufacturer: '',
    model: '',
    numberPlate: '',
    carImageUrl: '',
    rent: 0,
    capacity: 0,
    transmission: 'Manual',
    company: '',
    cities: [],
    availability: {
      days: [],
      startTime: '',
      endTime: ''
    }
  });

  const [carImageUrls, setCarImageUrls] = useState<string[]>([]);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = React.useRef<CameraView>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // City input state
  const [newCity, setNewCity] = useState<string>('');
  const [newCityFee, setNewCityFee] = useState<string>('0');

  const [removedImages, setRemovedImages] = useState<string[]>([]);

  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  useEffect(() => {
    if (!carId) {
      Alert.alert('Error', 'No car ID provided');
      router.back();
      return;
    }

    const fetchCarDetails = async () => {
      try {
        setIsLoading(true);
        const result = await apiFetch(`/vehicles/${carId}`,{},undefined,'company');
        if (result.data) {
          const car = result.data;
          setCarDetails({
            manufacturer: car.manufacturer || '',
            model: car.model || '',
            numberPlate: car.numberPlate || '',
            carImageUrl: car.carImageUrls && car.carImageUrls.length > 0 ? car.carImageUrls[0] : '',
            rent: car.rent || 0,
            capacity: car.capacity || 0,
            transmission: car.transmission || 'Manual',
            company: car.company || '',
            cities: car.cities || [],
            availability: car.availability
              ? {
                  days: car.availability.days || [],
                  startTime: car.availability.startTime || '',
                  endTime: car.availability.endTime || ''
                }
              : { days: [], startTime: '', endTime: '' }
          });
          setCarImageUrls(Array.isArray(car.carImageUrls) ? car.carImageUrls : []);
        } else {
          Alert.alert('Error', result.message || 'Failed to fetch car details.');
        }
      } catch (error) {
        Alert.alert('Error', 'An error occurred while fetching car details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarDetails();
  }, [carId]);

  const handleChange = (name: keyof CarDetails, value: string | number) => {
    if (name === 'manufacturer' && !/^[a-zA-Z\s]+$/.test(value as string)) {
        return; // Prevent input if it contains non-alphabet characters
      }
    if ((name === 'rent' || name === 'capacity') && !/^\d*$/.test(value as string)) {
        return; // Prevent input if it's not a number
      }
      if (name === 'transmission' && value !== 'Auto' && value !== 'Manual') {
        Alert.alert('Error', 'Transmission must be either "Auto" or "Manual".');
        return;
      }

    const updatedValue = (name === 'rent' || name === 'capacity') 
        ? Number(value) 
        : value;

      setCarDetails((prev) => ({ ...prev, [name]: updatedValue }));
  };

  const handleAvailabilityChange = (field: keyof AvailabilityType, value: string | string[]) => {
    if (field === 'startTime' || field === 'endTime') {
      if (typeof value === 'string' && !/^\d{2}:\d{2}$/.test(value)) {
        Alert.alert('Error', 'Please enter time in HH:MM format');
        return;
      }
    }
    
    setCarDetails(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [field]: value
      }
    }));
  };

  const toggleDay = (day: string) => {
    const currentDays = [...carDetails.availability.days];
    const dayIndex = currentDays.indexOf(day);
    
    if (dayIndex > -1) {
      currentDays.splice(dayIndex, 1);
    } else {
      currentDays.push(day);
    }
    
    handleAvailabilityChange('days', currentDays);
  };

  const addCity = () => {
    if (!newCity.trim()) {
      Alert.alert('Error', 'City name cannot be empty');
      return;
    }

    const newCityObject: CityType = {
      name: newCity.trim(),
      additionalFee: Number(newCityFee) || 0
    };

    setCarDetails(prev => ({
      ...prev,
      cities: [...prev.cities, newCityObject]
    }));

    setNewCity('');
    setNewCityFee('0');
  };

  const removeCity = (index: number) => {
    setCarDetails(prev => ({
      ...prev,
      cities: prev.cities.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = async (source: 'gallery' | 'camera') => {
    try {
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
          const newUris = result.assets.map(a => a.uri);
          setCarImageUrls(urls => [...urls, ...newUris]);
          setCarDetails(prev => ({ ...prev, carImageUrl: newUris[0] }));
      }
    } else if (source === 'camera') {
      if (!permission || !permission.granted) {
          const permissionResult = await requestPermission();
          if (!permissionResult.granted) {
        Alert.alert('Permission required', 'You need to grant permission to access the camera.');
        return;
          }
      }
      setCameraVisible(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
      const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          setCarImageUrls(urls => [...urls, photo.uri]);
          setCarDetails(prev => ({ ...prev, carImageUrl: photo.uri }));
      setCameraVisible(false);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
      }
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
      !carDetails.transmission ||
      !carImageUrls.length ||
      !carDetails.company
    ) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
  
    setIsLoading(true);
    try {
      const updatedCarDetails = {
        ...carDetails,
        carImageUrls: carImageUrls,
        ...(removedImages.length > 0 && { removeImages: removedImages })
      };
      const response = await apiFetch(`/vehicles/${carId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedCarDetails)
      },undefined,'company');
      if (response && response.success) {
        Alert.alert('Success', 'Car updated successfully!', [
          {
            text: 'OK',
            onPress: () => {
              router.back();
            },
          },
        ]);
      } else {
        Alert.alert('Error', response.message || 'Something went wrong');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update the car.');
    } finally {
      setIsLoading(false);
      setRemovedImages([]); // Reset after submit
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
              setIsDeleting(true);
              const response = await apiFetch(`/vehicles/${carId}`, {
                method: 'DELETE'
              },undefined,'company');
              if (response && response.success) {
                Alert.alert('Success', 'Car deleted successfully!');
                router.back();
              } else {
                Alert.alert('Error', response?.message || 'Failed to delete car.');
              }
            } catch (error) {
              Alert.alert('Error', 'An error occurred while deleting the car.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };
  
  if (!carId) {
    return null;
  }
  
  return (
    <RentalAppLayout title="Edit Car">
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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
        {carImageUrls.length > 0 && (
          <View style={styles.imagesPreviewContainer}>
            {carImageUrls.map((uri, idx) => (
              <View key={idx} style={styles.imagePreviewWrapper}>
                <Image source={{ uri }} style={styles.imagePreview} />
            <TouchableOpacity
              style={styles.removeImageButton}
                  onPress={() => {
                    setRemovedImages(prev => [...prev, uri]);
                    setCarImageUrls(urls => {
                      const newUrls = urls.filter((_, i) => i !== idx);
                      setCarDetails(prev => ({
                        ...prev,
                        carImageUrl: newUrls[0] || ''
                      }));
                      return newUrls;
                    });
                  }}
            >
              <Text style={styles.removeImageText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
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
                <TouchableOpacity style={styles.cameraButton} onPress={closeCamera}>
                  <Text style={styles.cameraButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </CameraView>
          </View>
        )}

        {/* Basic Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.inputGroup}>
          <Text style={styles.label}>Manufacturer</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter manufacturer"
            value={carDetails.manufacturer}
            onChangeText={(text) => handleChange('manufacturer', text)}
              autoCapitalize="words"
          />
        </View>
          <View style={styles.inputGroup}>
          <Text style={styles.label}>Model</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter model"
            value={carDetails.model}
            onChangeText={(text) => handleChange('model', text)}
              autoCapitalize="words"
          />
        </View>
          <View style={styles.inputGroup}>
          <Text style={styles.label}>Number Plate</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter number plate"
            value={carDetails.numberPlate}
            onChangeText={(text) => handleChange('numberPlate', text)}
              autoCapitalize="characters"
              maxLength={8}
          />
        </View>
          <View style={styles.inputGroupRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Rent (PKR)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter rent"
            keyboardType="numeric"
            value={carDetails.rent.toString()}
            onChangeText={(text) => handleChange('rent', text)}
          />
        </View>
            <View style={{ flex: 1 }}>
          <Text style={styles.label}>Seating Capacity</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter seating capacity"
            keyboardType="numeric"
            value={carDetails.capacity.toString()}
            onChangeText={(text) => handleChange('capacity', text)}
          />
        </View>
        </View>
          <View style={styles.inputGroup}>
          <Text style={styles.label}>Transmission</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
                style={[styles.toggleButton, carDetails.transmission === 'Auto' && styles.activeButton]}
                onPress={() => handleChange('transmission', 'Auto')}
            >
                <Text style={[styles.toggleButtonText, carDetails.transmission === 'Auto' && styles.activeButtonText]}>Auto</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.toggleButton, carDetails.transmission === 'Manual' && styles.activeButton]}
                onPress={() => handleChange('transmission', 'Manual')}
            >
                <Text style={[styles.toggleButtonText, carDetails.transmission === 'Manual' && styles.activeButtonText]}>Manual</Text>
            </TouchableOpacity>
          </View>
        </View>
          {/* <View style={styles.inputGroup}>
            <Text style={styles.label}>Company</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter company"
              value={carDetails.company}
              onChangeText={(text) => handleChange('company', text)}
            />
          </View> */}
        </View>

        {/* Availability Section */}
        <View style={styles.section}>
        <Text style={styles.sectionTitle}>Availability Schedule</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Days Available</Text>
          <View style={styles.daysContainer}>
            {DAYS_OF_WEEK.map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayButton,
                  carDetails.availability.days.includes(day) ? styles.activeDayButton : {},
                ]}
                onPress={() => toggleDay(day)}
              >
                <Text
                  style={[
                    styles.dayButtonText,
                    carDetails.availability.days.includes(day) ? styles.activeDayButtonText : {},
                  ]}
                >
                  {day.substring(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.timeContainer}>
          <View style={styles.timeInputContainer}>
            <Text style={styles.label}>Start Time</Text>
              <TouchableOpacity
              style={styles.timeInput}
                onPress={() => setShowStartTimePicker(true)}
              >
                <Text style={{ color: '#fff' }}>
                  {carDetails.availability.startTime || 'Select Start Time'}
                </Text>
              </TouchableOpacity>
              {showStartTimePicker && (
                <DateTimePicker
                  value={carDetails.availability.startTime ? new Date(`1970-01-01T${carDetails.availability.startTime}:00`) : new Date()}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedTime) => {
                    setShowStartTimePicker(false);
                    if (selectedTime) {
                      const hours = selectedTime.getHours().toString().padStart(2, '0');
                      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
                      setCarDetails(prev => ({
                        ...prev,
                        availability: {
                          ...prev.availability,
                          startTime: `${hours}:${minutes}`,
                        },
                      }));
                    }
                  }}
            />
              )}
          </View>
          <View style={styles.timeInputContainer}>
            <Text style={styles.label}>End Time</Text>
              <TouchableOpacity
              style={styles.timeInput}
                onPress={() => setShowEndTimePicker(true)}
              >
                <Text style={{ color: '#fff' }}>
                  {carDetails.availability.endTime || 'Select End Time'}
                </Text>
              </TouchableOpacity>
              {showEndTimePicker && (
                <DateTimePicker
                  value={carDetails.availability.endTime ? new Date(`1970-01-01T${carDetails.availability.endTime}:00`) : new Date()}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedTime) => {
                    setShowEndTimePicker(false);
                    if (selectedTime) {
                      const hours = selectedTime.getHours().toString().padStart(2, '0');
                      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
                      setCarDetails(prev => ({
                        ...prev,
                        availability: {
                          ...prev.availability,
                          endTime: `${hours}:${minutes}`,
                        },
                      }));
                    }
                  }}
            />
              )}
            </View>
          </View>
        </View>

        {/* City Section */}
        <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Cities</Text>
        <View style={styles.cityInputContainer}>
          <View style={styles.cityFieldContainer}>
            <TextInput
              style={styles.cityInput}
              placeholder="City name"
              value={newCity}
              onChangeText={setNewCity}
            />
            <TextInput
              style={styles.feeInput}
              placeholder="Fee"
              keyboardType="numeric"
              value={newCityFee}
              onChangeText={setNewCityFee}
            />
          </View>
          <TouchableOpacity style={styles.addCityButton} onPress={addCity}>
            <Text style={styles.addCityButtonText}>Add City</Text>
          </TouchableOpacity>
        </View>

        {/* City List */}
        {carDetails.cities.length > 0 && (
          <View style={styles.cityListContainer}>
            <Text style={styles.label}>Added Cities</Text>
            {carDetails.cities.map((city, index) => (
              <View key={index} style={styles.cityItem}>
                <Text style={styles.cityName}>{city.name}</Text>
                <Text style={styles.cityFee}>Fee: ${city.additionalFee}</Text>
                <TouchableOpacity
                  style={styles.removeCityButton}
                  onPress={() => removeCity(index)}
                >
                  <Text style={styles.removeCityText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
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
          style={[styles.button, styles.deleteButton, isDeleting && styles.buttonDisabled]}
          onPress={handleDelete}
          disabled={isLoading || isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator color="white" />
          ) : (
          <Text style={styles.buttonText}>Delete Car</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </RentalAppLayout>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    padding: 15,
    backgroundColor: '#1a1a1a',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#4a90e2',
    paddingBottom: 5,
  },
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
    position: 'absolute',
    top: -30,
    left: 2,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
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
  imagesPreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  imagePreviewWrapper: {
    width: '48%',
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
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
  inputContainer: { 
    marginBottom: 15,
  },
  label: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginBottom: 5 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#444', 
    padding: 12, 
    borderRadius: 5, 
    backgroundColor: '#333',
    color: '#fff',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#555',
    opacity: 0.7,
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
    borderColor: '#444',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 5,
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#333',
  },
  activeButton: {
    backgroundColor: '#007bff',
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  activeButtonText: {
    color: '#fff',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  dayButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#444',
    backgroundColor: '#333',
    marginVertical: 5,
    width: '30%',
    alignItems: 'center',
  },
  activeDayButton: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  dayButtonText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  activeDayButtonText: {
    color: '#fff',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeInputContainer: {
    flex: 1,
    marginRight: 5,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#444',
    padding: 12,
    borderRadius: 5,
    backgroundColor: '#333',
    color: '#fff',
  },
  cityInputContainer: {
    marginBottom: 15,
  },
  cityFieldContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  cityInput: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#444',
    padding: 12,
    borderRadius: 5,
    backgroundColor: '#333',
    color: '#fff',
    marginRight: 5,
  },
  feeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#444',
    padding: 12,
    borderRadius: 5,
    backgroundColor: '#333',
    color: '#fff',
  },
  addCityButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  addCityButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cityListContainer: {
    marginBottom: 15,
  },
  cityItem: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 5,
    marginVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cityName: {
    color: '#fff',
    fontWeight: 'bold',
    flex: 2,
  },
  cityFee: {
    color: '#fff',
    flex: 1,
  },
  removeCityButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 5,
  },
  removeCityText: {
    color: '#fff',
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputGroupRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
});

export default EditCarScreen;