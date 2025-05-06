// HomeScreen.js - Enhanced with People Search button in header
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  query,
  orderBy,
  deleteDoc,
} from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const [events, setEvents] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchAdminStatus = async () => {
    try {
      const uid = auth.currentUser?.uid;
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists() && userDoc.data().level === 1) {
        setIsAdmin(true);
      }
    } catch (err) {
      console.error('Failed to check admin level:', err);
    }
  };

  const fetchData = useCallback(() => {
    setRefreshing(true);

    const unsubscribeEvents = onSnapshot(
      query(collection(db, 'events'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setRefreshing(false);
      }
    );

    const unsubscribeCommunities = onSnapshot(
      query(collection(db, 'communities'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setCommunities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    );

    return () => {
      unsubscribeEvents();
      unsubscribeCommunities();
    };
  }, []);

  useEffect(() => {
    fetchAdminStatus();
    const unsubscribe = fetchData();
    return unsubscribe;
  }, [fetchData]);

  const handleDeleteEvent = (id) => {
    Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'events', id));
            console.log('Event deleted:', id);
          } catch (error) {
            console.error('Error deleting event:', error);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleDeleteCommunity = (id) => {
    Alert.alert('Delete Community', 'Are you sure you want to delete this community?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'communities', id));
            console.log('Community deleted:', id);
          } catch (error) {
            console.error('Error deleting community:', error);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCommunities = communities.filter(comm =>
    comm.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TextInput
          placeholder="Search events or communities..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
        />
        <TouchableOpacity style={styles.icon} onPress={() => navigation.navigate('SearchPeopleScreen')}>
          <Ionicons name="person-add" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.icon} onPress={() => navigation.navigate('NotificationsScreen')}>
          <Ionicons name="notifications-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} />}
      >
        <Text style={styles.sectionTitle}>📅 Campus Events</Text>
        <View style={styles.cardContainer}>
          {filteredEvents.map((event) => (
            <View key={event.id} style={styles.card}>
              {event.imageUrl && (
                <Image source={{ uri: event.imageUrl }} style={styles.cardImage} />
              )}
              <Text style={styles.cardTitle}>{event.title}</Text>
              <Text style={styles.cardDesc}>{event.description}</Text>
              <Text style={styles.cardDetail}>📍 {event.location}</Text>
              <Text style={styles.cardDetail}>🕓 {event.date}</Text>
              {isAdmin && (
                <TouchableOpacity onPress={() => handleDeleteEvent(event.id)}>
                  <Text style={styles.deleteText}>🗑️ Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>👥 Campus Communities</Text>
        <View style={styles.cardContainer}>
          {filteredCommunities.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={styles.card}
              onPress={() => navigation.navigate('CommunityDetails', { group })}
            >
              {group.photoUrl && (
                <Image source={{ uri: group.photoUrl }} style={styles.cardImage} />
              )}
              <Text style={styles.cardTitle}>{group.name}</Text>
              <Text style={styles.cardDesc}>{group.description}</Text>
              <Text style={styles.cardDetail}>🏫 {group.campus}</Text>
              {isAdmin && (
                <TouchableOpacity onPress={() => handleDeleteCommunity(group.id)}>
                  <Text style={styles.deleteText}>🗑️ Delete</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {isAdmin && (
        <>
          <TouchableOpacity
            style={[styles.fab, { bottom: 100 }]}
            onPress={() => navigation.navigate('CreateEvent')}
          >
            <Ionicons name="calendar" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.fab, { bottom: 30 }]}
            onPress={() => navigation.navigate('CreateCommunity')}
          >
            <MaterialIcons name="group-add" size={24} color="#fff" />
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 10,
    marginRight: 8,
  },
  icon: {
    padding: 6,
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardContainer: {
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  cardDetail: {
    fontSize: 12,
    color: '#888',
  },
  deleteText: {
    color: '#ff3b30',
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'right',
  },
  fab: {
    position: 'absolute',
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});