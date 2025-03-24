import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LikedVehiclesContextType = {
  likedVehicles: string[];
  toggleLike: (vehicleId: string) => Promise<void>;
};

const LikedVehiclesContext = createContext<LikedVehiclesContextType | undefined>(undefined);

export const LikedVehiclesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [likedVehicles, setLikedVehicles] = useState<string[]>([]);

  useEffect(() => {
    loadLikedVehicles();
  }, []);

  const loadLikedVehicles = async () => {
    try {
      const storedLikes = await AsyncStorage.getItem('likedVehicles');
      if (storedLikes) {
        setLikedVehicles(JSON.parse(storedLikes));
      }
    } catch (error) {
      console.error('Error loading liked vehicles:', error);
    }
  };

  const toggleLike = async (vehicleId: string) => {
    try {
      let updatedLikes = [...likedVehicles];

      if (updatedLikes.includes(vehicleId)) {
        updatedLikes = updatedLikes.filter(id => id !== vehicleId);
      } else {
        updatedLikes.push(vehicleId);
      }

      setLikedVehicles(updatedLikes);
      await AsyncStorage.setItem('likedVehicles', JSON.stringify(updatedLikes));
    } catch (error) {
      console.error('Error updating liked vehicles:', error);
    }
  };

  return (
    <LikedVehiclesContext.Provider value={{ likedVehicles, toggleLike }}>
      {children}
    </LikedVehiclesContext.Provider>
  );
};

export const useLikedVehicles = () => {
  const context = useContext(LikedVehiclesContext);
  if (!context) {
    throw new Error('useLikedVehicles must be used within a LikedVehiclesProvider');
  }
  return context;
};