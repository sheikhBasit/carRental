import RentalAppLayout from '@/app/screens/rentalAppLayout';
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const AddCarScreen = () => {
    const [carDetails, setCarDetails] = useState({
        betweenCities: '',
        registrationCity: '',
        carMake: '',
        carModel: '',
        modelYear: '',
        carTransformation: '',
        engineType: '',
        engineCapacity: '',
        seatingCapacity: '',
        bodyColor: '',
        pickupCity: '',
        carMileage: '',
        carRent: '',
        insured: '',
    });

    const [carImages, setCarImages] = useState<string[]>([]);

    const handleChange = (name: string, value: string) => {
        setCarDetails({ ...carDetails, [name]: value });
    };

    const handleImageUpload = async (source: 'gallery' | 'camera') => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'You need to grant permission to access the gallery or camera.');
            return;
        }

        const pickerOptions: ImagePicker.ImagePickerOptions = {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        };

        let result: ImagePicker.ImagePickerResult | null = null;

        if (source === 'gallery') {
            result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
        } else if (source === 'camera') {
            result = await ImagePicker.launchCameraAsync(pickerOptions);
        }

        if (result && !result.canceled && result.assets && result.assets.length > 0) {
            const newImages = result.assets.map((asset) => asset.uri);
            setCarImages([...carImages, ...newImages]);
        }
    };

    const handleSubmit = () => {
        // Validate form data
        if (
            !carDetails.betweenCities ||
            !carDetails.registrationCity ||
            !carDetails.carMake ||
            !carDetails.carModel ||
            !carDetails.modelYear ||
            !carDetails.carTransformation ||
            !carDetails.engineType ||
            !carDetails.engineCapacity ||
            !carDetails.seatingCapacity ||
            !carDetails.bodyColor ||
            !carDetails.pickupCity ||
            !carDetails.carMileage ||
            !carDetails.carRent ||
            !carDetails.insured
        ) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        if (carImages.length === 0) {
            Alert.alert('Error', 'Please upload at least one car image.');
            return;
        }

        // Submit the form data (you can replace this with your API call)
        const formData = {
            ...carDetails,
            carImages,
        };

        console.log('Form Data:', formData);
        Alert.alert('Success', 'Car details submitted successfully!');
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

                {/* Display Uploaded Images */}
                {carImages.length > 0 && (
                    <ScrollView horizontal style={styles.imagePreviewContainer}>
                        {carImages.map((uri, index) => (
                            <Image key={index} source={{ uri }} style={styles.imagePreview} />
                        ))}
                    </ScrollView>
                )}

                {/* Form Fields */}
                <View style={styles.row}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Between Cities</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Yes/No"
                            onChangeText={(text) => handleChange('betweenCities', text)}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Registration City</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Yes/No"
                            onChangeText={(text) => handleChange('registrationCity', text)}
                        />
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Car Make</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Honda"
                            onChangeText={(text) => handleChange('carMake', text)}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Car Model</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Civic"
                            onChangeText={(text) => handleChange('carModel', text)}
                        />
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Model Year</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Select a Model"
                            onChangeText={(text) => handleChange('modelYear', text)}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Car Transformation</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Automatic"
                            onChangeText={(text) => handleChange('carTransformation', text)}
                        />
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Engine Type</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Petrol"
                            onChangeText={(text) => handleChange('engineType', text)}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Engine Capacity</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="1200 cc"
                            onChangeText={(text) => handleChange('engineCapacity', text)}
                        />
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Seating Capacity</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="5"
                            onChangeText={(text) => handleChange('seatingCapacity', text)}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Body Color</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Black"
                            onChangeText={(text) => handleChange('bodyColor', text)}
                        />
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Pickup City</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Lahore"
                            onChangeText={(text) => handleChange('pickupCity', text)}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Car Mileage</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Car Mil. in km's"
                            onChangeText={(text) => handleChange('carMileage', text)}
                        />
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Car Rent (Rs)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Car rent (Rs)"
                            onChangeText={(text) => handleChange('carRent', text)}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Insured (Y/N)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Status"
                            onChangeText={(text) => handleChange('insured', text)}
                        />
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Submit</Text>
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
        flexDirection: 'row',
        marginBottom: 20,
    },
    imagePreview: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginRight: 10,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    inputContainer: { flex: 1, marginHorizontal: 5 },
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
});

export default AddCarScreen;