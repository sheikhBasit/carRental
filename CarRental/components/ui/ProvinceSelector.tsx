import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface PakistaniProvinceSelectorProps {
  value: string;
  onChange: (province: string) => void;
  label?: string;
}

const PakistaniProvinces = [
  { label: 'Punjab', value: 'Punjab' },
  { label: 'Sindh', value: 'Sindh' },
  { label: 'Khyber Pakhtunkhwa', value: 'Khyber Pakhtunkhwa' },
  { label: 'Balochistan', value: 'Balochistan' },
  { label: 'Islamabad Capital Territory', value: 'Islamabad' },
];

const PakistaniProvinceSelector: React.FC<PakistaniProvinceSelectorProps> = ({ value, onChange, label = 'Province' }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Picker
        selectedValue={value}
        onValueChange={(itemValue) => onChange(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Province" value="" />
        {PakistaniProvinces.map((province) => (
          <Picker.Item
            key={province.value}
            label={province.label}
            value={province.value}
          />
        ))}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  picker: {
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    padding: 12,
    fontSize: 16,
    color: '#666',
  },
});

export default PakistaniProvinceSelector;
