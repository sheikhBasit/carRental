import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Define a lighter tone of #003366 for a visually appealing effect
  const LIGHTER_BLUE = "#336699"; // Softer shade of #003366

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FFFFFF", // White icons when active
        tabBarInactiveTintColor: "#003366",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "rgba(72, 156, 240, 0.9)", // Slightly transparent
          borderTopLeftRadius: 20, // Rounded top corners
          borderTopRightRadius: 20,
          height: Platform.OS === "ios" ? 80 : 70, // Slightly larger for better spacing
          paddingBottom: Platform.OS === "ios" ? 20 : 10,
          borderTopWidth: 0, // Remove border for a seamless effect
          elevation: 5, // Adds a subtle shadow on Android
          shadowColor: "#003366", // Soft shadow
          shadowOpacity: 0.2,
          shadowRadius: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperclip.circle.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tripScreen"
        options={{
          title: "Trips",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="car" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}