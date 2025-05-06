import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";

// Screens
import LoadingScreen from "./screens/LoadingScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import HomeScreen from "./screens/HomeScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import StudentCardCaptureScreen from "./screens/StudentCardCaptureScreen";
import StudentCardDisplayScreen from "./screens/StudentCardDisplayScreen";
import StudentIDScanner from './screens/StudentIDScanner';
import StudentNFCScanner from './screens/StudentNFCScanner';
import StudentCardScreenRouter from './screens/StudentCardScreenRouter';
import TimetableSetupScreen from "./screens/TimetableSetupScreen";
import TimetableScreen from "./screens/TimetableScreen";
import MyFeedScreen from "./screens/MyFeedScreen";
import ChatListScreen from "./screens/ChatListScreen";
import ChatScreen from "./screens/ChatScreen";
import CameraTestScreen from "./screens/CameraTestScreen";
import MazeMapScreen from "./screens/MazeMapScreen";
import FriendsScreen from "./screens/FriendsScreen";// New map screen

// New Screens for Home Features
import CreateEvent from "./screens/CreateEvent";
import CreateCommunity from "./screens/CreateCommunity";
import CommunityDetails from "./screens/CommunityDetails";
import SearchPeopleScreen from "./screens/SearchPeopleScreen";

// Navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigation (Home, Profile, Map, MyFeed, Timetable)
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: "#007AFF",
      tabBarInactiveTintColor: "#8e8e93",
      tabBarStyle: { backgroundColor: "#f4f4f4", height: 60 },
    }}
  >
    <Tab.Screen
      name="HomeScreen"
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
      name="Map"
      component={MazeMapScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="public" color={color} size={size} />
        ),
        tabBarLabel: "Map",
      }}
    />
    <Tab.Screen
      name="MyFeed"
      component={MyFeedScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="dynamic-feed" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="Timetable"
      component={TimetableScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="event" color={color} size={size} />
        ),
      }}
    />
  </Tab.Navigator>
);

// App Navigator
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Loading"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Loading" component={LoadingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={MainTabs} />
        <Stack.Screen name="SearchPeopleScreen" component={SearchPeopleScreen} />
        <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />

        <Stack.Screen
          name="StudentCardCaptureScreen"
          component={StudentCardCaptureScreen}
        />
        <Stack.Screen
          name="StudentCardDisplay"
          component={StudentCardDisplayScreen}
        />
        <Stack.Screen name="StudentIDScanner" component={StudentIDScanner} />
        <Stack.Screen
  name="StudentCardScreenRouter"
  component={StudentCardScreenRouter}
/>
        <Stack.Screen name="ChatListScreen" component={ChatListScreen} />
        <Stack.Screen name="FriendsScreen" component={FriendsScreen} />
        <Stack.Screen name="StudentNFCScanner" component={StudentNFCScanner} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="TimetableSetup" component={TimetableSetupScreen} />
        <Stack.Screen name="Timetable" component={TimetableScreen} />
        <Stack.Screen name="CameraTestScreen" component={CameraTestScreen} />
        {/* New routes for events and communities */}
        <Stack.Screen name="CreateEvent" component={CreateEvent} />
        <Stack.Screen name="CreateCommunity" component={CreateCommunity} />
        <Stack.Screen name="CommunityDetails" component={CommunityDetails} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
