import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { getStoredUserId } from "@/utils/storageUtil";
import { AppConstants } from "@/constants/appConstants";
import AppLayout from "../screens/AppLayout";
import { Ionicons } from "@expo/vector-icons";

type ChatItem = {
  id: string;
  name: string;
  profilePhoto: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
};

const ChatScreen = () => {
  const router = useRouter();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const userId = await getStoredUserId();
      if (!userId) {
        Alert.alert("Error", "User ID not found.");
        return;
      }

      const response = await fetch(`${AppConstants.SOCKETS_URL}/chat/chats/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch chats.");
      }

      const data = await response.json();
      const groupedChats = await groupChatsByUser(data, userId); // Await the grouped chats
      setChats(groupedChats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      Alert.alert("Error", "Failed to fetch chats.");
    } finally {
      setLoading(false);
    }
  };

  const groupChatsByUser = async (chats: any[], userId: string): Promise<ChatItem[]> => {
    const grouped: { [key: string]: ChatItem } = {};

    for (const chat of chats) {
      const [senderId, receiverId] = chat.chatId.split("_");
      const otherUserId = senderId === userId ? receiverId : senderId;

      if (!grouped[otherUserId]) {
        // Fetch company details for the otherUserId
        const companyDetails = await fetchCompanyDetails(otherUserId);
        console.log("Company details:", companyDetails);

        // Use the company name if available, otherwise fall back to `otherUserId`
        const companyName = companyDetails?.companyName || `User ${otherUserId}`;

        grouped[otherUserId] = {
          id: chat.chatId,
          name: companyName, // Use the company name
          profilePhoto: companyDetails?.profilePhoto || "https://via.placeholder.com/150", // Use company profile photo if available
          lastMessage: chat.messages[chat.messages.length - 1]?.message || "No messages",
          timestamp: chat.messages[chat.messages.length - 1]?.timestamp || "N/A",
          unreadCount: 0,
        };
      }
    }

    return Object.values(grouped) as ChatItem[];
  };

  const fetchCompanyDetails = async (companyId: string) => {
    try {
      const response = await fetch(`${AppConstants.LOCAL_URL}/rental-companies/${companyId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch company details.");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching company details:", error);
      return null;
    }
  };

  const renderChatItem = ({ item }: { item: ChatItem }) => {
    const [userId, receiverId] = item.id.split("_");

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() =>
          router.push({
            pathname: "/screens/chat/[chat]",
            params: {
              chat: item.id, // Use the chatId directly
              userId,
              receiverId,
              companyName: item.name, // Pass the company name
            },
          })
        }
      >
        <Ionicons name="person-circle-outline" size={60} color="white" />
        <View style={styles.chatContent}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.lastMessage}>{item.lastMessage}</Text>
        </View>
        <View style={styles.chatMeta}>
          <Text style={styles.timestamp}>{item.timestamp.split('T')[0]}</Text>
          {item.unreadCount && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const NoResultsComponent = () => (
    <View style={styles.noResultsContainer}>
      <Image source={require('../../assets/images/chat.jpg')} style={styles.image} />
      <Text style={styles.noResultsText}>No chats found</Text>
      <View style={styles.rowContainer}>
        <Text style={styles.noResultsSubText}>Start a new conversation!</Text>
        <Ionicons name="chatbubbles-outline" size={24} color="#ADD8E6" style={styles.icon} />
      </View>
    </View>
  );

  if (loading) {
    return (
      <AppLayout title="Chats">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFF" />
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Chats">
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={styles.container}
        ListEmptyComponent={<NoResultsComponent />}
      />
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003366",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  icon: {
    marginLeft: 8,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1E5A82",
  },
  profilePhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  chatContent: {
    flex: 1,
    justifyContent: "center",
    paddingLeft: 15,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  lastMessage: {
    fontSize: 14,
    color: "#ADD8E6",
    marginTop: 4,
  },
  chatMeta: {
    alignItems: "flex-end",
  },
  timestamp: {
    fontSize: 12,
    color: "#ADD8E6",
  },
  unreadBadge: {
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  unreadCount: {
    fontSize: 12,
    color: "#FFF",
  },
  noResultsContainer: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  noResultsText: {
    fontSize: 24,
    color: "#FFF",
    textAlign: "center",
    marginTop: 16,
    fontWeight: "bold",
  },
  noResultsSubText: {
    fontSize: 14,
    color: "#ADD8E6",
    textAlign: "center",
    marginTop: 8,
  },
});

export default ChatScreen;