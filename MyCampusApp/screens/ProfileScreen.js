// Live-updating ProfileScreen.js with real-time friends count
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, TouchableOpacity, Modal } from "react-native";
import { Avatar, Button, Text, Divider } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { auth, db } from "../firebaseConfig";
import { doc, setDoc, getDoc, onSnapshot, collection } from "firebase/firestore";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import EditProfile from "../EditProfile";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const user = auth.currentUser;

  if (!user) return null;

  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [birthday, setBirthday] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [friendsCount, setFriendsCount] = useState(0);

  // Fetch user profile from Firestore
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
        }
      } catch (error) {
        Alert.alert("Error", "Could not load profile data.");
      }
    };

    const unsubscribeFriends = onSnapshot(collection(db, "users", user.uid, "friends"), (snapshot) => {
      setFriendsCount(snapshot.size);
    });

    fetchUserProfile();
    return () => unsubscribeFriends();
  }, [user]);

  const updateUserProfile = async (updatedData) => {
    try {
      setEditProfileVisible(false);
      await setDoc(doc(db, "users", user.uid), updatedData, { merge: true });
      setFirstName(updatedData.firstName);
      setLastName(updatedData.lastName);
      setBio(updatedData.bio);
      setBirthday(updatedData.birthday);
    } catch (error) {
      Alert.alert("Error", "Could not update profile data.");
      console.error("Firestore Update Error:", error);
    }
  };

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
      setUploadVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setUploadVisible(true)}>
        <Avatar.Image
          size={140}
          source={imageUri ? { uri: imageUri } : require("../assets/default-avatar.png")}
        />
      </TouchableOpacity>

      <Text style={styles.name}>{firstName} {lastName}</Text>
      <Text style={styles.friendsCount}>👥 Friends: {friendsCount}</Text>
      <Text style={styles.bio}>{bio}</Text>

      <Button
        icon="pencil"
        mode="contained"
        onPress={() => setEditProfileVisible(true)}
        style={styles.editButton}
      >
        Edit Profile
      </Button>

      <Divider style={styles.divider} />

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("FriendsScreen")}> 
          <Icon name="account-group" size={24} color="#666" />
          <Text style={styles.menuText}>Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("ChatListScreen")}> 
          <Icon name="message" size={24} color="#666" />
          <Text style={styles.menuText}>Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("MyCourses")}> 
          <Icon name="book" size={24} color="#666" />
          <Text style={styles.menuText}>My Courses</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Settings")}> 
          <Icon name="cog" size={24} color="#666" />
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("StudentCardScreenRouter")}> 
          <Icon name="camera" size={24} color="#666" />
          <View style={{ marginLeft: 15 }}>
            <Text style={styles.menuText}>Virtual Card</Text>
          </View>
        </TouchableOpacity>
      </View>

      {editProfileVisible && (
        <EditProfile
          user={{ firstName, lastName, bio, birthday }}
          onSave={updateUserProfile}
          onCancel={() => setEditProfileVisible(false)}
        />
      )}

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