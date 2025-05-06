// NotificationsScreen.js - displays real-time activity feed
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const eventQuery = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
    const communityQuery = query(collection(db, 'communities'), orderBy('createdAt', 'desc'));

    const unsubEvents = onSnapshot(eventQuery, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        type: 'event',
        title: doc.data().title,
        description: doc.data().description,
        timestamp: doc.data().createdAt?.toDate(),
      }));
      setNotifications(prev => [...events, ...prev.filter(n => n.type !== 'event')]);
      setLoading(false);
    });

    const unsubCommunities = onSnapshot(communityQuery, (snapshot) => {
      const communities = snapshot.docs.map(doc => ({
        id: doc.id,
        type: 'community',
        title: doc.data().name,
        description: doc.data().description,
        timestamp: doc.data().createdAt?.toDate(),
      }));
      setNotifications(prev => [...communities, ...prev.filter(n => n.type !== 'community')]);
      setLoading(false);
    });

    return () => {
      unsubEvents();
      unsubCommunities();
    };
  }, []);

  const sortedNotifications = notifications.sort((a, b) => b.timestamp - a.timestamp);

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} color="#007AFF" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔔 Recent Activity</Text>
      <FlatList
        data={sortedNotifications}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderItem={({ item }) => (
          <View style={styles.notificationCard}>
            <Text style={styles.itemType}>
              {item.type === 'event' ? '📅 New Event' : '👥 New Community'}
            </Text>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemDesc}>{item.description}</Text>
            <Text style={styles.timestamp}>
              {item.timestamp?.toLocaleString() || 'Just now'}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  itemType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemDesc: {
    fontSize: 14,
    color: '#555',
    marginVertical: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
  },
});
