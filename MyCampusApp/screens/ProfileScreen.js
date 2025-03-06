import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, TouchableOpacity, Modal } from "react-native";
import { Avatar, Button, Text, Divider } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { auth, db } from "../firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import EditProfile from "../EditProfile"; // Import the new component

const ProfileScreen = () => {
  const navigation = useNavigation();
  const user = auth.currentUser;

  if (!user) return null;

  const [imageUri, setImageUri] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [birthday, setBirthday] = useState("");
  const [friendsCount, setFriendsCount] = useState(0);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [editProfileVisible, setEditProfileVisible] = useState(false);

  // Load user info from Firestore
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setImageUri(data.imageUri || null);
          setFirstName(data.firstName || "");
          setLastName(data.lastName || "");
          setBio(data.bio || "");
          setBirthday(data.birthday || "");
          setFriendsCount(data.friendsCount || 0);
        }
      } catch (error) {
        Alert.alert("Error", "Could not load profile data.");
      }
    };
    fetchUserProfile();
  }, [user]);

  // Update user info in Firestore
  const updateUserProfile = async (updatedData) => {
    try {
      await setDoc(doc(db, "users", user.uid), updatedData, { merge: true });
      setFirstName(updatedData.firstName);
      setLastName(updatedData.lastName);
      setBio(updatedData.bio);
      setBirthday(updatedData.birthday);
      setEditProfileVisible(false);
    } catch (error) {
      Alert.alert("Error", "Could not update profile data.");
    }
  };

  // Pick an image from camera or gallery
  const pickImage = async (fromCamera = false) => {
    let result;
    if (fromCamera) {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
    }

    if (!result.canceled && result.assets.length > 0) {
      const newImageUri = result.assets[0].uri;
      setImageUri(newImageUri);
      await setDoc(doc(db, "users", user.uid), { imageUri: newImageUri }, { merge: true });
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile Avatar */}
      <TouchableOpacity onPress={() => setUploadVisible(true)}>
        <Avatar.Image
          size={140}
          source={imageUri ? { uri: imageUri } : require("../assets/default-avatar.png")}
        />
      </TouchableOpacity>

      {/* Basic user info */}
      <Text style={styles.name}>
        {firstName} {lastName}
      </Text>
      <Text style={styles.friendsCount}>👥 Friends: {friendsCount}</Text>
      <Text style={styles.bio}>{bio}</Text>

      {/* Edit Profile Button */}
      <Button
        icon="pencil"
        mode="contained"
        onPress={() => setEditProfileVisible(true)}
        style={styles.editButton}
      >
        Edit Profile
      </Button>

      <Divider style={styles.divider} />

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Friends")}
        >
          <Icon name="account-group" size={24} color="#666" />
          <Text style={styles.menuText}>Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Messages")}
        >
          <Icon name="message" size={24} color="#666" />
          <Text style={styles.menuText}>Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("MyCourses")}
        >
          <Icon name="book" size={24} color="#666" />
          <Text style={styles.menuText}>My Courses</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Settings")}
        >
          <Icon name="cog" size={24} color="#666" />
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Edit Profile */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editProfileVisible}
        onRequestClose={() => setEditProfileVisible(false)}
      >
        {/*
          Let EditProfile handle its own overlay + white card.
          Just pass the data and callbacks to it.
        */}
        <EditProfile
          user={{ firstName, lastName, bio, birthday }}
          onSave={updateUserProfile}
          onCancel={() => setEditProfileVisible(false)}
        />
      </Modal>

      {/* Modal for Upload Profile Picture */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={uploadVisible}
        onRequestClose={() => setUploadVisible(false)}
      >
        <View style={styles.uploadModalContainer}>
          <View style={styles.uploadModalContent}>
            <Text style={styles.uploadModalTitle}>Upload Profile Picture</Text>
            <Button mode="contained" onPress={() => pickImage(true)}>
              📷 Take Photo
            </Button>
            <Button mode="contained" onPress={() => pickImage(false)}>
              🖼️ Choose from Gallery
            </Button>
            <Button onPress={() => setUploadVisible(false)}>Cancel</Button>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ============== STYLES for ProfileScreen ==============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: "#FFF",
    alignItems: "center",
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 10,
  },
  friendsCount: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  bio: {
    fontSize: 18,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
  editButton: {
    marginTop: 20,
  },
  divider: {
    width: "100%",
    marginVertical: 20,
  },
  menuContainer: {
    width: "100%",
    marginTop: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuText: {
    fontSize: 18,
    color: "#333",
    marginLeft: 15,
  },

  // ============== Upload Picture Modal styles ==============
  uploadModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  uploadModalContent: {
    width: "90%",
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 10,
  },
  uploadModalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
});

export default ProfileScreen;
