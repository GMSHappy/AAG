// components/Feed/CommentsLikes.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../firebaseConfig';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const CommentsLikes = ({ post }) => {
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const userId = auth.currentUser?.uid;

  const handleLike = async () => {
    try {
      const postRef = doc(db, 'posts', post.id);
      if (post.likes.includes(userId)) {
        await updateDoc(postRef, {
          likes: arrayRemove(userId)
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(userId)
        });
      }
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    
    try {
      const postRef = doc(db, 'posts', post.id);
      await updateDoc(postRef, {
        comments: arrayUnion({
          userId,
          text: comment,
          createdAt: new Date().toISOString()
        })
      });
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
          <Ionicons 
            name={post.likes.includes(userId) ? "heart" : "heart-outline"} 
            size={24} 
            color={post.likes.includes(userId) ? "red" : "black"} 
          />
          <Text style={styles.actionText}>{post.likes?.length || 0}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setShowComments(!showComments)} 
          style={styles.actionButton}
        >
          <Ionicons name="chatbubble-outline" size={24} />
          <Text style={styles.actionText}>{post.comments?.length || 0}</Text>
        </TouchableOpacity>
      </View>

      {showComments && (
        <View style={styles.commentsSection}>
          {post.comments?.map((comment, index) => (
            <View key={index} style={styles.comment}>
              <Text style={styles.commentText}>
                <Text style={styles.commentUser}>{comment.userId.substring(0, 6)}: </Text>
                {comment.text}
              </Text>
            </View>
          ))}
          
          <View style={styles.commentInputContainer}>
            <TextInput
              placeholder="Add a comment..."
              style={styles.commentInput}
              value={comment}
              onChangeText={setComment}
            />
            <TouchableOpacity onPress={handleAddComment}>
              <Ionicons name="send" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    marginLeft: 4,
  },
  commentsSection: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  comment: {
    marginBottom: 6,
  },
  commentText: {
    fontSize: 14,
  },
  commentUser: {
    fontWeight: 'bold',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
});

export default CommentsLikes;