// FriendsScreen.js — with pending sent requests, chat access & cancel option
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebaseConfig';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';
import { createChat } from '../services/firestoreService';

const FriendsScreen = () => {
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [pendingSent, setPendingSent] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const uid = auth.currentUser?.uid;
  const navigation = useNavigation();

  const fetchFriendRequests = async () => {
    const snapshot = await getDocs(collection(db, 'users', uid, 'friendRequests'));
    const requests = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const fromUser = await getDoc(doc(db, 'users', docSnap.id));
        const isFriend = await getDoc(doc(db, 'users', uid, 'friends', docSnap.id));
        return { id: docSnap.id, ...fromUser.data(), alreadyFriend: isFriend.exists() };
      })
    );
    setFriendRequests(requests);
  };

  const fetchFriends = async () => {
    const snapshot = await getDocs(collection(db, 'users', uid, 'friends'));
    const all = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const userDoc = await getDoc(doc(db, 'users', docSnap.id));
        return { id: docSnap.id, ...userDoc.data() };
      })
    );
    setFriends(all);
  };

  const fetchPendingSent = async () => {
    const snapshot = await getDocs(collection(db, 'users', uid, 'sentRequests'));
    const pending = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const userDoc = await getDoc(doc(db, 'users', docSnap.id));
        return { id: docSnap.id, ...userDoc.data() };
      })
    );
    setPendingSent(pending);
  };

  const refreshData = useCallback(async () => {
    setRefreshing(true);
    await fetchFriendRequests();
    await fetchFriends();
    await fetchPendingSent();
    setRefreshing(false);
  }, []);

  const acceptRequest = async (fromId) => {
    try {
      await setDoc(doc(db, 'users', uid, 'friends', fromId), { addedAt: new Date() });
      await deleteDoc(doc(db, 'users', uid, 'friendRequests', fromId));
      try {
        await deleteDoc(doc(db, 'users', fromId, 'sentRequests', uid));
      } catch (err) {
        console.warn("Couldn't remove from their sentRequests", err.message);
      }
      const alreadyFriend = await getDoc(doc(db, 'users', fromId, 'friends', uid));
      if (!alreadyFriend.exists()) {
        await setDoc(doc(db, 'users', fromId, 'friends', uid), { addedAt: new Date() });
      }
      refreshData();
    } catch (err) {
      console.error('❌ Accept error:', err);
    }
  };

  const declineRequest = async (fromId) => {
    await deleteDoc(doc(db, 'users', uid, 'friendRequests', fromId));
    refreshData();
  };

  const cancelSentRequest = async (toId) => {
    await deleteDoc(doc(db, 'users', toId, 'friendRequests', uid));
    refreshData();
  };

  const startChatWithFriend = async (friendId) => {
    const chatId = await createChat([uid, friendId]);
    if (chatId) {
      navigation.navigate("ChatScreen", { chatId });
    }
  };

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <>
            <Text style={styles.header}>👋 Friend Requests</Text>
            {friendRequests.length === 0 && <Text style={styles.emptyText}>No new requests</Text>}
            {friendRequests.map((item) => (
              <View key={item.id} style={styles.requestCard}>
                <Text style={styles.name}>{item.name || item.email}</Text>
                <View style={styles.actions}>
                  {item.alreadyFriend ? (
                    <Text style={styles.accept}>✔ Already Friends</Text>
                  ) : (
                    <>
                      <TouchableOpacity onPress={() => acceptRequest(item.id)}>
                        <Text style={styles.accept}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => declineRequest(item.id)}>
                        <Text style={styles.decline}>Decline</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            ))}

            <Text style={styles.header}>📨 Pending Requests You Sent</Text>
            {pendingSent.length === 0 && <Text style={styles.emptyText}>None pending</Text>}
            {pendingSent.map((item) => (
              <View key={item.id} style={styles.requestCard}>
                <Text style={styles.name}>{item.name || item.email}</Text>
                <TouchableOpacity onPress={() => cancelSentRequest(item.id)}>
                  <Text style={styles.decline}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ))}

            <Text style={styles.header}>👥 My Friends</Text>
            {friends.length === 0 && <Text style={styles.emptyText}>No friends yet</Text>}
          </>
        }
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.friendCard}>
            <Text style={styles.name}>{item.name || item.email}</Text>
            <TouchableOpacity onPress={() => startChatWithFriend(item.id)}>
              <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>💬 Chat</Text>
            </TouchableOpacity>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshData} />}
      />
    </View>
  );
};

export default FriendsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 20, fontWeight: 'bold', marginTop: 20 },
  emptyText: { marginTop: 10, color: '#777' },
  requestCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f1f1f1',
  },
  friendCard: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: { fontSize: 16, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 16 },
  accept: { color: 'green', fontWeight: 'bold' },
  decline: { color: 'red', fontWeight: 'bold' },
});
