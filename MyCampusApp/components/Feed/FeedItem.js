// ✅ FeedItem.js - User-controlled Instagram-like video playback with delete support
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert
} from 'react-native';
import { Video as ExpoVideo } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import CommentsLikes from './CommentsLikes';

import { auth, db } from '../../firebaseConfig';
import { doc, deleteDoc } from 'firebase/firestore';

const FeedItem = ({ post, onDelete }) => {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (videoRef.current && post.mediaType === 'video') {
      videoRef.current.playAsync().catch(() => {});
    }
  
    return () => {
      if (videoRef.current) {
        videoRef.current.stopAsync().catch(() => {});
        videoRef.current.unloadAsync().catch(() => {});
      }
    };
  }, [post.mediaUrl]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'posts', post.id));
              if (onDelete) onDelete(); // Refresh list if callback provided
            } catch (error) {
              console.error('Failed to delete post:', error);
              Alert.alert('Error', 'Unable to delete post');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.userInfo}>
        <Image
          source={{ uri: 'https://placekitten.com/50/50' }}
          style={styles.avatar}
        />
        <Text style={styles.username}>User {post.userId?.substring(0, 6) || 'Unknown'}</Text>

        {userId === post.userId && (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Ionicons name="trash" size={20} color="#ff4444" />
          </TouchableOpacity>
        )}
      </View>

      {post.mediaType === 'photo' ? (
        <Image source={{ uri: post.mediaUrl }} style={styles.media} resizeMode="cover" />
      ) : (
        <TouchableWithoutFeedback onPress={toggleMute}>
          <ExpoVideo
            ref={videoRef}
            source={{ uri: post.mediaUrl }}
            resizeMode="cover"
            isLooping
            shouldPlay
            isMuted={isMuted}
            style={styles.media}
            useNativeControls
          />
        </TouchableWithoutFeedback>
      )}

      <View style={styles.content}>
        <Text style={styles.caption}>{post.caption}</Text>
        <Text style={styles.timestamp}>
          {post.createdAt?.toDate?.().toLocaleString() || 'Just now'}
        </Text>
        <CommentsLikes post={post} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButton: {
    marginLeft: 'auto',
  },
  media: {
    width: '100%',
    height: 350,
  },
  content: {
    padding: 12,
  },
  caption: {
    fontSize: 15,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
});

export default FeedItem;
