import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList } from "react-native";
import { Text, Avatar } from "react-native-paper";
import { useRoute } from "@react-navigation/native";
import { auth } from "../firebaseConfig";
import { getUserChats } from "../services/firestoreService";
import { getChatMessages, sendMessage } from "../services/firestoreService";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const ChatScreen = () => {
  const route = useRoute();
  const { chatId } = route.params;
  const userId = auth.currentUser?.uid;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const unsubscribe = getChatMessages(chatId, setMessages);
    return () => unsubscribe();
  }, [chatId]);

  const handleSend = async () => {
    if (newMessage.trim() === "") return;

    await sendMessage(chatId, userId, newMessage.trim());
    setNewMessage("");
  };

  const renderMessageItem = ({ item }) => {
    const isOwnMessage = item.senderId === userId;
    return (
      <View style={[styles.messageContainer, isOwnMessage ? styles.ownMessage : styles.otherMessage]}>
        {!isOwnMessage && (
          <Avatar.Image size={30} source={require("../assets/default-avatar.png")} style={styles.avatar} />
        )}
        <View style={styles.messageBubble}>
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.timestamp}>
            {item.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || "Now"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <FlatList data={messages} renderItem={renderMessageItem} keyExtractor={(item) => item.id} inverted />
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Type a message..." value={newMessage} onChangeText={setNewMessage} />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Icon name="send" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// ================= STYLES =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  ownMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
    padding: 10,
    borderRadius: 10,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#ECECEC",
    padding: 10,
    borderRadius: 10,
  },
  avatar: {
    marginRight: 10,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 20,
    padding: 10,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    padding: 10,
  },
});

export default ChatScreen;
