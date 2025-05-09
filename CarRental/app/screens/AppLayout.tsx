import React, { ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
}

const AppLayout = ({ children, title }: AppLayoutProps) => {
  return (
    <View style={styles.container}>
      {/* App Bar */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Screen Content */}
      <View style={styles.content}>
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            // Create a more unique key by combining index with element type
            const key = `child-${index}-${child.type.toString()}`;
            return React.cloneElement(child, { key });
          }
          return child;
        })}
      </View>
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
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#FFF", 
    flex: 1, 
    textAlign: "left" 
  },
  content: { 
    flex: 1,
  },
});

export default AppLayout;