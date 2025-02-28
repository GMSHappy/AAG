import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import { Camera } from "expo-camera";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { app } from "../firebaseConfig"; // Import Firebase config

const db = getFirestore(app);

const VirtualCardScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [data, setData] = useState("No Barcode Scanned");

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getCameraPermissions();
  }, []);

  const handleBarcodeScanned = async ({ type, data }) => {
    console.log("Barcode scanned:", type, data);
    setScanned(true);
    setData(`Scanned: ${data}`);

    Alert.alert("Scan Successful", `Barcode Type: ${type}\nData: ${data}`);

    try {
      console.log("Attempting to save scanned data to Firestore...");
      await addDoc(collection(db, "scannedCards"), {
        barcodeData: data,
        scanTime: new Date().toISOString(),
      });
      console.log("Scanned data successfully saved to Firestore!");
    } catch (error) {
      console.error("Error saving data to Firestore:", error);
    }
  };

  if (hasPermission === null) {
    return <View style={styles.center}><Text>Requesting camera permission...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.center}><Text>No access to camera</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Virtual Student Card</Text>
      <Text style={styles.text}>{data}</Text>

      {!scanned ? (
        <Camera
          style={styles.camera}
          onBarCodeScanned={scanned ? undefined : handleBarcodeScanned}
          ratio="16:9"
        />
      ) : (
        <Button title="Scan Again" onPress={() => setScanned(false)} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  camera: {
    width: "90%",
    height: 300,
    borderRadius: 10,
    overflow: "hidden",
  },
});

export default VirtualCardScreen;
