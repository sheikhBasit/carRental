import React, { ReactNode } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, title }) => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();


  return (
    <View style={styles.container}>
      {/* App Bar */}
      <View style={styles.header}>

        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Screen Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#003366" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    marginTop: 40,
    backgroundColor: "#003366",
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#FFF", flex: 1, textAlign: "left" },
  content: { flex: 1, },
});

export default AppLayout;