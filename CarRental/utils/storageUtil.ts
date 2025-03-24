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

// Load Company ID from AsyncStorage
export const loadCompanyId = async () => {
  try {
    const storedCompanyId = await AsyncStorage.getItem("companyId");
    return storedCompanyId || ""; // Return empty string if userId is not found
  } catch (error) {
    console.error("Error loading companyId:", error);
    return "";
  }
};

// Get Stored Company ID
export const getStoredCompanyId = async () => {
  try {
    const storedCompanyId = await AsyncStorage.getItem("companyId");
    if (storedCompanyId) {
      console.log("Company ID:", storedCompanyId);
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
export const setStoredNotificationPreference = async (value:any) => {
  try {
    await AsyncStorage.setItem("notificationPreference", value);
  } catch (error) {
    console.error("Error saving notification preference:", error);
  }
};

// Get notification preference
export const getStoredNotificationPreference = async () => {
  try {
    const value = await AsyncStorage.getItem("notificationPreference");
    return value;
  } catch (error) {
    console.error("Error loading notification preference:", error);
    return null;
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

// =========================
// Save User Name to AsyncStorage
export const saveUserName = async (userName: string) => {
  if (!userName) return; // Prevent saving empty userName
  try {
    await AsyncStorage.setItem("userName", userName);
  } catch (error) {
    console.error("Error saving userName:", error);
  }
};

// Load User Name from AsyncStorage
export const loadUserName = async () => {
  try {
    const storedUserName = await AsyncStorage.getItem("userName");
    return storedUserName || ""; // Return empty string if userName is not found
  } catch (error) {
    console.error("Error loading userName:", error);
    return "";
  }
};

// Get Stored User Name
export const getStoredUserName = async () => {
  try {
    const storedUserName = await AsyncStorage.getItem("userName");
    if (storedUserName) {
      console.log("User Name:", storedUserName);
      return storedUserName;
    }
    return ""; // Return empty string if not found
  } catch (error) {
    console.error("Error retrieving userName:", error);
    return "";
  }
};

// =========================
// Save User Picture to AsyncStorage
export const saveUserPicture = async (userPicture: string) => {
  if (!userPicture) return; // Prevent saving empty userPicture
  try {
    await AsyncStorage.setItem("userPicture", userPicture);
  } catch (error) {
    console.error("Error saving userPicture:", error);
  }
};

// Load User Picture from AsyncStorage
export const loadUserPicture = async () => {
  try {
    const storedUserPicture = await AsyncStorage.getItem("userPicture");
    return storedUserPicture || ""; // Return empty string if userPicture is not found
  } catch (error) {
    console.error("Error loading userPicture:", error);
    return "";
  }
};

// Get Stored User Picture
export const getStoredUserPicture = async () => {
  try {
    const storedUserPicture = await AsyncStorage.getItem("userPicture");
    if (storedUserPicture) {
      console.log("User Picture:", storedUserPicture);
      return storedUserPicture;
    }
    return ""; // Return empty string if not found
  } catch (error) {
    console.error("Error retrieving userPicture:", error);
    return "";
  }
};