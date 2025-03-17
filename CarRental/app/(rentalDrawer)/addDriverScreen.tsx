import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Button, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import RentalAppLayout from '@/app/screens/rentalAppLayout';
import { AppConstants } from '@/constants/appConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddDriverScreen = () => {
    const [driverDetails, setDriverDetails] = useState<Record<string, string>>({
        name: '',
        company: '',
        license: '',
        phNo: '',
        age: '',
        experience: '',
        cnic: '',
    });

    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [cameraVisible, setCameraVisible] = useState(false);
    const [cameraType, setCameraType] = useState<CameraType>("back");
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = React.useRef<CameraView>(null);
    const [isLoading,setIsLoading] = useState(false);

    // Function to get stored company ID
    const getStoredCompanyId = async () => {
        try {
            const companyId = await AsyncStorage.getItem('companyId');
            if (companyId) {
                setDriverDetails((prev) => ({ ...prev, company: companyId }));
            }
        } catch (error) {
            console.error("Error fetching company ID:", error);
        }
    };

    // Fetch company ID when component mounts
    useEffect(() => {
        getStoredCompanyId();
    }, []);

    const handleChange = (name: string, value: string) => {
        setDriverDetails((prev) => ({ ...prev, [name]: value }));
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
            setCameraVisible(false);
        }
    };

    function toggleCameraType() {
        setCameraType((current) => (current === 'back' ? 'front' : 'back'));
    }

    const handleSubmit = async () => {
        if (
            !driverDetails.name ||
            !driverDetails.company ||
            !driverDetails.license ||
            !driverDetails.phNo ||
            !driverDetails.age ||
            !driverDetails.experience ||
            !driverDetails.cnic
        ) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        if (!profileImage) {
            Alert.alert('Error', 'Please upload a profile image.');
            return;
        }

        const formData = new FormData();

        // Append driver details
        for (const key in driverDetails) {
            formData.append(key, driverDetails[key]);
        }

        // Append profile image
        const imageUri = profileImage;
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename!);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append("profileimg", {
            uri: imageUri,
            type: type,
            name: filename || "profile.jpg",
        } as unknown as Blob);

        try {
            const response = await fetch(`${AppConstants.LOCAL_URL}/drivers/postDriver`, {
                method: "POST",
                body: formData,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const result = await response.json();

            if (response.ok) {
                Alert.alert("Success", "Driver added successfully!");
                console.log("Response:", result);
            } else {
                Alert.alert("Error", result.message || "Something went wrong");
            }
        } catch (error) {
            console.error("Error:", error);
            Alert.alert("Error", "Failed to add the driver.");
        }
    };
    const closeCamera = () => {
        setCameraVisible(false);
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
                {profileImage && (
                    <Image source={{ uri: profileImage }} style={styles.imagePreview} />
                )}


        {/* Display Uploaded Image */}
        {profileImage && (
  <View style={styles.imagePreviewContainer}>
    <Image source={{ uri: profileImage }} style={styles.imagePreview} />
    <TouchableOpacity
      style={styles.removeImageButton}
      onPress={() => setProfileImage(null)}
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
                {/* Form Fields (Exclude company field) */}
                {Object.keys(driverDetails).map((field, index) =>
    field !== 'company' ? ( // Exclude company field
        <View key={index} style={styles.inputContainer}>
            <Text style={styles.label}>{field.charAt(0).toUpperCase() + field.slice(1)}</Text>
            <TextInput
                style={styles.input}
                placeholder={`Enter ${field}`}
                keyboardType={["age", "cnic", "phNo", "experience", "license"].includes(field) ? "numeric" : "default"}
                onChangeText={(text) => handleChange(field, ["age", "cnic", "phNo", "experience", "license"].includes(field) ? text.replace(/[^0-9]/g, '') : text)}
                value={driverDetails[field]}
            />
        </View>
    ) : null
)}


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
        button: {
        marginTop: 10,
        backgroundColor: "#003366",
        padding: 15,
        borderRadius: 5,
        alignItems: "center",
      },
      buttonDisabled: {
        backgroundColor: "#cccccc", // Disabled button color
      },
      buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
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
      cameraButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
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
    
    container: { padding: 15, backgroundColor: '#fff' },
    imageUploadContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    message: { color: '#000', fontSize: 14 },
    inputContainer: { marginBottom: 15 },
    label: { fontSize: 14, fontWeight: 'bold', color: '#004c8c', marginBottom: 5 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, backgroundColor: '#fff' },
    submitButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 20 },
    submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default AddDriverScreen;
