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
import { useNavigation, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { apiFetch } from '@/utils/api';

type DriverDetails = {
  _id?: string;
  name: string;
  profileimg: string;
  company: any;
  license: string;
  cnic: string;
  phNo: string;
  age: number;
  experience: number;
  baseHourlyRate: number;
  baseDailyRate: number;
  pricingTiers: any[];
  currentPromotion?: any;
 
  availability: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  blackoutDates: string[];
  bookings: string[];
  currentAssignment?: any;
  rating: number;
  completedTrips: number;
};

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const EditDriverScreen = () => {
  const { driverId } = useLocalSearchParams<{ driverId: string }>();
  const navigation = useNavigation();

  const [driverDetails, setDriverDetails] = useState<DriverDetails>({
    name: '',
    profileimg: '',
    company: {},
    license: '',
    cnic: '',
    phNo: '',
    age: 0,
    experience: 0,
    baseHourlyRate: 0,
    baseDailyRate: 0,
    pricingTiers: [],
    availability: {
      days: [],
      startTime: '09:00',
      endTime: '17:00',
    },
    blackoutDates: [],
    bookings: [],
    rating: 0,
    completedTrips: 0,
  });

  const [profileImage, setProfileImage] = useState<string>('');
  const [cameraVisible, setCameraVisible] = useState(false);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = React.useRef<CameraView>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchDriverDetails = async () => {
      try {
        setIsLoading(true);
        const result = await apiFetch(`/drivers/${driverId}`,{},undefined,'company');
        const data = result.data || result;
        if (data) {
          setDriverDetails({
            name: data.name || '',
            profileimg: data.profileimg || '',
            company: data.company || {},
            license: data.license || '',
            cnic: data.cnic || '',
            phNo: data.phNo || '',
            age: data.age || 0,
            experience: data.experience || 0,
            baseHourlyRate: data.baseHourlyRate || 0,
            baseDailyRate: data.baseDailyRate || 0,
            pricingTiers: data.pricingTiers || [],
            availability: {
              days: data.availability?.days || [],
              startTime: data.availability?.startTime || '09:00',
              endTime: data.availability?.endTime || '17:00',
            },
            blackoutDates: data.blackoutDates || [],
            bookings: data.bookings || [],
            rating: data.rating || 0,
            completedTrips: data.completedTrips || 0,
          });
          setProfileImage(data.profileimg || '');
        } else {
          Alert.alert('Error', 'Failed to fetch driver details.');
        }
      } catch (error) {
        Alert.alert('Error', 'An error occurred while fetching driver details.');
      } finally {
        setIsLoading(false);
      }
    };

    if (driverId) {
    fetchDriverDetails();
    }
  }, [driverId]);

  const handleChange = (name: keyof DriverDetails, value: string | number | boolean) => {
    if (name === 'name' && !/^[a-zA-Z\s]+$/.test(value as string)) {
      return; // Prevent input if it contains non-alphabet characters
    }
    if (name === 'phNo' && !/^[+\d\s-]*$/.test(value as string)) {
      return; // Prevent input if it's not a valid phone number
    }
    if (name === 'cnic' && !/^[\d-]*$/.test(value as string)) {
      return; // Prevent CNIC with invalid characters
    }
    if ((name === 'age' || name === 'experience') && (Number(value) < 0)) {
      return; // Prevent negative age or experience
    }
    if (name === 'rating' && ((value as number) < 0 || (value as number) > 5)) {
      Alert.alert('Error', 'Rating must be between 0 and 5.');
      return;
    }

    setDriverDetails((prev) => ({ ...prev, [name]: value }));
  };

  const toggleDay = (day: string) => {
    setDriverDetails(prev => {
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
        setProfileImage(result.assets[0].uri);
        setDriverDetails(prev => ({ ...prev, profileimg: result.assets[0].uri }));
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
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          setProfileImage(photo.uri);
          setDriverDetails(prev => ({ ...prev, profileimg: photo.uri }));
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

  const handleDelete = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this driver? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              const response = await apiFetch(`/drivers/${driverId}`, {
                method: 'DELETE'
              },undefined,'company');
              
              if (response && response.success) {
                Alert.alert('Success', 'Driver deleted successfully!', [
                  {
                    text: 'OK',
                    onPress: () => {
                      navigation.goBack();
                    },
                  },
                ]);
              } else {
                Alert.alert('Error', response.message || 'Failed to delete driver');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete the driver.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };
  const handleSubmit = async () => {
    if (
      !driverDetails.name ||
      !driverDetails.profileimg ||
      !driverDetails.license ||
      !driverDetails.cnic ||
      !driverDetails.phNo ||
      !driverDetails.age ||
      !driverDetails.experience ||
      !driverDetails.baseHourlyRate ||
      !driverDetails.baseDailyRate ||
      driverDetails.availability.days.length === 0 ||
      !driverDetails.availability.startTime ||
      !driverDetails.availability.endTime
    ) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    // Validate age
    if (driverDetails.age < 18 || driverDetails.age > 70) {
      Alert.alert('Error', 'Driver age must be between 18 and 70.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiFetch(`/drivers/${driverId}`, {
        method: 'PUT',
        body: JSON.stringify(driverDetails)
      },undefined,'company');
      if (response && response.success) {
        Alert.alert('Success', 'Driver updated successfully!', [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      } else {
        Alert.alert('Error', response.message || 'Something went wrong');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update the driver.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !driverDetails._id) {
    return (
      <RentalAppLayout title="Edit Driver">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#003366" />
        </View>
      </RentalAppLayout>
    );
  }

  return (
    <RentalAppLayout title="Edit Driver">
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

        {/* Display Uploaded Image */}
        {driverDetails.profileimg ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: driverDetails.profileimg }} style={styles.imagePreview} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => {
                setDriverDetails(prev => ({ ...prev, profileimg: '' }));
                setProfileImage('');
              }}
            >
              <Text style={styles.removeImageText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : null}

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
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
              placeholder="Enter name"
              value={driverDetails.name}
              onChangeText={(text) => handleChange('name', text)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>License Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter license number"
              value={driverDetails.license}
              onChangeText={(text) => handleChange('license', text)}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>CNIC</Text>
        <TextInput
          style={styles.input}
              placeholder="Enter CNIC (XXXXX-XXXXXXX-X)"
              value={driverDetails.cnic}
              onChangeText={(text) => handleChange('cnic', text)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
              placeholder="Enter phone number"
              value={driverDetails.phNo}
              onChangeText={(text) => handleChange('phNo', text)}
          keyboardType="phone-pad"
        />
          </View>

          <View style={styles.inputContainer}>
        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
              placeholder="Enter age"
              keyboardType="numeric"
              value={driverDetails.age?.toString() || ''}
              onChangeText={(text) => handleChange('age', Number(text))}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Experience (years)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter experience"
          keyboardType="numeric"
              value={driverDetails.experience?.toString() || ''}
              onChangeText={(text) => handleChange('experience', Number(text))}
        />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Base Hourly Rate (PKR)</Text>
        <TextInput
          style={styles.input}
              placeholder="Enter hourly rate"
          keyboardType="numeric"
              value={driverDetails.baseHourlyRate?.toString() || ''}
              onChangeText={(text) => handleChange('baseHourlyRate', Number(text))}
        />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Base Daily Rate (PKR)</Text>
        <TextInput
          style={styles.input}
              placeholder="Enter daily rate"
              keyboardType="numeric"
              value={driverDetails.baseDailyRate?.toString() || ''}
              onChangeText={(text) => handleChange('baseDailyRate', Number(text))}
            />
          </View>


          {/* Availability Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability Schedule</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Days Available</Text>
              <View style={styles.daysContainer}>
                {DAYS_OF_WEEK.map(day => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayButton,
                      driverDetails.availability?.days?.includes(day) && styles.selectedDay
                    ]}
                    onPress={() => toggleDay(day)}
                  >
                    <Text style={[
                      styles.dayButtonText,
                      driverDetails.availability?.days?.includes(day) && styles.selectedDayText
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
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowStartTimePicker(true)}
                >
                  <Text>
                    {driverDetails.availability?.startTime || 'Select Start Time'}
                  </Text>
                </TouchableOpacity>
                {showStartTimePicker && (
                  <DateTimePicker
                    value={driverDetails.availability?.startTime ? new Date(`1970-01-01T${driverDetails.availability.startTime}:00`) : new Date()}
                    mode="time"
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedTime) => {
                      setShowStartTimePicker(false);
                      if (selectedTime) {
                        const hours = selectedTime.getHours().toString().padStart(2, '0');
                        const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
                        setDriverDetails(prev => ({
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
              <View style={styles.timeInput}>
                <Text style={styles.label}>End Time</Text>
          <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowEndTimePicker(true)}
          >
                  <Text>
                    {driverDetails.availability?.endTime || 'Select End Time'}
                  </Text>
          </TouchableOpacity>
                {showEndTimePicker && (
                  <DateTimePicker
                    value={driverDetails.availability?.endTime ? new Date(`1970-01-01T${driverDetails.availability.endTime}:00`) : new Date()}
                    mode="time"
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedTime) => {
                      setShowEndTimePicker(false);
                      if (selectedTime) {
                        const hours = selectedTime.getHours().toString().padStart(2, '0');
                        const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
                        setDriverDetails(prev => ({
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

          {/* Performance Metrics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance Metrics</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Rating</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter rating (0-5)"
                keyboardType="numeric"
                value={driverDetails.rating?.toString() || ''}
                onChangeText={(text) => handleChange('rating', Number(text))}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Completed Trips</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter completed trips"
                keyboardType="numeric"
                value={driverDetails.completedTrips?.toString() || ''}
                onChangeText={(text) => handleChange('completedTrips', Number(text))}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Blackout Dates</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                style={[styles.button, { flex: 1, marginRight: 10 }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.buttonText}>Add Blackout Date</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) {
                      setDriverDetails(prev => ({
                        ...prev,
                        blackoutDates: [
                          ...prev.blackoutDates,
                          date.toISOString().split('T')[0],
                        ],
                      }));
                    }
                  }}
                />
              )}
            </View>
            {/* List blackout dates */}
            {driverDetails.blackoutDates.length > 0 && (
              <View style={{ marginTop: 10 }}>
                {driverDetails.blackoutDates.map((date, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                    <Text style={{ color: '#333', marginRight: 10 }}>{date}</Text>
          <TouchableOpacity
                      onPress={() => setDriverDetails(prev => ({
                        ...prev,
                        blackoutDates: prev.blackoutDates.filter((_, i) => i !== idx),
                      }))}
                      style={{ backgroundColor: '#dc3545', padding: 5, borderRadius: 5 }}
                    >
                      <Text style={{ color: '#fff' }}>Remove</Text>
          </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
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
            <Text style={styles.buttonText}>Update Driver</Text>
          )}
        </TouchableOpacity>
        {/* Delete Button */}
<TouchableOpacity
  style={[styles.button, styles.deleteButton, isLoading && styles.buttonDisabled]}
  onPress={handleDelete}
  disabled={isLoading}
>
  {isLoading ? (
    <ActivityIndicator color="white" />
  ) : (
    <Text style={styles.buttonText}>Delete Driver</Text>
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
  deleteButton: {
    backgroundColor: '#dc3545',
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  imagePreviewContainer: {
    marginBottom: 20,
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  activeText: {
    color: '#4cd964',
    fontWeight: 'bold',
  },
  inactiveText: {
    color: '#ff3b30',
    fontWeight: 'bold',
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
  button: {
    marginTop: 20,
    backgroundColor: "#003366",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#cccccc",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default EditDriverScreen;