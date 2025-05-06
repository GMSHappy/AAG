import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TimetableSetupScreen = ({ navigation }) => {
  const [url, setUrl] = useState('');

  const saveTimetableUrl = async () => {
    if (!url.trim().startsWith('https://')) {
      return Alert.alert('❌ Error', 'Please enter a valid URL.');
    }
    try {
      await AsyncStorage.setItem('timetableUrl', url.trim());
      navigation.replace('Timetable');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to save your timetable URL.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Paste your full timetable URL below:</Text>
      <TextInput
        style={styles.input}
        placeholder="https://timetables.tudublin.ie/reporting/..."
        value={url}
        onChangeText={setUrl}
      />
      <Button title="Save & View Timetable" onPress={saveTimetableUrl} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  label: { fontSize: 18, marginBottom: 12 },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 10,
    marginBottom: 20, borderRadius: 6,
  },
});

export default TimetableSetupScreen;
