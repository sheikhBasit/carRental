import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import io from "socket.io-client";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppConstants } from "@/constants/appConstants";
import { Ionicons } from "@expo/vector-icons";
import { IconSymbol } from "@/components/ui/IconSymbol";
import NetInfo from "@react-native-community/netinfo";

// Define message type
interface Message {
  _id?: string; // Optional _id for messages
  senderId: string;
  receiverId: string;
  message: string;
  timestamp?: string;
  chatId: string;
  status?: "sending" | "sent" | "failed"; // Strictly typed
}

// Initialize Socket.io connection
const socket = io(`${AppConstants.SOCKETS_URL}`);
const useChatController = (userId: string, receiverId: string) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [message, setMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
  
    // Cache key for messages
    const cacheKey = `chat_${[userId, receiverId].sort().join("_")}`;
  
    // Load cached messages
    const loadCachedMessages = async () => {
      try {
        const cachedMessages = await AsyncStorage.getItem(cacheKey);
        if (cachedMessages) {
          const parsedMessages = JSON.parse(cachedMessages);
          if (Array.isArray(parsedMessages)) {
            setMessages(parsedMessages);
          } else {
            console.warn("Cached messages are not in array format");
          }
        }
      } catch (err) {
        console.error("Error loading cached messages:", err);
      }
    };
  
    // Save messages to cache
    const saveMessagesToCache = async (messages: Message[]) => {
      try {
        await AsyncStorage.setItem(cacheKey, JSON.stringify(messages));
      } catch (err) {
        console.error("Error saving messages to cache:", err);
      }
    };
  
    // Flatten batched messages into a single array
    const flattenBatchedMessages = (batches: any[]) => {
      return batches.flatMap((batch) =>
        batch.messages.map((msg: any) => ({
          ...msg,
          chatId: batch.chatId,
          timestamp: msg.timestamp || batch.endTime,
        }))
      );
    };
  
    useEffect(() => {
      if (!userId || !receiverId) return;
  
      // Load cached messages
      loadCachedMessages();
  
      // Connect to the socket if not already connected
      if (!socket.connected) {
        socket.connect();
      }
  
      // Log socket connection status
      socket.on("connect", () => {
        console.log("Socket connected:", socket.connected);
      });
  
      socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });
  
      // Join the chat room
      const chatId = [userId, receiverId].sort().join("_");
      socket.emit("joinChat", { chatId });
  
      // Fetch previous messages (batched)
      setLoading(true);
      axios
        .get(`${AppConstants.SOCKETS_URL}/chat/messages/${userId}/${receiverId}`)
        .then((response) => {
          console.log(response.data);
          const flattenedMessages = flattenBatchedMessages(response.data);
  
          // Merge with cached messages and remove duplicates
          const mergedMessages = [...messages, ...flattenedMessages].filter(
            (msg, index, self) =>
              index === self.findIndex((m) => m.timestamp === msg.timestamp && m.message === msg.message)
          );
  
          setMessages(mergedMessages);
          setError(null); // Clear any previous errors
          saveMessagesToCache(mergedMessages); // Cache fetched messages
        })
        .catch((err) => {
          if (err.response?.status === 404) {
            setError("No messages found."); // Handle 404 (no messages)
          } else if (err.response?.status === 500) {
            setError("Network error. Please try again later."); // Handle 500 (server error)
          }
        })
        .finally(() => {
          setLoading(false);
        });
  
      // Listen for new messages
      const handleReceiveMessage = (msg: Message) => {
        console.log("New message received:", msg);
  
        // Only add the message if it is received (not sent by the current user)
        if (msg.senderId !== userId) {
          setMessages((prevMessages) => {
            // Check if the message already exists in the state
            const isDuplicate = prevMessages.some(
              (m) => m.timestamp === msg.timestamp && m.message === msg.message
            );
  
            if (!isDuplicate) {
              const updatedMessages = [...prevMessages, { ...msg, status: "sent" as const }];
              console.log("Updated messages:", updatedMessages);
              saveMessagesToCache(updatedMessages); // Cache updated messages
              return updatedMessages;
            }
  
            console.log("Duplicate message ignored:", msg);
            return prevMessages; // Return previous messages if duplicate
          });
        }
      };
  
      socket.on("receiveMessage", handleReceiveMessage);
  
      // Cleanup on unmount
      return () => {
        socket.off("receiveMessage", handleReceiveMessage); // Remove the event listener
        socket.disconnect(); // Disconnect socket when component unmounts
      };
    }, [userId, receiverId]);
  
    const sendMessage = () => {
      if (message.trim()) {
        const tempId = Date.now().toString(); // Unique ID for optimistic message
        const newMessage: Message = {
          _id: tempId, // Temporary ID for optimistic update
          senderId: userId,
          receiverId,
          message,
          chatId: [userId, receiverId].sort().join("_"),
          timestamp: new Date().toISOString(),
          status: "sending", // Temporary status
        };
  
        // Optimistically update UI
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, newMessage];
          saveMessagesToCache(updatedMessages); // Cache updated messages
          return updatedMessages;
        });
  
        // Emit message via Socket.io
        socket.emit("sendMessage", newMessage, (ack: boolean) => {
          if (!ack) {
            console.error("Message failed to send:", newMessage); // Log error message
            // Update message to 'failed' status
            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg._id === tempId ? { ...msg, status: "failed" as const } : msg
              )
            );
          } else {
            console.log("Message sent successfully:", newMessage); // Log successful send
            // Update message to 'sent' status
            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg._id === tempId ? { ...msg, status: "sent" as const } : msg
              )
            );
          }
        });
  
        setMessage("");
      } else {
        console.warn("Message is empty. Not sending."); // Log warning if message is empty
      }
    };
  
    return { messages, message, setMessage, sendMessage, loading, error, setError };
  };
