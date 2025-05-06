// Enhanced CommunityDetails.js - with Join, Member List, and Friend Add
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

const CommunityDetails = ({ route }) => {
  const { group } = route.params;
  const currentUser = auth.currentUser;
  const [members, setMembers] = useState([]);
  const [isMember, setIsMember] = useState(false);

  const communityRef = doc(db, 'communities', group.id);

  const joinCommunity = async () => {
    try {
      await updateDoc(communityRef, {
        members: arrayUnion(currentUser.uid),
      });
      await setDoc(doc(db, 'users', currentUser.uid, 'joinedCommunities', group.id), {
        joinedAt: new Date(),
      });
    } catch (error) {
      console.error('Join error:', error);
    }
  };

  const leaveCommunity = async () => {
    Alert.alert('Leave Community', 'Are you sure you want to leave this community?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        onPress: async () => {
          try {
            await updateDoc(communityRef, {
              members: arrayRemove(currentUser.uid),
            });
          } catch (error) {
            console.error('Leave error:', error);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const fetchMembers = () => {
    const unsub = onSnapshot(communityRef, async (snapshot) => {
      const data = snapshot.data();
      if (!data?.members) return;
      setIsMember(data.members.includes(currentUser.uid));

      const userSnapshots = await Promise.all(
        data.members.map(uid => getDoc(doc(db, 'users', uid)))
      );
      const loadedMembers = userSnapshots
        .filter(doc => doc.exists())
        .map(doc => ({ id: doc.id, ...doc.data() }));
      setMembers(loadedMembers);
    });
    return unsub;
  };

  const handleAddFriend = async (userId) => {
    try {
      await setDoc(doc(db, 'users', userId, 'friendRequests', currentUser.uid), {
        from: currentUser.uid,
        sentAt: new Date(),
      });
      Alert.alert('Friend request sent!');
    } catch (e) {
      console.error('Error sending friend request', e);
    }
  };

  useEffect(() => {
    const unsub = fetchMembers();
    return () => unsub();
  }, []);

  return (
    <View style={styles.container}>
      <Image source={{ uri: group.photoUrl }} style={styles.banner} />
      <Text style={styles.title}>{group.name}</Text>
      <Text style={styles.description}>{group.description}</Text>

      {isMember ? (
        <TouchableOpacity style={styles.leaveButton} onPress={leaveCommunity}>
          <Text style={styles.buttonText}>🚪 Leave Community</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.joinButton} onPress={joinCommunity}>
          <Text style={styles.buttonText}>➕ Join Community</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.membersTitle}>👥 Members ({members.length})</Text>
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.memberCard}>
            <Ionicons name="person-circle" size={32} color="#007AFF" />
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{item.name || item.email}</Text>
              {item.id !== currentUser.uid && (
                <TouchableOpacity onPress={() => handleAddFriend(item.id)}>
                  <Text style={styles.addFriend}>🤝 Add Friend</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default CommunityDetails;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  banner: { width: '100%', height: 180, borderRadius: 12, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
  description: { fontSize: 14, color: '#666', marginBottom: 10 },
  joinButton: { backgroundColor: '#28a745', padding: 12, borderRadius: 10, marginBottom: 12 },
  leaveButton: { backgroundColor: '#ff3b30', padding: 12, borderRadius: 10, marginBottom: 12 },
  buttonText: { textAlign: 'center', color: '#fff', fontWeight: 'bold' },
  membersTitle: { fontSize: 18, fontWeight: '600', marginTop: 10, marginBottom: 8 },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
  },
  memberInfo: { marginLeft: 12, flex: 1 },
  memberName: { fontSize: 16, fontWeight: 'bold' },
  addFriend: { fontSize: 14, color: '#007AFF', marginTop: 4 },
});
