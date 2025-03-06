import React, { useEffect, useState } from "react";
import { View, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Text, Avatar, Divider, ActivityIndicator } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../firebaseConfig";
import { onSnapshot, collection, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig";

const ChatListScreen = () => {
  const navigation = useNavigation();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = auth.currentUser?.uid;

  // Debugging: Log the authenticated user ID
  console.log("Authenticated user ID:", userId);

  useEffect(() => {
    if (!userId) {
      console.error("❌ User is not authenticated.");
      setLoading(false);
      return;
    }

    // Define the Firestore query
    const q = query(
      collection(db, "chats"),
      where("members", "array-contains", userId),
      orderBy("lastUpdated", "desc")
    );

    // Set up a real-time listener for chats
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log("Firestore snapshot size:", snapshot.size);
        console.log("Chats:", snapshot.docs.map((doc) => doc.data()));

        const updatedChats = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setChats(updatedChats);
        setLoading(false);
      },
      (error) => {
        console.error("❌ Error fetching chats:", error);
        setLoading(false);
      }
    );

    // Clean up the listener on unmount
    return () => unsubscribe();
  }, [userId]);

  const renderItem = ({ item }) => {
    const isGroupChat = item.members.length > 2;
    const chatName = item.chatName || "Private Chat";
    const lastMessage = item.lastMessage || "No messages yet";
    const lastUpdated = item.lastUpdated?.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) || "Recently";

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigation.navigate("ChatScreen", { chatId: item.id })}
      >
        <Avatar.Image
          size={50}
          source={isGroupChat ? require("../assets/group-icon.png") : require("../assets/default-avatar.png")}
        />
        <View style={styles.chatDetails}>
          <Text style={styles.chatName}>{chatName}</Text>
          <Text style={styles.lastMessage}>{lastMessage}</Text>
          <Text style={styles.timestamp}>{lastUpdated}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator animating={true} size="large" />
      ) : chats.length > 0 ? (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <Divider />}
        />
      ) : (
        <Text style={styles.noChats}>No conversations yet</Text>
      )}
    </View>
  );
};

// ================= STYLES =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#FFF",
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  chatDetails: {
    marginLeft: 10,
    flex: 1,
  },
  chatName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
  },
  noChats: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    color: "#666",
  },
});

export default ChatListScreen;