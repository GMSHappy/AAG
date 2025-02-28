import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Switch } from "react-native";
import { Avatar, Button, Text, Card, List, Divider, TextInput } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import * as ImagePicker from "expo-image-picker";
import { auth, db } from "../firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const user = auth.currentUser;

  if (!user) return null; // ✅ Prevent crash if user is not logged in

  const [userImage, setUserImage] = useState(null);
  const [userName, setUserName] = useState(user?.displayName || "User");
  const [bio, setBio] = useState("This is my bio...");
  const [birthday, setBirthday] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserImage(data.imageUri);
          setBio(data.bio || "This is my bio...");
          setBirthday(data.birthday || "");
          setDarkMode(data.darkMode || false);
        }
      } catch (error) {
        Alert.alert("Error", "Could not load profile data.");
      } finally {
        setTimeout(() => setLoading(false), 3000);
      }
    };
    fetchUserProfile();
  }, [user]);

  const updateUserProfile = async (updates) => {
    try {
      await setDoc(doc(db, "users", user.uid), updates, { merge: true });
    } catch {
      Alert.alert("Error", "Could not update profile data.");
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    updateUserProfile({ darkMode: !darkMode });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView source={require("../assets/loading-animation.json")} autoPlay loop style={styles.loadingAnimation} />
      </View>
    );
  }

  return (
    <View style={[styles.container, darkMode && styles.darkBackground]}>
      <Card style={[styles.card, darkMode && styles.darkCard]}>
        <Card.Content>
          <Avatar.Image
            size={150}
            source={userImage ? { uri: userImage } : require("../assets/default-avatar.png")}
            style={styles.avatar}
          />
          <Text variant="titleLarge" style={[styles.name, darkMode && styles.darkText]}>
            {userName}
          </Text>

          <TextInput
            mode="outlined"
            label="Enter Your Birthday"
            value={birthday}
            onChangeText={setBirthday}
            onBlur={() => updateUserProfile({ birthday })}
            style={styles.input}
          />

          {editing ? (
            <TextInput
              mode="outlined"
              label="Edit Bio"
              value={bio}
              onChangeText={setBio}
              style={[styles.input, darkMode && styles.darkInput]}
              onBlur={() => {
                setEditing(false);
                updateUserProfile({ bio });
              }}
              autoFocus
              theme={{ colors: { text: darkMode ? "#FFF" : "#000" } }}
            />
          ) : (
            <Text
              variant="bodySmall"
              style={[styles.bio, darkMode && styles.darkText]}
              onPress={() => setEditing(true)}
            >
              {bio}
            </Text>
          )}

          <Button mode="contained" onPress={() => navigation.navigate("VirtualCard")} style={styles.button}>
            Virtual Student Card
          </Button>
        </Card.Content>
      </Card>

      <View style={[styles.menuContainer, darkMode && styles.darkMenu]}>
        <List.Item
          title="Dark Mode"
          left={() => <List.Icon icon="theme-light-dark" />}
          right={() => <Switch value={darkMode} onValueChange={toggleDarkMode} />}
          titleStyle={darkMode ? styles.darkText : {}}
        />
        <Divider />
        <List.Item
          title="Logout"
          left={() => <List.Icon icon="logout" />}
          onPress={() => auth.signOut()}
          titleStyle={darkMode ? styles.darkText : {}}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F4F4F4" },
  loadingAnimation: { width: 250, height: 250 },
  container: { flex: 1, padding: 20, backgroundColor: "#F4F4F4" },
  darkBackground: { backgroundColor: "#121212" },
  card: { alignItems: "center", backgroundColor: "white", borderRadius: 10, elevation: 3, padding: 20, marginBottom: 20 },
  darkCard: { backgroundColor: "#1E1E1E" },
  avatar: { marginBottom: 15 },
  name: { fontSize: 22, fontWeight: "bold", marginBottom: 5, color: "#000" },
  darkText: { color: "#FFF" },
  input: { width: "100%", marginBottom: 10 },
  darkInput: { backgroundColor: "#1E1E1E", color: "#FFF" },
  button: { marginTop: 10, width: "100%" },
  menuContainer: { backgroundColor: "white", borderRadius: 10, elevation: 3, padding: 10 },
  darkMenu: { backgroundColor: "#1E1E1E" },
});

export default ProfileScreen;
