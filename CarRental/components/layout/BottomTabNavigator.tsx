import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../../app/(drawer)/(tabs)";
import ExploreScreen from "../../app/(drawer)/(tabs)/explore";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap = "home-outline"; // Default icon
    
        if (route.name === "Home") iconName = "home-outline";
        else if (route.name === "Explore") iconName = "compass-outline";
          // else if (route.name === "My Trips") iconName = "calendar-outline";
          // else if (route.name === "Saved") iconName = "bookmark-outline";
          // else if (route.name === "My Cars") iconName = "car-outline";

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarStyle: { backgroundColor: "#fff", borderTopWidth: 0, height: 60 },
      tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
      tabBarActiveTintColor: "#0A3D62",
      tabBarInactiveTintColor: "#7f8c8d",
    })}
     >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      {/* <Tab.Screen name="My Trips" component={TripScreen} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="My Cars" component={MyRentalCarsScreen} /> */}
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
