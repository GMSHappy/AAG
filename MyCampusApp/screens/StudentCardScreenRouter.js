// ✅ StudentCardScreenRouter.js
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const StudentCardScreenRouter = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const checkCardData = async () => {
      try {
        const data = await AsyncStorage.getItem('studentCardData');
        if (data) {
          navigation.replace('StudentCardDisplay');
        } else {
          navigation.replace('StudentCardCaptureScreen');
        }
      } catch (error) {
        console.error('Failed to check card data', error);
        navigation.replace('StudentCardCaptureScreen');
      }
    };

    checkCardData();
  }, []);

  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
});

export default StudentCardScreenRouter;
