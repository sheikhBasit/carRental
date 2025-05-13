import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Button, ActivityIndicator, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import RentalAppLayout from '@/app/screens/rentalAppLayout';
import { AppConstants } from '@/constants/appConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DriverDetails {
    name: string;
    profileimg: string;
    company: string;
    license: string;
    cnic: string;
    phNo: string;
    age: string;
    experience: string;
    baseDailyRate: string;
    availability: {
        days: string[];
        startTime: string;
        endTime: string;
    };
    blackoutDates: string[];
    rating: number;
    completedTrips: number;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AddDriverScreen = () => {
    const navigation = useNavigation();
  
    const [driverDetails, setDriverDetails] = useState<DriverDetails>({
        name: '',
        profileimg: '',
        company: '',
        license: '',
        phNo: '',
        age: '',
        experience: '',
        cnic: '',
        baseDailyRate: '',
        availability: {
            days: [],
            startTime: '09:00',
            endTime: '17:00',
        },
        blackoutDates: [],
        rating: 0,
        completedTrips: 0,
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [cameraVisible, setCameraVisible] = useState(false);
    const [cameraType, setCameraType] = useState<CameraType>("back");
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = React.useRef<CameraView>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

    // Function to get stored company ID
    const getStoredCompanyId = async () => {
        try {
            const companyId = await AsyncStorage.getItem('companyId');
            if (companyId) {
                setDriverDetails(prev => ({ ...prev, company: companyId }));
            }
        } catch (error) {
            throw error;
        }
    };

    useEffect(() => {
        getStoredCompanyId();
    }, []);

    const handleChange = (name: keyof DriverDetails, value: string | number | boolean) => {
        // Clear any existing error for this field
        setFieldErrors(prev => ({ ...prev, [name]: '' }));

        // Special handling for numeric fields
        if (['age', 'experience', 'phNo', 'cnic', 'license',  'baseDailyRate'].includes(name)) {
          if (name === 'cnic' && typeof value === 'string') {
            // Remove all non-digit characters
            const digitsOnly = value.replace(/\D/g, '');
            // Format as XXXXX-XXXXXXX-X
            let formatted = '';
            if (digitsOnly.length > 0) {
              formatted = digitsOnly.slice(0, Math.min(5, digitsOnly.length));
            }
            if (digitsOnly.length > 5) {
              formatted += '-' + digitsOnly.slice(5, Math.min(12, digitsOnly.length));
            }
            if (digitsOnly.length > 12) {
              formatted += '-' + digitsOnly.slice(12);
            }
            value = formatted;
          } else if (name === 'license' && typeof value === 'string') {
            // Convert to uppercase and remove spaces
            value = value.toUpperCase().replace(/\s/g, '');
          } else if (name === 'phNo' && typeof value === 'string') {
            // Remove all non-digit characters
            const digitsOnly = value.replace(/\D/g, '');
            
            // If empty, set to +92
            if (digitsOnly.length === 0) {
              value = '+92';
            } else {
              // Format as +92 or 0 followed by 3[0-4][0-9] and 7 digits
              let formatted = '';
              
              // Check if it starts with 92 or 0
              if (digitsOnly.startsWith('92')) {
                formatted = '+' + digitsOnly;
              } else if (digitsOnly.startsWith('0')) {
                formatted = digitsOnly;
              } else {
                // If it doesn't start with 92 or 0, add +92
                formatted = '+92' + digitsOnly;
              }
              
              // Ensure it starts with 3 after the prefix
              if (formatted.length > 3 && formatted[formatted.length - 1] === '3') {
                // If user just typed 3, keep it
              } else if (formatted.length > 3 && !formatted.includes('3')) {
                // If no 3 found after prefix, add it
                formatted = formatted.slice(0, 3) + '3' + formatted.slice(3);
              }
              
              // Add hyphen after 4 digits (including prefix)
              if (formatted.length > 7 && !formatted.includes('-')) {
                // For +92 format, hyphen goes after 4 digits (including +92)
                if (formatted.startsWith('+92')) {
                  formatted = formatted.slice(0, 7) + '-' + formatted.slice(7);
                }
                // For 0 format, hyphen goes after 4 digits
                else if (formatted.startsWith('0')) {
                  formatted = formatted.slice(0, 4) + '-' + formatted.slice(4);
                }
              }
              
              // Limit to 14 digits (including +92 and hyphen)
              value = formatted.slice(0, 14);
            }
          } else if (typeof value === 'string') {
            // For other numeric fields, only allow numbers
            value = value.replace(/[^0-9]/g, '');
          }
        }
        
        // Name field - only letters and spaces
        if (name === 'name' && typeof value === 'string') {
            value = value.replace(/[^a-zA-Z\s]/g, '');
            if (value.length > 50) return;
        }

        setDriverDetails(prev => ({ ...prev, [name]: value }));
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

    const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
        setDriverDetails(prev => ({
            ...prev,
            availability: {
                ...prev.availability,
                [field]: value
            }
        }));
    };

    const validateField = (name: keyof DriverDetails, value: string | number | boolean | any): string => {
        if (typeof value === 'string' && !value && name !== 'profileimg') return 'This field is required';

        switch (name) {
            case 'name':
                if (typeof value === 'string') {
                if (value.length < 3) return 'Name must be at least 3 characters';
                if (!/^[a-zA-Z\s]+$/.test(value)) return 'Only letters and spaces allowed';
                }
                break;
            case 'license':
                if (typeof value === 'string') {
                    if (!value) return 'License is required';
                    if (!/^[A-Z0-9]+$/.test(value)) return 'License must contain only uppercase letters and numbers';
                }
                break;
            case 'phNo':
                if (typeof value === 'string') {
                    // Remove any existing hyphen for validation
                    const cleanValue = value.replace(/-/g, '');
                    if (!/^(\+92|0)3[0-4][0-9][0-9]{7}$/.test(cleanValue)) {
                        return 'Phone must be in format: +923XX-XXXXXXX or 03XX-XXXXXXX';
                    }
                }
                break;
            case 'age':
                const age = parseInt(value as string);
                if (isNaN(age)) return 'Invalid age';
                if (age < 20 || age > 50) return 'Age must be between 20 and 50 years';
                break;
            case 'experience':
                const experience = parseInt(value as string);
                if (isNaN(experience)) return 'Invalid experience';
                if (experience < 0 || experience > 50) return 'Experience must be between 0 and 50 years';
                break;
            case 'cnic':
                if (typeof value === 'string') {
                    if (!/^[0-9]{5}-[0-9]{7}-[0-9]$/.test(value)) {
                        return 'CNIC must be in format: XXXXX-XXXXXXX-X';
                    }
                }
                break;
            case 'baseDailyRate':
                const rate = parseFloat(value as string);
                if (isNaN(rate) || rate <= 0) return 'Rate must be greater than 0';
                
               
                break;
            case 'profileimg':
                if (typeof value === 'string' && !/\.(jpg|jpeg|png|webp)$/i.test(value)) {
                    return 'Image must be in jpg, jpeg, png, or webp format';
                }
                break;
            case 'availability':
                if (!value.days || value.days.length === 0) return 'Select at least one day';
                if (!value.startTime || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value.startTime)) {
                    return 'Invalid start time format (HH:MM)';
                }
                if (!value.endTime || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value.endTime)) {
                    return 'Invalid end time format (HH:MM)';
                }
                break;
        }

        return '';
    };

    const validateAllFields = (): boolean => {
        const errors: Record<string, string> = {};
        let isValid = true;

        // Check all basic fields
        Object.keys(driverDetails).forEach(key => {
            if (key !== 'company' && key !== 'profileimg'  && 
                key !== 'blackoutDates' && key !== 'rating' && key !== 'completedTrips') {
                const fieldKey = key as keyof DriverDetails;
                const error = validateField(fieldKey, driverDetails[fieldKey]);
                if (error) {
                    errors[key] = error;
                    isValid = false;
                }
            }
        });

        // Check availability
        const availabilityError = validateField('availability', driverDetails.availability);
        if (availabilityError) {
            errors['availability'] = availabilityError;
            isValid = false;
        }

        setFieldErrors(errors);
        return isValid;
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

            if (!result.canceled && result.assets.length > 0) {
                setProfileImage(result.assets[0].uri);
                setDriverDetails(prev => ({ ...prev, profileimg: result.assets[0].uri }));
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
          setProfileImage(photo!.uri);
          setDriverDetails(prev => ({ ...prev, profileimg: photo!.uri }));
          setCameraVisible(false);
      }
  };

    const toggleCameraType = () => {
        setCameraType(current => (current === 'back' ? 'front' : 'back'));
    };

    const handleSubmit = async () => {
        if (!profileImage) {
          Alert.alert('Error', 'Please upload a profile image');
            return;
        }

        if (!validateAllFields()) {
          return;
        }

        setIsLoading(true);
        
        const formattedDetails = {
          ...driverDetails,
          age: parseInt(driverDetails.age),
          experience: parseInt(driverDetails.experience),
          baseDailyRate: parseFloat(driverDetails.baseDailyRate),
          license: driverDetails.license.toUpperCase(),
          cnic: driverDetails.cnic.replace(/\s/g, ''),
          phNo: driverDetails.phNo.trim(),
        };
        
        const formData = new FormData();
        
        // Append basic fields
        for (const key in formattedDetails) {
          if (
            key !== 'availability' &&
            key !== 'blackoutDates' &&
            key !== 'profileimg'
          ) {
            formData.append(
              key,
              String(formattedDetails[key as keyof typeof formattedDetails])
            );
          }
        }
      
        // Append availability days
        formattedDetails.availability.days.forEach((day, index) => {
          formData.append(`availability[days][${index}]`, day);
        });
      
        formData.append('availability[startTime]', formattedDetails.availability.startTime);
        formData.append('availability[endTime]', formattedDetails.availability.endTime);
      
        // Add profile image
        const imageUri = profileImage;
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename!);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('profileimg', {
            uri: imageUri,
            type,
            name: filename || 'profile.jpg',
        } as any);

        const companyAccessToken = await AsyncStorage.getItem('companyAccessToken');    
        try {
          const response = await fetch(`${AppConstants.LOCAL_URL}/drivers/postDriver`, {
            method: 'POST',
            body: formData,
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${companyAccessToken}`,
            },
          });

          let result;
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            result = await response.json();
          } else {
            const text = await response.text();
            throw new Error('Server returned non-JSON response');
          }

          if (response.ok) {
            Alert.alert('Success', 'Driver added successfully!', [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]);
          } else {
            const errorMessage = result.message || result.error || 'Something went wrong';
            Alert.alert('Error', errorMessage);
          }
        } catch (error) {
          let errorMessage = 'Failed to add the driver';
          if (error instanceof Error) {
            errorMessage = error.message;
          }
          Alert.alert('Error', errorMessage);
        } finally {
          setIsLoading(false);
        }
    };

    const closeCamera = () => {
        setCameraVisible(false);
    };

    const onStartTimeChange = (event: any, selectedTime?: Date) => {
        const currentTime = selectedTime || new Date();
        setShowStartTimePicker(Platform.OS === 'ios');
        
        const hours = currentTime.getHours().toString().padStart(2, '0');
        const minutes = currentTime.getMinutes().toString().padStart(2, '0');
        const timeString = `${hours}:${minutes}`;
        
        setDriverDetails(prev => ({
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
        
        setDriverDetails(prev => ({
            ...prev,
            availability: {
                ...prev.availability,
                endTime: timeString
            }
        }));
    };

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to use the camera</Text>
                <Button onPress={requestPermission} title="Grant Permission" />
            </View>
        );
    }

    return (
        <RentalAppLayout title="Add Driver">
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
                {profileImage && (
                    <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: profileImage }} style={styles.imagePreview} />
                        <TouchableOpacity
                            style={styles.removeImageButton}
                            onPress={() => {
                                setProfileImage(null);
                                setDriverDetails(prev => ({ ...prev, profileimg: '' }));
                            }}
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
                                <TouchableOpacity style={styles.cameraButton} onPress={closeCamera}>
                                    <Text style={styles.cameraButtonText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </CameraView>
                    </View>
                )}

                {/* Basic Form Fields */}
                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>
                    
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            style={[
                                styles.input,
                                fieldErrors['name'] && styles.inputError
                            ]}
                            placeholder="Enter name"
                            value={driverDetails.name}
                            onChangeText={(text) => handleChange('name', text)}
                            onBlur={() => {
                                const error = validateField('name', driverDetails.name);
                                setFieldErrors(prev => ({ ...prev, name: error }));
                            }}
                        />
                        {fieldErrors['name'] && (
                            <Text style={styles.errorText}>{fieldErrors['name']}</Text>
                        )}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>License Number</Text>
                        <TextInput
                            style={[
                                styles.input,
                                fieldErrors['license'] && styles.inputError
                            ]}
                            placeholder="Enter license number"
                            value={driverDetails.license}
                            onChangeText={(text) => handleChange('license', text)}
                            maxLength={15}
                            onBlur={() => {
                                const error = validateField('license', driverDetails.license);
                                setFieldErrors(prev => ({ ...prev, license: error }));
                            }}
                        />
                        {fieldErrors['license'] && (
                            <Text style={styles.errorText}>{fieldErrors['license']}</Text>
                        )}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>CNIC (13 digits)</Text>
                        <TextInput
                            style={[
                                styles.input,
                                fieldErrors['cnic'] && styles.inputError
                            ]}
                            placeholder="Enter CNIC"
                            keyboardType="numeric"
                            value={driverDetails.cnic}
                            onChangeText={(text) => handleChange('cnic', text)}
                            maxLength={15}
                            onBlur={() => {
                                const error = validateField('cnic', driverDetails.cnic);
                                setFieldErrors(prev => ({ ...prev, cnic: error }));
                            }}
                        />
                        {fieldErrors['cnic'] && (
                            <Text style={styles.errorText}>{fieldErrors['cnic']}</Text>
                        )}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={[
                                styles.input,
                                fieldErrors['phNo'] && styles.inputError
                            ]}
                            placeholder="+923XX-XXXXXXX or 03XX-XXXXXXX"
                            keyboardType="phone-pad"
                            value={driverDetails.phNo}
                            onChangeText={(text) => handleChange('phNo', text)}
                            maxLength={14}
                            onBlur={() => {
                                const error = validateField('phNo', driverDetails.phNo);
                                setFieldErrors(prev => ({ ...prev, phNo: error }));
                            }}
                        />
                        {fieldErrors['phNo'] && (
                            <Text style={styles.errorText}>{fieldErrors['phNo']}</Text>
                        )}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Age (years)</Text>
                        <TextInput
                            style={[
                                styles.input,
                                fieldErrors['age'] && styles.inputError
                            ]}
                            placeholder="Enter age"
                            keyboardType="numeric"
                            value={driverDetails.age}
                            onChangeText={(text) => handleChange('age', text)}
                            onBlur={() => {
                                const error = validateField('age', driverDetails.age);
                                setFieldErrors(prev => ({ ...prev, age: error }));
                            }}
                        />
                        {fieldErrors['age'] && (
                            <Text style={styles.errorText}>{fieldErrors['age']}</Text>
                        )}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Experience (years)</Text>
                        <TextInput
                            style={[
                                styles.input,
                                fieldErrors['experience'] && styles.inputError
                            ]}
                            placeholder="Enter experience"
                            keyboardType="numeric"
                            value={driverDetails.experience}
                            onChangeText={(text) => handleChange('experience', text)}
                            onBlur={() => {
                                const error = validateField('experience', driverDetails.experience);
                                setFieldErrors(prev => ({ ...prev, experience: error }));
                            }}
                        />
                        {fieldErrors['experience'] && (
                            <Text style={styles.errorText}>{fieldErrors['experience']}</Text>
                        )}
                    </View>
                </View>

                {/* Rate Information */}
                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>Pricing Information</Text>
                    
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Base Daily Rate (PKR)</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                fieldErrors['baseDailyRate'] && styles.inputError
                            ]}
                            placeholder="Enter daily rate"
                            keyboardType="numeric"
                            value={driverDetails.baseDailyRate}
                            maxLength={4}

                            onChangeText={(text) => handleChange('baseDailyRate', text)}
                                onBlur={() => {
                                const error = validateField('baseDailyRate', driverDetails.baseDailyRate);
                                setFieldErrors(prev => ({ ...prev, baseDailyRate: error }));
                            }}
                        />
                        {fieldErrors['baseDailyRate'] && (
                            <Text style={styles.errorText}>{fieldErrors['baseDailyRate']}</Text>
                        )}
                    </View>
                </View>

                {/* Availability Section */}
                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>Availability Schedule</Text>
                    
                    {fieldErrors['availability'] && (
                        <Text style={styles.errorText}>{fieldErrors['availability']}</Text>
                    )}
                    
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Days Available</Text>
                        <View style={styles.daysContainer}>
                            {DAYS_OF_WEEK.map(day => (
                                <TouchableOpacity
                                    key={day}
                                    style={[
                                        styles.dayButton,
                                        driverDetails.availability.days.includes(day) && styles.selectedDay
                                    ]}
                                    onPress={() => toggleDay(day)}
                                >
                                    <Text style={[
                                        styles.dayButtonText,
                                        driverDetails.availability.days.includes(day) && styles.selectedDayText
                                    ]}>
                                        {day.substring(0, 3)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                        <Text style={styles.label}>For 24 hours select 12:00 AM to 11:59 PM</Text>
                    <View style={styles.row}>
                        <View style={[styles.inputContainer, styles.halfWidth]}>
                           
                            <Text style={styles.label}>Start Time</Text>
                            <TouchableOpacity
                                style={styles.timeInput}
                                onPress={() => setShowStartTimePicker(true)}
                            >
                                <Text style={styles.timeText}>{driverDetails.availability.startTime}</Text>
                            </TouchableOpacity>
                            {showStartTimePicker && (
                                <DateTimePicker
                                    value={new Date(`1970-01-01T${driverDetails.availability.startTime}`)}
                                    mode="time"
                                    display="default"
                                    onChange={onStartTimeChange}
                                />
                            )}
                        </View>
                        <View style={[styles.inputContainer, styles.halfWidth]}>
                            <Text style={styles.label}>End Time</Text>
                            <TouchableOpacity
                                style={styles.timeInput}
                                onPress={() => setShowEndTimePicker(true)}
                            >
                                <Text style={styles.timeText}>{driverDetails.availability.endTime}</Text>
                            </TouchableOpacity>
                            {showEndTimePicker && (
                                <DateTimePicker
                                    value={new Date(`1970-01-01T${driverDetails.availability.endTime}`)}
                                    mode="time"
                                    display="default"
                                    onChange={onEndTimeChange}
                                />
                            )}
                        </View>
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.button, (isLoading || Object.keys(fieldErrors).some(k => fieldErrors[k])) && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={isLoading || Object.keys(fieldErrors).some(k => fieldErrors[k])}
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
        padding: 15,
        backgroundColor: '#fff',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    backButton: {
        position: "absolute",
        top: -27,
        left: 1,
        zIndex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 5,
    },
    imageUploadContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
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
        color: '#004c8c',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    inputError: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
    },
    button: {
        marginTop: 20,
        backgroundColor: "#003366",
        padding: 15,
        borderRadius: 5,
        alignItems: "center",
    },
    buttonDisabled: {
        backgroundColor: "#cccccc",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    message: {
        color: '#000',
        fontSize: 14,
    },
    formSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#004c8c',
        marginBottom: 10,
    },
    daysContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayButton: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 5,
        margin: 5,
    },
    dayButtonText: {
        fontSize: 14,
        color: '#000',
    },
    selectedDay: {
        backgroundColor: '#007bff',
    },
    selectedDayText: {
        color: '#fff',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfWidth: {
        flex: 1,
    },
    timeInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 16,
        color: '#000',
    },
});

export default AddDriverScreen;