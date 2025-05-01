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

interface Message {
  _id?: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp?: string;
  chatId: string;
  status?: "sending" | "sent" | "failed";
}

const socket = io(`${AppConstants.SOCKETS_URL}`);

const useChatController = (userId: string, receiverId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const cacheKey = `chat_${[userId, receiverId].sort().join("_")}`;

  const loadCachedMessages = async () => {
    try {
      const cachedMessages = await AsyncStorage.getItem(cacheKey);
      if (cachedMessages) {
        const parsedMessages = JSON.parse(cachedMessages);
        if (Array.isArray(parsedMessages)) {
          setMessages(parsedMessages);
        }
      }
    } catch (err) {
      console.error("Error loading cached messages:", err);
    }
  };

  const saveMessagesToCache = async (messages: Message[]) => {
    try {
      await AsyncStorage.setItem(cacheKey, JSON.stringify(messages));
    } catch (err) {
      console.error("Error saving messages to cache:", err);
    }
  };

  const isValidMessage = (msg: any): msg is Message => {
    return (
      typeof msg.senderId === 'string' &&
      typeof msg.message === 'string'
    );
  };

  useEffect(() => {
    if (!userId || !receiverId) return;

    loadCachedMessages();

    if (!socket.connected) {
      socket.connect();
    }

    const chatId = [userId, receiverId].sort().join("_");
    socket.emit("joinChat", { chatId });

    setLoading(true);
    axios
      .get(`${AppConstants.SOCKETS_URL}/chat/messages/${userId}/${receiverId}`)
      .then((response) => {
        console.log("API Response:", response.data);
        
        const apiMessages = Array.isArray(response.data) ? response.data : [];
        const processedMessages = apiMessages.map(msg => ({
          ...msg,
          receiverId: msg.senderId === userId ? receiverId : userId,
          chatId,
          timestamp: msg.timestamp || new Date().toISOString()
        })).filter(isValidMessage);

        setMessages(processedMessages);
        setError(null);
        saveMessagesToCache(processedMessages);
      })
      .catch((err) => {
        console.error("Error fetching messages:", err);
        setError(err.response?.status === 404 
          ? "No messages found." 
          : "Failed to load messages.");
      })
      .finally(() => {
        setLoading(false);
      });

    const handleReceiveMessage = (msg: any) => {
      if (!isValidMessage(msg)) return;

      const newMessage = {
        ...msg,
        receiverId: msg.senderId === userId ? receiverId : userId,
        chatId,
        timestamp: msg.timestamp || new Date().toISOString(),
        status: "sent" as const
      };

      setMessages(prev => {
        const isDuplicate = prev.some(m => 
          (m._id && m._id === newMessage._id) || 
          (m.timestamp === newMessage.timestamp && m.message === newMessage.message)
        );
        return isDuplicate ? prev : [...prev, newMessage];
      });
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.disconnect();
    };
  }, [userId, receiverId]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const tempId = Date.now().toString();
    const newMessage: Message = {
      _id: tempId,
      senderId: userId,
      receiverId,
      message,
      chatId: [userId, receiverId].sort().join("_"),
      timestamp: new Date().toISOString(),
      status: "sending" as const,
    };

    setMessages(prev => [...prev, newMessage]);

    axios.post(`${AppConstants.SOCKETS_URL}/chat/messages/send`, {
      senderId: userId,
      receiverId,
      message,
    })
    .then((response) => {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === tempId ? { 
            ...msg, 
            status: "sent" as const,
            _id: response.data._id 
          } : msg
        )
      );
    })
    .catch((error) => {
      console.error("Error sending message:", error);
      setMessages(prev =>
        prev.map(msg =>
          msg._id === tempId ? { 
            ...msg, 
            status: "failed" as const 
          } : msg
        )
      );
    });

    setMessage("");
  };

  return { messages, message, setMessage, sendMessage, loading, error };
};

const ChatScreen: React.FC = () => {
  const { chat, userId, receiverId, companyName } = useLocalSearchParams<{
    chat: string;
    userId: string;
    receiverId: string;
    companyName: string;
  }>();

  const parsedUserId = typeof userId === "string" ? userId : "";
  const parsedReceiverId = typeof receiverId === "string" ? receiverId : "";

  const { messages, message, setMessage, sendMessage, loading, error } =
    useChatController(parsedUserId, parsedReceiverId);
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Ionicons name="person-circle" size={24} color="#fff" />
        <Text style={styles.headerText}>{companyName}</Text>
      </View>

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
                styles.messageContainer,
                item.senderId === parsedUserId ? styles.senderMessage : styles.receiverMessage,
              ]}
            >
              <View style={[
                styles.messageBubble,
                item.senderId === parsedUserId ? styles.senderBubble : styles.receiverBubble
              ]}>
                <Text style={[
                  styles.messageText,
                  item.senderId === parsedUserId ? styles.senderMessageText : styles.receiverMessageText
                ]}>
                  {item.message}
                </Text>
                <Text style={[
                  styles.timestamp,
                  item.senderId === parsedUserId ? styles.senderTimestamp : styles.receiverTimestamp
                ]}>
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              {item.status === "failed" && (
                <Text style={styles.errorText}>Failed to send</Text>
              )}
            </View>
          )}
          contentContainerStyle={styles.messagesContainer}
          ref={flatListRef}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

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
    marginTop: Platform.OS === "ios" ? 0 : 45,
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
    padding: 16,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  senderMessage: {
    alignSelf: 'flex-end',
  },
  receiverMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    maxWidth: '100%',
  },
  senderBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  receiverBubble: {
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  senderMessageText: {
    color: '#FFF',
  },
  receiverMessageText: {
    color: '#000',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
  senderTimestamp: {
    color: '#E5E5EA',
    alignSelf: 'flex-end',
  },
  receiverTimestamp: {
    color: '#666',
    alignSelf: 'flex-start',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
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
    backgroundColor: "#007bff",
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