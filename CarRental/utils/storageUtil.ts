import AsyncStorage from "@react-native-async-storage/async-storage";

// Save City to AsyncStorage
export const saveCity = async (cityName: string) => {
  if (!cityName) return; // Prevent saving empty city
  try {
    await AsyncStorage.setItem("userCity", cityName);
  } catch (error) {
    console.error("Error saving city:", error);
  }
};

// Load City from AsyncStorage
export const loadCity = async () => {
  try {
    const storedCity = await AsyncStorage.getItem("userCity");
    return storedCity || ""; // Return empty string if city is not found
  } catch (error) {
    console.error("Error loading city:", error);
    return "";
  }
};

// Get Stored City
export const getStoredCity = async () => {
  try {
    const storedCity = await AsyncStorage.getItem("userCity");
    if (storedCity) {
      console.log("User city:", storedCity);
      return storedCity;
    }
    return ""; // Return empty string if not found
  } catch (error) {
    console.error("Error retrieving city:", error);
    return "";
  }
};

// =========================
// Save Company ID to AsyncStorage
export const saveCompanyId = async (companyId: string) => {
  if (!companyId) return; // Prevent saving empty userId
  try {
    await AsyncStorage.setItem("companyId", companyId);
  } catch (error) {
    console.error("Error saving companyId:", error);
  }
};

// Load User ID from AsyncStorage
export const loadCompanyId = async () => {
  try {
    const storedCompanyId = await AsyncStorage.getItem("companyId");
    return storedCompanyId || ""; // Return empty string if userId is not found
  } catch (error) {
    console.error("Error loading companyId:", error);
    return "";
  }
};

// Get Stored User ID
export const getStoredCompanyId = async () => {
  try {
    const storedCompanyId = await AsyncStorage.getItem("companyId");
    if (storedCompanyId) {
      console.log("company ID:", storedCompanyId);
      return storedCompanyId;
    }
    return ""; // Return empty string if not found
  } catch (error) {
    console.error("Error retrieving CompanyId:", error);
    return "";
  }
};


// =========================
// Save User ID to AsyncStorage
export const saveUserId = async (userId: string) => {
    if (!userId) return; // Prevent saving empty userId
    try {
      await AsyncStorage.setItem("userId", userId);
    } catch (error) {
      console.error("Error saving userId:", error);
    }
  };
  
  // Load User ID from AsyncStorage
  export const loadUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      return storedUserId || ""; // Return empty string if userId is not found
    } catch (error) {
      console.error("Error loading userId:", error);
      return "";
    }
  };
  
  // Get Stored User ID
  export const getStoredUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      if (storedUserId) {
        console.log("User ID:", storedUserId);
        return storedUserId;
      }
      return ""; // Return empty string if not found
    } catch (error) {
      console.error("Error retrieving userId:", error);
      return "";
    }
  };
  