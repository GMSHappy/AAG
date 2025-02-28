import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";
import { auth } from "../firebaseConfig";

const LoadingScreen = ({ navigation }) => {
  useEffect(() => {
    const checkAuthStatus = () => { 
      auth.onAuthStateChanged((user) => { 
        if (user) {
          navigation.replace("Home"); // Navigate to Home if logged in
        } else {
          navigation.replace("Login"); // Navigate to Login if not logged in
        }
      });
    };

    setTimeout(() => {
      checkAuthStatus();
    }, 4000); // Adjust loading duration

  }, [navigation]);

  return (
    <View style={styles.container}>
      <LottieView
        source={require("../assets/main-scene.json")} // Play the animation
        autoPlay
        loop={false} // Stops when done
        style={styles.animation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // Change this if using dark mode
  },
  animation: {
    width: 300,  // Adjust animation size
    height: 300,
  },
});

export default LoadingScreen;
