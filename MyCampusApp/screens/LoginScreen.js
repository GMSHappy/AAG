import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "Welcome back!");
      navigation.replace("Home");
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    }
    
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

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

      <TouchableOpacity onPress={handleLogin} style={styles.button}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.linkText}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: { borderBottomWidth: 1, marginBottom: 10, padding: 8 },
  button: { backgroundColor: "blue", padding: 12, borderRadius: 5, marginTop: 10 },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
  linkText: { marginTop: 10, color: "blue", textAlign: "center" }
});

export default LoginScreen;
