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
  Switch,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import RentalAppLayout from '@/app/screens/rentalAppLayout';
import { AppConstants } from '@/constants/appConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

// Define types based on the model
type CarDetails = {
  manufacturer: string;
  model: string;
  year: string;
  numberPlate: string;
  carImageUrls: string[];
  rent: string;
  capacity: string;
  transmission: 'Auto' | 'Manual';
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid' | 'CNG';
  vehicleType: 'Sedan' | 'SUV' | 'Hatchback' | 'Coupe' | 'Convertible' | 'Van' | 'Truck' | 'Minivan' | 'Pickup';
  features: string[];
  mileage: string;
  insuranceExpiry: string;
  availability: {
  days: string[];
  startTime: string;
  endTime: string;
};
  cities: {
  name: string;
    additionalFee: string;
  }[];
  minimumRentalHours: string;
  maximumRentalDays: string;
  company: string;
};

// Constants
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'];
const VEHICLE_TYPES = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Van', 'Truck', 'Minivan', 'Pickup'];
const FEATURES = [
  'AC', 'Heating', 'Bluetooth', 'Navigation', 'Sunroof', 
  'Backup Camera', 'Keyless Entry', 'Leather Seats', 'Child Seat',
  'Android Auto', 'Apple CarPlay', 'USB Ports', 'WiFi', 'Premium Sound'
];

