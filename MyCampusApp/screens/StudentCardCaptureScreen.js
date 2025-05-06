// ✅ StudentCardCaptureScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const StudentCardCaptureScreen = ({ navigation, route }) => {
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [course, setCourse] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [barcodeUri, setBarcodeUri] = useState(null);
  const [nfcUID, setNfcUID] = useState(null);

  useEffect(() => {
    if (route.params?.barcodeUri) setBarcodeUri(route.params.barcodeUri);
    if (route.params?.nfcUID) setNfcUID(route.params.nfcUID);
  }, [route.params]);

  const pickProfilePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Camera permission is required.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const scanBarcode = () => navigation.navigate("StudentIDScanner");
  const scanNFC = () => navigation.navigate("StudentNFCScanner");

  const saveDetails = async () => {
    if (!name || !studentId || !course || !imageUri || !barcodeUri) {
      Alert.alert("Missing Info", "Please fill out all fields and scan barcode.");
      return;
    }

    const studentData = {
      name,
      studentId,
      course,
      imageUri,
      barcodeUri,
      nfcUID,
    };

    try {
      await AsyncStorage.setItem("studentCardData", JSON.stringify(studentData));
      Alert.alert("✅ Success", "Card info saved successfully!");
      navigation.navigate("StudentCardDisplay");
    } catch (error) {
      Alert.alert("Error", "Something went wrong while saving the card.");
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎓 Student Card Setup</Text>

      <TouchableOpacity style={styles.photoButton} onPress={pickProfilePhoto}>
        <Text style={styles.photoButtonText}>📸 Take Profile Photo</Text>
      </TouchableOpacity>

      {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}

      <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Student ID" value={studentId} onChangeText={setStudentId} />
      <TextInput style={styles.input} placeholder="Course" value={course} onChangeText={setCourse} />

      <TouchableOpacity style={styles.barcodeBox} onPress={scanBarcode}>
        <Text style={styles.barcodeText}>📷 Scan Barcode</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.nfcBox} onPress={scanNFC}>
        <Text style={styles.barcodeText}>📡 Tap Student Card (NFC)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={saveDetails}>
        <Text style={styles.saveButtonText}>💾 Save & View Card</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f4f4f4", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 15,
    borderRadius: 10, backgroundColor: "#fff"
  },
  preview: { width: 140, height: 140, borderRadius: 70, alignSelf: "center", marginVertical: 15 },
  photoButton: { backgroundColor: "#007AFF", padding: 15, borderRadius: 10, alignItems: "center", marginBottom: 15 },
  photoButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  barcodeBox: { padding: 15, backgroundColor: "#28a745", borderRadius: 10, alignItems: "center", marginBottom: 10 },
  nfcBox: { padding: 15, backgroundColor: "#ff9500", borderRadius: 10, alignItems: "center", marginBottom: 10 },
  barcodeText: { fontWeight: "bold", color: "#fff" },
  saveButton: { marginTop: 20, backgroundColor: "#007AFF", padding: 15, borderRadius: 10, alignItems: "center" },
  saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default StudentCardCaptureScreen;
