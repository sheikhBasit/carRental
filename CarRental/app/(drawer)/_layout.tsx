import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Drawer } from "expo-router/drawer";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Custom Drawer Component
const CustomDrawerContent = (props: any) => {
  const router = useRouter();

  // Handle logout functionality
  const handleLogout = () => {
    // Perform logout actions here (e.g., clear user session, reset state, etc.)
    console.log("User logged out");

    // Navigate to the login or start screen
    router.replace("/auth/startScreen");
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <Image
          source={{ uri: "https://via.placeholder.com/100" }} // Replace with actual user image
          style={styles.profileImage}
        />
        <Text style={styles.userName}>Bilal Xaighum</Text>
        <Text style={styles.userEmail}>bilalxaighum442</Text>
      </View>
      <DrawerItemList {...props} />
      {/* Custom Log Out Button */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Ionicons name="exit-outline" size={24} color="#FF3B30" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

export default function DrawerLayout() {
  return (
    <Drawer
    screenOptions={{
      headerShown: false,
      drawerType: "slide",
    }}
    drawerContent={(props) => <CustomDrawerContent {...props} />}
  >
    {/* Define your drawer screens here */}
    <Drawer.Screen
      name="(tabs)" // Embed the tabs layout inside the drawer
      options={{
        title: "Home",
        drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
      }}
    />
    <Drawer.Screen
      name="contact"
      options={{
        title: "Contact Us",
        drawerIcon: ({ color, size }) => <Ionicons name="call-outline" size={size} color={color} />,
      }}
    />
    <Drawer.Screen
      name="terms"
      options={{
        title: "Terms & Conditions",
        drawerIcon: ({ color, size }) => <Ionicons name="document-text-outline" size={size} color={color} />,
      }}
    />
    <Drawer.Screen
      name="about"
      options={{
        title: "About Us",
        drawerIcon: ({ color, size }) => <Ionicons name="information-circle-outline" size={size} color={color} />,
      }}
    />
  </Drawer>
  );
}

// Styles
const styles = StyleSheet.create({
  drawerHeader: {
    backgroundColor: "#1E88E5",
    padding: 20,
    alignItems: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 14,
    color: "#fff",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginLeft: 16,
  },
  logoutText: {
    fontSize: 16,
    color: "#003366",
    marginLeft: 16,
  },
});