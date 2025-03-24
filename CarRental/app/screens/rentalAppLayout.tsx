import React, { ReactNode } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";

interface RentalAppLayoutProps {
  children: ReactNode;
  title: string;
}

const RentalAppLayout: React.FC<RentalAppLayoutProps> = ({ children, title }) => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  const toggleDrawer = () => {
    if (navigation.dispatch) {
      navigation.dispatch(DrawerActions.toggleDrawer());
    } else {
      console.warn("Drawer navigator is not available.");
    }
  };

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

    justifyContent: "space-between",
    
    marginTop: 60,
    backgroundColor: "#003366",
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#FFF", flex: 1, marginLeft: 40 },
  content: { flex: 1, padding: 10 },
});

export default RentalAppLayout;