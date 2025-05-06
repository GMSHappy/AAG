// ✅ StudentCardDisplayScreen.js with Go Home button
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const StudentCardDisplayScreen = () => {
  const [studentData, setStudentData] = useState(null);
  const navigation = useNavigation();

  const loadStudentData = async () => {
    try {
      const data = await AsyncStorage.getItem("studentCardData");
      if (data) setStudentData(JSON.parse(data));
    } catch (e) {
      console.error("Failed to load student card data.", e);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadStudentData();
    }, [])
  );

  const handleEditCard = async () => {
    Alert.alert(
      "Update Student Card",
      "Are you sure you want to update your student card? This will reset current information.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Proceed",
          onPress: async () => {
            await AsyncStorage.removeItem("studentCardData");
            navigation.navigate("StudentCardCaptureScreen");
          },
        },
      ]
    );
  };

  const handleGoHome = () => {
    navigation.navigate("Home");
  };

  if (!studentData) {
    return (
      <View style={styles.center}>
        <Text>No student card info found. Please set it first.</Text>
      </View>
    );
  }

  const { name, studentId, course, imageUri, barcodeUri, nfcUID } = studentData;

  return (
    <ScrollView contentContainerStyle={styles.cardContainer}>
      <TouchableOpacity onPress={handleEditCard} style={styles.editButton}>
        <Text style={styles.editButtonText}>✏️ Edit Card</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        {imageUri && <Image source={{ uri: imageUri }} style={styles.profileImage} />}
        <Text style={styles.cardName}>{name}</Text>
        <Text style={styles.cardText}>ID: {studentId}</Text>
        <Text style={styles.cardText}>Course: {course}</Text>

        {barcodeUri && (
          <View style={styles.barcodeContainer}>
            <Text style={styles.fakeBarcodeLabel}>📦 Barcode</Text>
            <Image
              source={{
                uri: `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(
                  barcodeUri
                )}&code=Code128&translate-esc=false`,
              }}
              style={styles.fakeBarcodeImage}
              resizeMode="contain"
            />
            <Text style={styles.fakeBarcodeData}>{barcodeUri}</Text>
          </View>
        )}

        {nfcUID && <Text style={styles.nfcText}>📡 NFC UID: {nfcUID}</Text>}
      </View>

      <TouchableOpacity onPress={handleGoHome} style={styles.goHomeButton}>
        <Text style={styles.goHomeButtonText}>🏠 Go Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  cardContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
    width: "100%",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  cardName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  cardText: {
    fontSize: 18,
    marginBottom: 4,
    color: "#333",
    textAlign: "center",
  },
  barcodeContainer: {
    alignItems: "center",
    marginTop: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  fakeBarcodeLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  fakeBarcodeImage: {
    width: 220,
    height: 80,
    marginVertical: 8,
  },
  fakeBarcodeData: {
    fontSize: 14,
    color: "#666",
  },
  nfcText: {
    marginTop: 15,
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  editButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  goHomeButton: {
    backgroundColor: "#555",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  goHomeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default StudentCardDisplayScreen;
