import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";

const db = getFirestore(app);
const { width } = Dimensions.get('window');
const scanFrameWidth = width * 0.6;
const scanFrameHeight = 200;

const CameraTestScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      setPermission({ ...permission, granted: cameraStatus.status === 'granted' });
    })();
  }, []);

  const takeBarcodePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      // Pass the image URI back to the StudentCardCaptureScreen
      navigation.navigate('StudentCardCapture', { barcodeUri: result.assets[0].uri });
    } else {
      navigation.goBack(); // Go back if the user cancels
    }
  };

  const saveScannedCard = async () => {
    if (!image) {
      Alert.alert("No Photo Taken", "Please take a photo of your student card.");
      return;
    }

    setIsLoading(true);
    try {
      // For this example, we're just saving the image URI.
      // In a real application, you might want to extract data from the image.
      await addDoc(collection(db, "scannedCardPhotos"), {
        imageUri: image,
        scanTime: new Date().toISOString(),
      });
      Alert.alert("✅ Saved", "Student card photo saved successfully!");
      setImage(null); // Reset for next scan
    } catch (error) {
      console.error("Firestore Error:", error);
      Alert.alert("Error", "Failed to save card photo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>No access to camera</Text>
        <Button title="Request Permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎓 Virtual Student Card</Text>
      <Text style={styles.text}>
        Capture a photo of your student card within the frame.
      </Text>

      {!image ? (
        <View style={styles.cameraContainer}>
          <TouchableOpacity style={styles.takePictureButton} onPress={takeBarcodePhoto}>
            <View style={styles.scanFrame} />
            <Text style={styles.takePictureButtonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: image }} style={styles.imagePreview} />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => setImage(null)}>
              <Text style={styles.buttonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#34C759" }]}
              onPress={saveScannedCard}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Save Card Info</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#F9F9F9",
    alignItems: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  text: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
    color: "#555",
  },
  cameraContainer: {
    width: "100%",
    height: 350,
    overflow: "hidden",
    borderRadius: 20,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  takePictureButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: scanFrameWidth,
    height: scanFrameHeight,
    borderWidth: 2,
    borderColor: "#00FF00",
    borderRadius: 10,
    position: "absolute",
  },
  takePictureButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  imagePreviewContainer: {
    width: "100%",
    height: 350,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  imagePreview: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 15,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: "45%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});

export default CameraTestScreen;