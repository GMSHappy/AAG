import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';

const TimetableScreen = () => {
  const [url, setUrl] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [tempUrl, setTempUrl] = useState('');

  useEffect(() => {
    const loadUrl = async () => {
      const storedUrl = await AsyncStorage.getItem('timetableUrl');
      setUrl(storedUrl);
    };
    loadUrl();
  }, []);

  const saveUrl = async () => {
    if (!tempUrl.trim().startsWith('http')) return;
    await AsyncStorage.setItem('timetableUrl', tempUrl.trim());
    setUrl(tempUrl.trim());
    setModalVisible(false);
  };

  if (!url) {
    return (
      <View style={styles.center}>
        <Text>No timetable link found. Please add one below:</Text>
        <Button
          title="Set Timetable Link"
          onPress={() => {
            setTempUrl('');
            setModalVisible(true);
          }}
        />
        <SetupModal
          visible={modalVisible}
          onChange={setTempUrl}
          value={tempUrl}
          onSave={saveUrl}
          onClose={() => setModalVisible(false)}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView source={{ uri: url }} style={{ flex: 1 }} />
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => {
          setTempUrl(url);
          setModalVisible(true);
        }}
      >
        <Text style={styles.editText}>✏️ Edit Link</Text>
      </TouchableOpacity>

      <SetupModal
        visible={modalVisible}
        onChange={setTempUrl}
        value={tempUrl}
        onSave={saveUrl}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const SetupModal = ({ visible, onChange, value, onSave, onClose }) => (
  <Modal visible={visible} animationType="slide" transparent>
    <View style={styles.modalBackground}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Paste your timetable URL</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder="https://..."
          autoCapitalize="none"
          autoCorrect={false}
        />
        <View style={styles.buttonRow}>
          <Button title="Save" onPress={onSave} />
          <Button title="Cancel" onPress={onClose} color="red" />
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  editButton: {
    padding: 12,
    backgroundColor: '#eee',
    alignItems: 'center',
  },
  editText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default TimetableScreen;
