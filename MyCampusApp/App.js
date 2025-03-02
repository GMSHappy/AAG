import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons"; // Icons for navigation tabs

// Screens
import LoadingScreen from "./screens/LoadingScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import MyFeed from "./screens/MyFeed";
import VirtualCardScreen from "./screens/VirtualCardScreen"; // ✅ Ensure this is correctly exported in VirtualCardScreen.js

// Create Navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigation (Home & Profile)
const MainTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="home" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="person" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="MyFeed"
      component={MyFeed}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="dynamic-feed" color={color} size={size} />
        ),
      }}
    />

  </Tab.Navigator>
);

// Main App Navigator
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Loading" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Loading" component={LoadingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={MainTabs} />
        <Stack.Screen name="MyFeed" component={MyFeed}/>
        <Stack.Screen name="VirtualCard" component={VirtualCardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
