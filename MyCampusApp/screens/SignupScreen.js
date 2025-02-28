import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { auth } from "../firebaseConfig";  // Correctly import auth from firebaseConfig.js
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore"; // Import Firestore functions
import { db } from "../firebaseConfig";  // Correctly import db from firebaseConfig.js

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState(""); 

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password.");
      return;
    }

    try {
      // 1. Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user; // Get user object

      // 2. Write user data to Firestore, using the UID as document ID
      await setDoc(doc(db, "users", user.uid), { 
        email: user.email,       // Save email
        name: "Your Name",       // Save the name (you can replace with dynamic input later)
        password: user.password, // Save password (you should not save password in plaintext in real app)
        uid: user.uid,           // Store UID
        createdAt: new Date()    // Timestamp when account is created
      });

      Alert.alert("Success", "Account created! Please login.");
      navigation.replace("Login"); // Navigate to Login screen
    } catch (error) {
      Alert.alert("Signup Failed", error.message); // Show error message if signup fails
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
        style={styles.input} 
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput 
        placeholder="Password" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
        style={styles.input} 
      />

      <TouchableOpacity onPress={handleSignup} style={styles.button}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.linkText}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: { borderBottomWidth: 1, marginBottom: 10, padding: 8 },
  button: { backgroundColor: "green", padding: 12, borderRadius: 5, marginTop: 10 },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
  linkText: { marginTop: 10, color: "blue", textAlign: "center" }
});

export default SignupScreen;
