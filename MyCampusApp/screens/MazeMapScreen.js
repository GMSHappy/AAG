import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  StatusBar,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';

const MazeMapScreen = () => {
  const [mapUrl, setMapUrl] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Enable location to view your position on the map.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const dynamicUrl = `https://use.mazemap.com/#v=1&config=TUDUBLIN&center=${longitude},${latitude}&zoom=18&zlevel=1`;
      setMapUrl(dynamicUrl);
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Location Error', 'Could not fetch location.');
    }
  };

  useEffect(() => {
    loadLocation();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLocation();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {mapUrl ? (
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <WebView
            source={{ uri: mapUrl }}
            style={styles.webview}
            startInLoadingState={true}
          />
        </ScrollView>
      ) : (
        <ActivityIndicator size="large" color="#007AFF" style={{ flex: 1 }} />
      )}
    </SafeAreaView>
  );
};

export default MazeMapScreen;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  webview: {
    flex: 1,
  },
});
