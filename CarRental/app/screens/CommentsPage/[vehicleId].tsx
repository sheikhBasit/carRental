import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppConstants } from "@/constants/appConstants";

interface Comment {
  _id: string;
  userId: {
    _id: string;
    username: string;
    profilePic: string;
  };
  message: string;
  rating: number;
  timestamp: Date;
}

const CommentsPage = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const params = useLocalSearchParams();
  const vehicleId = params.vehicleId as string;

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`${AppConstants.LOCAL_URL}/comment/${vehicleId}`);
        const result = await response.json();
        if (response.ok) {
          setComments(result.comments || []);
        } else {
          console.error("Failed to fetch comments:", result.error);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [vehicleId]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {comments.map((comment) => (
          <View key={comment._id} style={styles.commentCard}>
            {comment.userId?.profilePic ? (
              <Image
                source={{ uri: comment.userId.profilePic }}
                style={styles.commentUserImage}
              />
            ) : (
              <View style={styles.commentUserIcon}>
                <Ionicons name="person-circle-outline" size={50} color="#ADD8E6" />
              </View>
            )}
            <View style={styles.commentContent}>
              <Text style={styles.commentUsername}>
                {comment.userId?.username || "Anonymous"}
              </Text>
              <View style={styles.commentRating}>
                {Array.from({ length: 5 }, (_, index) => (
                  <Ionicons
                    key={index}
                    name={index < comment.rating ? "star" : "star-outline"}
                    size={16}
                    color={index < comment.rating ? "#FFD700" : "#ADD8E6"}
                  />
                ))}
              </View>
              <Text style={styles.commentMessage}>{comment.message}</Text>
              <Text style={styles.commentTimestamp}>
                {new Date(comment.timestamp).toLocaleDateString()}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003366",
    padding: 10,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  commentCard: {
    backgroundColor: "#1A1A1A",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E5A82",
  },
  commentUserImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#1E5A82",
  },
  commentUserIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#003366",
    borderWidth: 1,
    borderColor: "#1E5A82",
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "bold",
  },
  commentRating: {
    flexDirection: "row",
    marginVertical: 5,
  },
  commentMessage: {
    fontSize: 14,
    color: "#ADD8E6",
    marginBottom: 5,
  },
  commentTimestamp: {
    fontSize: 12,
    color: "#888",
  },
});

export default CommentsPage;