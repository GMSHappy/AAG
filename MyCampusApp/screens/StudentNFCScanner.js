import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { useNavigation } from '@react-navigation/native';

const StudentNFCScanner = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const scanTag = async () => {
      try {
        await NfcManager.start();
        await NfcManager.requestTechnology(NfcTech.Ndef);
        const tag = await NfcManager.getTag();
        const uid = tag.id || 'unknown';
        await NfcManager.cancelTechnologyRequest();
        navigation.navigate("StudentCardCaptureScreen", { nfcUID: uid });
      } catch (e) {
        Alert.alert('NFC Failed', 'Could not read NFC tag.');
        await NfcManager.cancelTechnologyRequest();
        navigation.goBack();
      }
    };

    scanTag();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.info}>📡 Hold your student card near the top of your phone</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  info: {
    fontSize: 18,
    textAlign: 'center',
    color: '#555',
  },
});

export default StudentNFCScanner;
