// CreateEvent.js - Event creation form
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../firebaseConfig';
import uuid from 'react-native-uuid';

const CreateEvent = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCreate = async () => {
    if (!title || !description || !location || !date) {
      Alert.alert('Please fill in all fields');
      return;
    }

    try {
      setUploading(true);

      let imageUrl = '';
      if (imageUri) {
        const blob = await fetch(imageUri).then(res => res.blob());
        const filename = `events/${uuid.v4()}.jpg`;
        const imageRef = ref(storage, filename);
        await uploadBytes(imageRef, blob);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, 'events'), {
        title,
        description,
        location,
        date,
        imageUrl,
        createdBy: auth.currentUser?.uid || 'unknown',
        createdAt: serverTimestamp(),
      });

      Alert.alert('Event created successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Create event error:', error);
      Alert.alert('Failed to create event');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Event Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Location</Text>
      <TextInput style={styles.input} value={location} onChangeText={setLocation} />

      <Text style={styles.label}>Date (e.g., 2025-04-10)</Text>
      <TextInput style={styles.input} value={date} onChangeText={setDate} />

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        <Text style={styles.imagePickerText}>📸 Pick an Image</Text>
      </TouchableOpacity>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}

      <Button title={uploading ? 'Posting...' : 'Create Event'} onPress={handleCreate} disabled={uploading} />
    </ScrollView>
  );
};

export default CreateEvent;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
  },
  imagePicker: {
    marginVertical: 15,
    alignItems: 'center',
  },
  imagePickerText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
});
