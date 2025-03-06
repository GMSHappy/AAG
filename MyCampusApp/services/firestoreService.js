import { db } from "../firebaseConfig"; // Import Firestore config
import {
  collection,
  doc,
  addDoc,
  query,
  orderBy,
  where,
  getDocs,
  serverTimestamp,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

/**
 * 🔹 Create or find a chat (for DMs or Groups)
 */
export const createChat = async (userIds, chatName = null) => {
  try {
    // If it's a one-on-one chat, check if it already exists
    if (userIds.length === 2) {
      const existingChat = await findExistingChat(userIds);
      if (existingChat) return existingChat; // Return existing chat ID
    }

    // Create a new chat
    const chatRef = await addDoc(collection(db, "chats"), {
      members: userIds,
      chatName: chatName || null, // Group name (if applicable)
      lastMessage: "",
      lastUpdated: serverTimestamp(),
    });

    return chatRef.id; // Return new chat ID
  } catch (error) {
    console.error("❌ Error creating chat:", error);
    return null;
  }
};

/**
 * 🔹 Find an existing DM chat
 */
export const findExistingChat = async (userIds) => {
  try {
    const q = query(
      collection(db, "chats"),
      where("members", "array-contains", userIds[0])
    );
    const querySnapshot = await getDocs(q);

    for (let doc of querySnapshot.docs) {
      const data = doc.data();
      if (data.members.includes(userIds[1]) && data.members.length === 2) {
        return doc.id; // Return existing chat ID
      }
    }
    return null; // No existing chat found
  } catch (error) {
    console.error("❌ Error finding chat:", error);
    return null;
  }
};

/**
 * 🔹 Send a message in a chat
 */
export const sendMessage = async (chatId, senderId, text) => {
  try {
    const chatRef = doc(db, "chats", chatId);

    // Add the new message to the messages subcollection
    await addDoc(collection(chatRef, "messages"), {
      senderId,
      text,
      timestamp: serverTimestamp(), // Firestore timestamp
    });

    // Update the chat's last message and timestamp
    await updateDoc(chatRef, {
      lastMessage: text,
      lastUpdated: serverTimestamp(),
    });
  } catch (error) {
    console.error("❌ Error sending message:", error);
  }
};

/**
 * 🔹 Get real-time messages for a chat
 */
export const getChatMessages = (chatId, setMessages) => {
  const chatRef = collection(db, "chats", chatId, "messages");
  const q = query(chatRef, orderBy("timestamp", "asc"));

  // Set up a real-time listener for messages
  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setMessages(messages); // Update the state with new messages
  });
};

/**
 * 🔹 Get all chats for a user
 */
export const getUserChats = async (userId) => {
  try {
    console.log("Fetching chats for user:", userId);

    const q = query(
      collection(db, "chats"),
      where("members", "array-contains", userId),
      orderBy("lastUpdated", "desc")
    );

    const querySnapshot = await getDocs(q);
    const chats = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("Fetched chats:", chats);
    return chats;
  } catch (error) {
    console.error("❌ Error fetching chats:", error);
    return [];
  }
};