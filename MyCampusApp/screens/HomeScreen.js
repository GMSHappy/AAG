import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { auth } from '../firebaseConfig'; // Import Firebase Auth
import { signOut } from 'firebase/auth';

const HomeScreen = ({ navigation }) => {
  
  // Logout Function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login'); // Navigate back to Login screen
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.headerText}>
            Welcome to MyCampus!
          </Text>
          <Text variant="bodyMedium" style={styles.bodyText}>
            Stay connected with your university community.
          </Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('Profile')}
            style={styles.button}
          >
            Go to Profile
          </Button>
          <Button 
            mode="outlined" 
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            Logout
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  card: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 3,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
    width: '100%',
  },
  logoutButton: {
    marginTop: 10,
    width: '100%',
    borderColor: 'red',
  },
});

export default HomeScreen;
