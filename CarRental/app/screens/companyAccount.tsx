import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AppConstants } from '@/constants/appConstants';
import { loadCompanyId } from '@/utils/storageUtil';

const CompanyAccountScreen = () => {
  const [companyData, setCompanyData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const companyId = await loadCompanyId();
        if (!companyId) {
          router.push('/(rental-tabs)');
          return;
        }

        const response = await fetch(`${AppConstants.LOCAL_URL}/rental-companies/${companyId}`);
        const data = await response.json();

        if (response.ok) {
          setCompanyData(data.company);
        } else {
          console.error('Error fetching company data:', data.message);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#003366" />
      </View>
    );
  }

  if (!companyData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No company data found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#003366" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Company Profile</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Company Information</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Company Name:</Text>
          <Text style={styles.value}>{companyData.companyName}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{companyData.email}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Phone Number:</Text>
          <Text style={styles.value}>{companyData.phNum}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bank Information</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Bank Name:</Text>
          <Text style={styles.value}>{companyData.bankName}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Account Title:</Text>
          <Text style={styles.value}>{companyData.bankTitle}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Account Number:</Text>
          <Text style={styles.value}>{companyData.accountNo}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Address Information</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{companyData.address}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>City:</Text>
          <Text style={styles.value}>{companyData.city}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Province:</Text>
          <Text style={styles.value}>{companyData.province}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CNIC Information</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>CNIC Number:</Text>
          <Text style={styles.value}>{companyData.cnic}</Text>
        </View>
        <View style={styles.cnicImages}>
          <Text style={styles.cnicLabel}>CNIC Front:</Text>
          {companyData.cnicFrontUrl && (
            <Image
              source={{ uri: companyData.cnicFrontUrl }}
              style={styles.cnicImage}
            />
          )}
          <Text style={styles.cnicLabel}>CNIC Back:</Text>
          {companyData.cnicBackUrl && (
            <Image
              source={{ uri: companyData.cnicBackUrl }}
              style={styles.cnicImage}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 15,
  },
  infoContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#000',
  },
  cnicImages: {
    marginTop: 15,
  },
  cnicLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  cnicImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default CompanyAccountScreen;
