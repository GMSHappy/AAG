import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { db, auth } from '../firebaseConfig';
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { doc, setDoc } from 'firebase/firestore';

const SearchPeopleScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState([]);
  const currentUser = auth.currentUser;

  const handleSearch = async (text) => {
    setSearchText(text);

    if (!text || text.trim().length === 0) {
      setResults([]);
      return;
    }

    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('name', '>=', text),
      where('name', '<=', text + '\uf8ff')
    );
    const snapshot = await getDocs(q);

    const filtered = snapshot.docs
      .filter(doc => doc.id !== currentUser.uid)
      .map(doc => ({ id: doc.id, ...doc.data() }));
    setResults(filtered);
  };

  const sendFriendRequest = async (toUserId) => {
    try {
      const currentUserId = auth.currentUser.uid;
  
      // Add to recipient's friendRequests
      await setDoc(doc(db, 'users', toUserId, 'friendRequests', currentUserId), {
        from: currentUserId,
        sentAt: new Date(),
      });
  
      // ✅ Add to your sentRequests
      await setDoc(doc(db, 'users', currentUserId, 'sentRequests', toUserId), {
        to: toUserId,
        sentAt: new Date(),
      });
  
      alert('Friend request sent!');
    } catch (e) {
      console.error('Failed to send friend request:', e);
    }
  };
  

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>🔍 Find People</Text>
      <TextInput
        style={styles.input}
        placeholder="Search by name..."
        value={searchText}
        onChangeText={handleSearch}
      />

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            {item.imageUri ? (
              <Image source={{ uri: item.imageUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder} />
            )}
            <View style={styles.userInfo}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.email}>{item.email}</Text>
              <TouchableOpacity onPress={() => sendFriendRequest(item.id)}>
                <Text style={styles.addBtn}>🤝 Add Friend</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
};

export default SearchPeopleScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  input: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  userCard: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ccc',
    marginRight: 10,
  },
  userInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold' },
  email: { fontSize: 14, color: '#555' },
  addBtn: {
    marginTop: 6,
    color: '#007AFF',
    fontWeight: '600',
  },
});
