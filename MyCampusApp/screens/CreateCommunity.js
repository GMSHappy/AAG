// CreateCommunity.js - Community creation screen
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

const CreateCommunity = ({ navigation }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [campus, setCampus] = useState('');
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
    if (!name || !description || !campus) {
      Alert.alert('Please fill in all fields');
      return;
    }

    try {
      setUploading(true);

      let photoUrl = '';
      if (imageUri) {
        const blob = await fetch(imageUri).then(res => res.blob());
        const filename = `communities/${uuid.v4()}.jpg`;
        const imageRef = ref(storage, filename);
        await uploadBytes(imageRef, blob);
        photoUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, 'communities'), {
        name,
        description,
        campus,
        photoUrl,
        ownerId: auth.currentUser?.uid || 'unknown',
        members: [auth.currentUser?.uid || 'unknown'],
        createdAt: serverTimestamp(),
      });

      Alert.alert('Community created successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Create community error:', error);
      Alert.alert('Failed to create community');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Community Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Campus</Text>
      <TextInput style={styles.input} value={campus} onChangeText={setCampus} />

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        <Text style={styles.imagePickerText}>📸 Pick an Image</Text>
      </TouchableOpacity>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}

      <Button
        title={uploading ? 'Creating...' : 'Create Community'}
        onPress={handleCreate}
        disabled={uploading}
      />
    </ScrollView>
  );
};

export default CreateCommunity;

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