const AddCarScreen = () => {
  const navigation = useNavigation();
  const [carDetails, setCarDetails] = useState<CarDetails>({
    manufacturer: '',
    model: '',
    year: new Date().getFullYear().toString(),
    numberPlate: '',
    carImageUrls: [],
    rent: '',
    capacity: '',
    transmission: 'Manual',
    fuelType: 'Petrol',
    vehicleType: 'Sedan',
    features: [],
    mileage: '',
    insuranceExpiry: '',
    availability: {
      days: [],
      startTime: '08:00',
      endTime: '20:00'
    },
    cities: [{ name: '', additionalFee: '0' }],
    minimumRentalHours: '4',
    maximumRentalDays: '30',
    company: '',
  });

  const [carImages, setCarImages] = useState<string[]>([]);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = React.useRef<CameraView>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [companyId, setCompanyId] = useState<string>('');
  const [showInsuranceDatePicker, setShowInsuranceDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Function to get stored company ID
  const getStoredCompanyId = async () => {
    try {
      const storedCompanyId = await AsyncStorage.getItem('companyId');
      if (storedCompanyId) {
        setCompanyId(storedCompanyId);
        setCarDetails(prev => ({ ...prev, company: storedCompanyId }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch company ID');
    }
  };

  useEffect(() => {
    getStoredCompanyId();
  }, []);

  const handleImageUpload = async (source: 'gallery' | 'camera') => {
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
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImages = result.assets.map(asset => asset.uri);
        setCarImages([...carImages, ...newImages]);
        setCarDetails(prev => ({ 
          ...prev, 
          carImageUrls: [...prev.carImageUrls, ...newImages] 
        }));
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
          setCarImages([...carImages, photo.uri]);
          setCarDetails(prev => ({ 
            ...prev, 
            carImageUrls: [...prev.carImageUrls, photo.uri] 
          }));
        }
        setCameraVisible(false);
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...carImages];
    newImages.splice(index, 1);
    setCarImages(newImages);
    setCarDetails(prev => ({
      ...prev,
      carImageUrls: newImages
    }));
  };

  const closeCamera = () => {
    setCameraVisible(false);
  };

  const toggleCameraType = () => {
    setCameraType(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleDaySelection = (day: string) => {
    setCarDetails(prev => {
      const newDays = [...prev.availability.days];
      const index = newDays.indexOf(day);
      
      if (index > -1) {
        newDays.splice(index, 1);
      } else {
        newDays.push(day);
      }
      
      return {
        ...prev,
        availability: {
          ...prev.availability,
          days: newDays
        }
      };
    });
  };

  const addCity = () => {
    setCarDetails(prev => ({
      ...prev,
      cities: [...prev.cities, { name: '', additionalFee: '0' }]
    }));
  };

  const removeCity = (index: number) => {
    setCarDetails(prev => {
      const newCities = [...prev.cities];
      newCities.splice(index, 1);
      return {
        ...prev,
        cities: newCities
      };
    });
  };

  const updateCityField = (index: number, field: 'name' | 'additionalFee', value: string) => {
    setCarDetails(prev => {
      const newCities = [...prev.cities];
      newCities[index][field] = value;
      return {
        ...prev,
        cities: newCities
      };
    });
  };

  const toggleFeature = (feature: string) => {
    setCarDetails(prev => {
      const newFeatures = [...prev.features];
      const index = newFeatures.indexOf(feature);
      
      if (index > -1) {
        newFeatures.splice(index, 1);
      } else {
        newFeatures.push(feature);
      }
      
      return {
        ...prev,
        features: newFeatures
      };
    });
  };

  const handleChange = (name: keyof CarDetails | 'availability.startTime' | 'availability.endTime', value: string) => {
    // Special handling for number plate
    if (name === 'numberPlate') {
      // Remove any non-alphanumeric characters
      let cleanValue = value.replace(/[^a-zA-Z0-9]/g, '');
      
      // Format as ABC-1234
      if (cleanValue.length > 3) {
        cleanValue = cleanValue.slice(0, 3) + '-' + cleanValue.slice(3);
      }
      
      // Limit to 7 characters (3 letters + hyphen + 4 numbers)
      cleanValue = cleanValue.slice(0, 8);
      
      setCarDetails(prev => ({...prev, [name]: cleanValue.toUpperCase()}));
      return;
    }

    // Handle availability time fields
    if (name === 'availability.startTime' || name === 'availability.endTime') {
      setCarDetails(prev => ({
        ...prev,
        availability: {
          ...prev.availability,
          [name.split('.')[1]]: value
        }
      }));
      return;
    }
    
    // Handle other fields normally
    setCarDetails(prev => ({...prev, [name]: value}));
  };

  const validateField = (name: keyof CarDetails, value: string): string => {
    if (!value) return 'This field is required';

    switch (name) {
      case 'numberPlate':
        if (!/^[A-Z]{3}-[0-9]{4}$/.test(value)) {
          return 'Number plate must be in format ABC-1234';
        }
        break;
      // ... rest of the validation cases ...
    }

    return '';
  };

  const handleSubmit = async () => {
    // Basic validation
    if (
      !carDetails.manufacturer ||
      !carDetails.model ||
      !carDetails.year ||
      !carDetails.numberPlate ||
      !carDetails.rent ||
      !carDetails.capacity ||
      !carDetails.transmission ||
      !carDetails.fuelType ||
      !carDetails.vehicleType ||
      !carDetails.insuranceExpiry ||
      carDetails.carImageUrls.length === 0 ||
      carDetails.availability.days.length === 0 ||
      !carDetails.company
    ) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    // Validate number plate format
    if (!/^[A-Z]{3}-[0-9]{4}$/.test(carDetails.numberPlate)) {
      Alert.alert('Error', 'Number plate must be in format ABC-1234');
      return;
    }

    // Validate cities
    for (const city of carDetails.cities) {
      if (!city.name) {
        Alert.alert('Error', 'Please fill in all city names.');
        return;
      }
    }

    if (!companyId) {
      Alert.alert('Error', 'Company ID not found. Please login again.');
      return;
    }

    // Prepare form data
    const formData = new FormData();
    
    // Add simple fields
    formData.append('manufacturer', carDetails.manufacturer.toLowerCase());
    formData.append('model', carDetails.model.toLowerCase());
    formData.append('year', carDetails.year);
    formData.append('numberPlate', carDetails.numberPlate.toUpperCase());
    formData.append('rent', carDetails.rent);
    formData.append('capacity', carDetails.capacity);
    formData.append('transmission', carDetails.transmission);
    formData.append('fuelType', carDetails.fuelType.toLowerCase());
    formData.append('vehicleType', carDetails.vehicleType);
    formData.append('mileage', carDetails.mileage || '0');
    formData.append('insuranceExpiry', carDetails.insuranceExpiry);
    formData.append('minimumRentalHours', carDetails.minimumRentalHours);
    formData.append('maximumRentalDays', carDetails.maximumRentalDays);
    formData.append('companyId', companyId);
    formData.append('features[seats]', carDetails.capacity);
    formData.append('features[transmission]', carDetails.transmission.toLowerCase());
    formData.append('features[fuelType]', carDetails.fuelType.toLowerCase());
    // Add availability
    const formattedDays = carDetails.availability.days.map(day => {
      const dayMap: Record<string, string> = {
        'monday': 'Monday',
        'tuesday': 'Tuesday',
        'wednesday': 'Wednesday',
        'thursday': 'Thursday',
        'friday': 'Friday',
        'saturday': 'Saturday',
        'sunday': 'Sunday'
      };
      return dayMap[day.toLowerCase()] || day;
    });
    formattedDays.forEach((day, idx) => {
      formData.append(`availability[days][${idx}]`, day);
    });
    formData.append('availability[startTime]', carDetails.availability.startTime);
    formData.append('availability[endTime]', carDetails.availability.endTime);
    
    // Add cities
    const formattedCities = carDetails.cities.map(city => ({
      name: city.name.toLowerCase().trim(),
      additionalFee: parseFloat(city.additionalFee) || 0
    }));
    formattedCities.forEach((city, idx) => {
      formData.append(`cities[${idx}][name]`, city.name);
      formData.append(`cities[${idx}][additionalFee]`, city.additionalFee.toString());
    });


    
    // Add features
    const validFeatures = [
      'AC', 'Heating', 'Bluetooth', 'Navigation', 'Sunroof', 
      'Backup Camera', 'Keyless Entry', 'Leather Seats', 'Child Seat',
      'Android Auto', 'Apple CarPlay', 'USB Ports', 'WiFi', 'Premium Sound'
    ];
    const formattedFeatures = carDetails.features
      .filter(feature => feature && validFeatures.includes(feature))
      .map(feature => feature);
    formattedFeatures.forEach((feature, idx) => {
      formData.append(`characteristics[${idx}]`, feature);
    });

    
    // Add images
    carImages.forEach((uri, index) => {
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : 'image';

      formData.append('carImageUrls', {
        uri,
        type,
        name: filename || `carImage_${index}.jpg`,
      } as any);
    });
    const companyAccessToken = await AsyncStorage.getItem('companyAccessToken');
    setIsLoading(true);
    try {
      const response = await fetch(`${AppConstants.LOCAL_URL}/vehicles/postVehicle`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${companyAccessToken}`,
        },
      });

      const result = await response.json();
      console.log(result);
      
      if (response.ok) {
        Alert.alert('Success', 'Car posted successfully!', [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      } else {
        Alert.alert('Error', result.code || 'Something went wrong');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to post the car.');
    } finally {
      setIsLoading(false);
    }
  };

  const onInsuranceDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();
    setShowInsuranceDatePicker(Platform.OS === 'ios');
    
    // Format date as YYYY-MM-DD
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    setCarDetails(prev => ({
      ...prev,
      insuranceExpiry: formattedDate
    }));
  };

  const onStartTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || new Date();
    setShowStartTimePicker(Platform.OS === 'ios');
    
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    setCarDetails(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        startTime: timeString
      }
    }));
  };

  const onEndTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || new Date();
    setShowEndTimePicker(Platform.OS === 'ios');
    
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    setCarDetails(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        endTime: timeString
      }
    }));
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
        {carImages.length > 0 && (
          <View style={styles.imagesPreviewContainer}>
            {carImages.map((uri, index) => (
              <View key={index} style={styles.imagePreviewWrapper}>
                <Image source={{ uri }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
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

        {/* Basic Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Manufacturer*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter manufacturer"
              value={carDetails.manufacturer}
              onChangeText={(text) => handleChange('manufacturer', text)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Model*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter model"
              value={carDetails.model}
              onChangeText={(text) => handleChange('model', text)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Year*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter year"
              keyboardType="numeric"
              maxLength={4}
              value={carDetails.year}
              onChangeText={(text) => handleChange('year', text)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Number Plate*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter number plate"
              value={carDetails.numberPlate}
              onChangeText={(text) => handleChange('numberPlate', text)}
              autoCapitalize="characters"
              maxLength={8}
            />
          </View>
          </View>

        {/* Rental Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rental Information</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Rent (PKR)*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter rent"
              keyboardType="numeric"
              value={carDetails.rent}
              onChangeText={(text) => handleChange('rent', text)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Seating Capacity*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter seating capacity"
              keyboardType="numeric"
              value={carDetails.capacity}
              onChangeText={(text) => handleChange('capacity', text)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Transmission*</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  carDetails.transmission === 'Auto' && styles.activeButton,
                ]}
                onPress={() => handleChange('transmission', 'Auto')}
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
                onPress={() => handleChange('transmission', 'Manual')}
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

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Fuel Type*</Text>
            <View style={styles.optionsContainer}>
              {FUEL_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.optionButton,
                    carDetails.fuelType === type && styles.activeOptionButton,
                  ]}
                  onPress={() => handleChange('fuelType', type as any)}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      carDetails.fuelType === type && styles.activeOptionButtonText,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Vehicle Type*</Text>
            <View style={styles.optionsContainer}>
              {VEHICLE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.optionButton,
                    carDetails.vehicleType === type && styles.activeOptionButton,
                  ]}
                  onPress={() => handleChange('vehicleType', type as any)}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      carDetails.vehicleType === type && styles.activeOptionButtonText,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mileage (km)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter mileage"
              keyboardType="numeric"
              value={carDetails.mileage}
              onChangeText={(text) => handleChange('mileage', text)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Insurance Expiry*</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowInsuranceDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {carDetails.insuranceExpiry || 'Select date'}
              </Text>
            </TouchableOpacity>
            {showInsuranceDatePicker && (
              <DateTimePicker
                value={carDetails.insuranceExpiry ? new Date(carDetails.insuranceExpiry) : new Date()}
                mode="date"
                display="default"
                onChange={onInsuranceDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresContainer}>
            {FEATURES.map((feature) => (
              <TouchableOpacity
                key={feature}
                style={[
                  styles.featureButton,
                  carDetails.features.includes(feature) && styles.activeFeatureButton,
                ]}
                onPress={() => toggleFeature(feature)}
              >
                <Text
                  style={[
                    styles.featureButtonText,
                    carDetails.features.includes(feature) && styles.activeFeatureButtonText,
                  ]}
                >
                  {feature}
                </Text>
              </TouchableOpacity>
            ))}
            </View>
          </View>

          {/* Availability Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability</Text>
            
            <View style={styles.inputContainer}>
            <Text style={styles.label}>Available Days*</Text>
              <View style={styles.daysContainer}>
              {DAYS_OF_WEEK.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayButton,
                    carDetails.availability.days.includes(day) && styles.selectedDay,
                    ]}
                  onPress={() => toggleDaySelection(day)}
                  >
                  <Text
                    style={[
                      styles.dayButtonText,
                      carDetails.availability.days.includes(day) && styles.selectedDayText,
                    ]}
                  >
                      {day.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Available Hours*</Text>
            <Text style={styles.label}>For 24 hours select 12:00 AM to 11:59 PM</Text>
            
            <View style={styles.timeInputContainer}>
              <View style={styles.timeInput}>
                <Text style={styles.label}>Start Time</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowStartTimePicker(true)}
                >
                  <Text style={styles.timeText}>{carDetails.availability.startTime}</Text>
                </TouchableOpacity>
                {showStartTimePicker && (
                  <DateTimePicker
                    value={new Date(`1970-01-01T${carDetails.availability.startTime}`)}
                    mode="time"
                    display="default"
                    onChange={onStartTimeChange}
                />
                )}
              </View>
              <View style={styles.timeInput}>
                <Text style={styles.label}>End Time</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowEndTimePicker(true)}
                >
                  <Text style={styles.timeText}>{carDetails.availability.endTime}</Text>
                </TouchableOpacity>
                {showEndTimePicker && (
                  <DateTimePicker
                    value={new Date(`1970-01-01T${carDetails.availability.endTime}`)}
                    mode="time"
                    display="default"
                    onChange={onEndTimeChange}
                  />
                )}
              </View>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Minimum Rental Hours</Text>
                <TextInput
                  style={styles.input}
              placeholder="Enter minimum hours"
              keyboardType="numeric"
              value={carDetails.minimumRentalHours}
              onChangeText={(text) => handleChange('minimumRentalHours', text)}
                />
              </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Maximum Rental Days</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter maximum days"
              keyboardType="numeric"
              value={carDetails.maximumRentalDays}
              onChangeText={(text) => handleChange('maximumRentalDays', text)}
            />
            </View>
          </View>

          {/* Cities Section */}
          <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cities</Text>
          
            {carDetails.cities.map((city, index) => (
              <View key={index} style={styles.cityContainer}>
                <View style={styles.inputContainer}>
                <Text style={styles.label}>City Name*</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter city name"
                    value={city.name}
                  onChangeText={(text) => updateCityField(index, 'name', text)}
                  />
                </View>
              
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Additional Fee (PKR)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter additional fee"
                    keyboardType="numeric"
                  value={city.additionalFee}
                  onChangeText={(text) => updateCityField(index, 'additionalFee', text)}
                  />
                </View>
              
                {carDetails.cities.length > 1 && (
                  <TouchableOpacity 
                    style={styles.removeCityButton}
                    onPress={() => removeCity(index)}
                  >
                  <Ionicons name="trash-outline" size={24} color="red" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          
            <TouchableOpacity style={styles.addButton} onPress={addCity}>
            <Text style={styles.addButtonText}>Add Another City</Text>
            </TouchableOpacity>
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
    top: -25,
    left: 7,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
  },
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
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    minWidth: 80,
    alignItems: 'center',
  },
  activeOptionButton: {
    backgroundColor: '#003366',
  },
  optionButtonText: {
    color: '#333',
  },
  activeOptionButtonText: {
    color: '#fff',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  activeFeatureButton: {
    backgroundColor: '#003366',
  },
  featureButtonText: {
    color: '#333',
  },
  activeFeatureButtonText: {
    color: '#fff',
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
    justifyContent: 'space-between',
    gap: 10,
  },
  timeInput: {
    flex: 1,
  },
  timeButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    color: '#333',
  },
  cityContainer: {
    marginBottom: 15,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 10,
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
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
});

export default AddCarScreen;