import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Text, TextInput, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage, auth } from '../../firebaseConfig';
import uuid from 'react-native-uuid';
import { Ionicons } from '@expo/vector-icons';

const UploadMedia = () => {
  const [uploading, setUploading] = useState(false);
  const [mediaUri, setMediaUri] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [caption, setCaption] = useState('');
  const [showCaptionModal, setShowCaptionModal] = useState(false);

  // Ask for media permission
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to upload media.');
      }
    })();
  }, []);

  // Pick from gallery
  const handlePickMedia = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setMediaUri(asset.uri);
        setMediaType(asset.type === 'video' ? 'video' : 'photo');
        setShowCaptionModal(true);
      } else {
        console.log('Picker canceled or no asset selected.');
      }
    } catch (error) {
      console.error('Media picker error:', error);
      Alert.alert('Error selecting media');
    }
  };

  // Upload the media
  const uploadMedia = async () => {
    if (!caption.trim()) {
      Alert.alert('Please add a caption');
      return;
    }

    try {
      setUploading(true);
      setShowCaptionModal(false);

      const response = await fetch(mediaUri);
      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error("Selected file is empty");
      }

      const fileName = `${uuid.v4()}.${mediaType === 'photo' ? 'jpg' : 'mp4'}`;
      const fileRef = ref(storage, `media/${fileName}`);

      const metadata = {
        contentType: mediaType === 'photo' ? 'image/jpeg' : 'video/mp4',
      };

      await uploadBytes(fileRef, blob, metadata);
      const downloadURL = await getDownloadURL(fileRef);

      const userId = auth.currentUser?.uid || 'unknown';

      await addDoc(collection(db, 'posts'), {
        userId,
        mediaUrl: downloadURL,
        mediaType,
        caption: caption,
        createdAt: serverTimestamp(),
        likes: [],
        comments: [],
      });

      Alert.alert('Posted successfully!');
      setCaption('');
      setMediaUri(null);
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('Upload failed', error.message || 'Something went wrong');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Upload Button (now just an icon) */}
      <TouchableOpacity onPress={handlePickMedia}>
        <Ionicons name="add-circle" size={36} color="#007AFF" />
      </TouchableOpacity>

      {/* Caption Modal */}
      <Modal
        visible={showCaptionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCaptionModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add a caption</Text>
            
            <TextInput
              placeholder="What's on your mind?"
              style={styles.captionInput}
              multiline
              numberOfLines={4}
              value={caption}
              onChangeText={setCaption}
              autoFocus={true}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCaptionModal(false);
                  setCaption('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.postButton]}
                onPress={uploadMedia}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.postButtonText}>Post</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  postButton: {
    backgroundColor: '#007AFF',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#333',
  },
  postButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default UploadMedia;