const ChatScreen: React.FC = () => {
  const { chat, userId, receiverId, companyName } = useLocalSearchParams<{
    chat: string;
    userId: string;
    receiverId: string;
    companyName: string;
  }>();

  // Ensure userId and receiverId are strings
  const parsedUserId = typeof userId === "string" ? userId : "";
  const parsedReceiverId = typeof receiverId === "string" ? receiverId : "";

  const { messages, message, setMessage, sendMessage, loading, error, setError } =
    useChatController(parsedUserId, parsedReceiverId);
  const navigation = useNavigation();

  // Ref for FlatList auto-scrolling
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to bottom when messages are updated
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button and Company Name */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Ionicons name="person-circle" size={24} color="#fff" />

        <Text style={styles.headerText}>{companyName}</Text>
      </View>

      {/* Chat Messages */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No messages found.</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => `${item._id}-${item.timestamp}`}
          renderItem={({ item }) => (
            <View
              style={[
                item.senderId === parsedUserId ? styles.sentMessageContainer : styles.receivedMessageContainer,
                { marginHorizontal: 16, marginVertical: 5 },
              ]}
            >
              <Text style={item.senderId === parsedUserId ? styles.sentMessage : styles.receivedMessage}>
                {item.message}
              </Text>
              {item.status === "failed" && (
                <Text style={{ color: "red", fontSize: 12 }}>Failed to send</Text>
              )}
            </View>
          )}
          contentContainerStyle={{ flexGrow: 1 }}
          ref={flatListRef}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.chatButton} onPress={sendMessage}>
          <IconSymbol size={28} name="paperplane.fill" color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003366",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomColor: "#ccc",
    backgroundColor: "#003366",
    marginTop: Platform.OS === "ios" ? 0 : 45, // Adjust for Android status bar
  },
  backButton: {
    marginRight: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  messagesContainer: {
    flexGrow: 1,
    paddingVertical: 16,
  },
  sentMessageContainer: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 20,
    maxWidth: "70%",
    marginVertical: 5,
  },
  receivedMessageContainer: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E5EA",
    padding: 10,
    borderRadius: 20,
    maxWidth: "70%",
    marginVertical: 5,
  },
  sentMessage: {
    fontSize: 16,
    color: "#fff",
  },
  receivedMessage: {
    fontSize: 16,
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    backgroundColor: "#f8f8f8",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff", // Adjust color as needed
    padding: 10,
    borderRadius: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default ChatScreen;