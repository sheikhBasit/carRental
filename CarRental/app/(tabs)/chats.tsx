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
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { getStoredUserId } from "@/utils/storageUtil";
import { AppConstants } from "@/constants/appConstants";
import AppLayout from "../screens/AppLayout";
import { Ionicons } from "@expo/vector-icons";
import { apiFetch } from '@/utils/api';

type ChatItem = {
  id: string;
  name: string;
  profilePhoto: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  otherUserId: string;
};

const ChatScreen = () => {
  const router = useRouter();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Initial load and refresh function
  const fetchChats = async () => {
    try {
      const userId = await getStoredUserId();
      if (!userId) {
        console.log("Error User ID not found.");
        return;
      }
      const chatData = await apiFetch(`/chat/chats/${userId}`, {}, AppConstants.SOCKETS_URL);
      const processedChats = await processChatData(chatData, userId);
      setChats(processedChats);
    } catch (error) {
      console.log("Error fetching chats:", error);
      Alert.alert("Error", "Failed to load chats");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchChats();
  }, []);

  // Pull-to-refresh handler
  const handleRefresh = () => {
    setRefreshing(true);
    fetchChats();
  };

  const processChatData = async (chatData: any[], userId: string): Promise<ChatItem[]> => {
    const processedChats: ChatItem[] = [];

    for (const chat of chatData) {
      const [id1, id2] = chat.chatId.split("_");
      const otherUserId = id1 === userId ? id2 : id1;
      const lastMessage = chat.messages.length > 0 
        ? chat.messages[chat.messages.length - 1] 
        : null;

      const userDetails = await fetchUserDetails(otherUserId);

      processedChats.push({
        id: chat.chatId,
        name: userDetails?.name || `User ${otherUserId}`,
        profilePhoto: userDetails?.profilePhoto || "https://via.placeholder.com/150",
        lastMessage: lastMessage?.message || "No messages yet",
        timestamp: lastMessage?.timestamp || new Date().toISOString(),
        unreadCount: chat.messages.filter((msg: any) => 
          msg.senderId !== userId && !msg.read
        ).length,
        otherUserId: otherUserId,
      });
    }

    return processedChats.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      try {
        const response = await apiFetch(`/rental-companies/${userId}`, {}, AppConstants.LOCAL_URL);
        return {
          name: response.data.companyName,
          profilePhoto: response.data.profilePhoto,
        };
      } catch (companyError) {
        const userResponse = await apiFetch(`/users/${userId}`, {}, AppConstants.LOCAL_URL);
        return {
          name: `${userResponse.data.firstName} ${userResponse.data.lastName}`,
          profilePhoto: userResponse.data.profilePhoto,
        };
      }
    } catch (error) {
      console.log("Error fetching user details:", error);
      return null;
    }
  };

  const renderChatItem = ({ item }: { item: ChatItem }) => {
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={async () =>
          router.push({
            pathname: "/screens/chat/[chat]",
            params: {
              chat: item.id,
              userId: await getStoredUserId(),
              receiverId: item.otherUserId,
              companyName: item.name,
            },
          })
        }
      >
        <Ionicons name="person-circle-outline" size={60} color="white" />
        <View style={styles.chatContent}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text 
            style={[
              styles.lastMessage,
              item.unreadCount ? styles.unreadMessage : null
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.lastMessage}
          </Text>
        </View>
        <View style={styles.chatMeta}>
          <Text style={styles.timestamp}>
            {formatDate(item.timestamp)}
          </Text>
          {item.unreadCount ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const NoResultsComponent = () => (
    <View style={styles.noResultsContainer}>
      <Image 
        source={require('../../assets/images/chat.jpg')} 
        style={styles.image} 
        resizeMode="contain"
      />
      <Text style={styles.noResultsText}>No chats yet</Text>
      <View style={styles.rowContainer}>
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
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<NoResultsComponent />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FFF"
            colors={["#FFF"]}
          />
        }
      />
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    flexGrow: 1,
    backgroundColor: "#003366",
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#003366",
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
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
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1E5A82",
  },
  chatContent: {
    flex: 1,
    justifyContent: "center",
    marginLeft: 12,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: "#ADD8E6",
  },
  unreadMessage: {
    fontWeight: 'bold',
    color: '#FFF',
  },
  chatMeta: {
    alignItems: "flex-end",
    minWidth: 70,
  },
  timestamp: {
    fontSize: 12,
    color: "#ADD8E6",
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadCount: {
    fontSize: 12,
    color: "#FFF",
    fontWeight: 'bold',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#003366',
  },
  noResultsText: {
    fontSize: 20,
    color: "#FFF",
    fontWeight: "bold",
    marginBottom: 8,
  },
});

export default ChatScreen;